const config = require("../configs");
const axios = require("axios");
const paymentSchema = require("../models/paymentSchema");
const {
  purchaseAiraloPackages,
  purchaseEsimPackages,
  airaloTopupOrder,
  esimTopupOrder,
} = require("./airaloController");
const mongoose = require("mongoose");
const Users = require("../models/users");
const {
  purchaseEsimVaultPackages,
  esimVaultTopupOrder,
} = require("./esimVaultController");
const packageSchema = require("../models/packagesSchema");
const { dicount, discount } = require("../constants/airloToken");
const i18next = require("i18next");
const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);

const createStripeSession = async (req, res) => {
  const bundleDetail = req.body;
  let lang, currency, balance;
  const cur = req.body.currency || "USD";
  currency = cur;
  const User = await Users.findOne({
    _id: new mongoose.Types.ObjectId(bundleDetail.userId),
  });
  if (req.body.lang == "in") {
    lang = "id";
  } else if (req.body.lang == "ar") {
    lang = "en";
  } else if (req.body.lang == "en-US") {
    lang = "en";
  } else {
    lang = req.body.lang;
  }
  if (req.body.key === "esimgo") {
    let token_config = {
      method: "get",
      maxBodyLength: Infinity,
      url: `${config.esim_url}organisation?`,
      headers: {
        "X-API-Key": config.esim_key,
        "Content-Type": "application/json",
      },
    };

    const response = await axios(token_config);
    balance = response.data.organisations[0].balance;
  }
  try {
    let priceInCents;
    if (currency === "USD") {
      priceInCents = Math.round(req.body.price * 100);
    } else {
      const response = await axios.get(
        `https://api.exchangerate-api.com/v4/latest/USD`
      );
      const data = response.data;
      const exchangeRate = data.rates[cur];
      priceInCents = Math.round(req.body.price * exchangeRate * 100);
    }
    if (req.body.key === "esimgo" && balance < req.body.price) {
      return res.status(500).json({
        success: false,
        message: i18next.t("stripErrorMessage", { lng: req.body.lang }),
      });
    }
    const imageUrl =
      req.body.key === "airalo"
        ? config.server_url + "/public/images/airalo.png"
        : req.body.key === "esimVault"
        ? config.server_url + "/public/images/esimVault.png"
        : config.server_url + "/public/images/esimgo.png";

    const product = await stripe.products.create({
      name:
        req.body.key === "esimVault"
          ? `${req.body.dataAmount} GB - ${req.body.duration} Days`
          : req.body.package_id,
      description: req.body.description,
      images: [imageUrl, req.body.imageUrl],
    });

    const price = await stripe.prices.create({
      currency: cur,
      product: product.id,
      unit_amount: priceInCents,
    });
    const sessionData = {
      line_items: [
        {
          price: price.id,
          quantity: 1,
        },
      ],
      mode: "payment",
      success_url: `${config.frontend_url}/data-usage?payment_success=true`,
      cancel_url: `${config.frontend_url}/offer-detail?id=${encodeURIComponent(
        req.body.package_id
      )}&key=${bundleDetail.key}&canceled=true`,
      metadata: {
        package_id: bundleDetail.package_id ?? bundleDetail.name,
        package_key: bundleDetail.key,
        userId: bundleDetail.userId,
        parent_id: User?.parent_id?.toString() ?? null,
        event: "simPurchase",
      },
      locale: lang,
    };
    if (!User?.parent_id) {
      const coupon = await stripe.coupons.create({
        percent_off: discount,
        duration: "once",
        name: "10% lifetime discount",
      });
      sessionData.discounts = [
        {
          coupon: coupon.id,
        },
      ];
    }
    const session = await stripe.checkout.sessions.create(sessionData);

    res.send({ url: session.url });
  } catch (err) {
    console.log(err);
    return res.status(500).json({
      success: false,
      error: err.message,
    });
  }
};
const sessionEndedSuccessfully = async (subscription, res) => {
  try {
    const package_id = subscription.metadata.package_id;
    const package_key = subscription.metadata.package_key;
    const parent_id = subscription.metadata.parent_id;
    const userId = subscription.metadata.userId;
    const event = subscription.metadata.event;

    const orignalPackage = await packageSchema.findOne({ package_id });
    const discountedPrice = orignalPackage.price * ((100 - discount) / 100);
    let payment_Data = {
      sessionObject: subscription,
      priceInCents: orignalPackage.price,
      name: subscription.customer_details.name,
      email: subscription.customer_details.email,
      phone: subscription.customer_details?.phone ?? "",
      status: subscription.status,
      userId: userId,
      discountedPrice: parent_id !== "" ? "" : discountedPrice,
      discountedPer: parent_id !== "" ? "" : discount,
      parent_id: parent_id !== "" ? parent_id : null,
      event: event,
    };

    await paymentSchema.create(payment_Data);

    //Purchase airalo sim
    if (package_key === "airalo") {
      await purchaseAiraloPackages(package_id, package_key, userId, parent_id);
    } else if (package_key === "esimgo") {
      await purchaseEsimPackages(package_id, package_key, userId, parent_id);
    } else if (package_key === "esimVault") {
      await purchaseEsimVaultPackages(
        package_id,
        package_key,
        userId,
        parent_id
      );
    }
  } catch (err) {
    console.log(err);
    return res.status(500).json({
      success: false,
      error: err.message,
    });
  }
};
const topupEndedSuccessfully = async (subscription, res) => {
  try {
    const package_id = subscription.metadata.package_id;
    const package_key = subscription.metadata.package_key;
    const userId = subscription.metadata.userId;
    const event = subscription.metadata.event;
    const parent_id = subscription.metadata.parent_id;
    const iccid = subscription.metadata.iccid;
    const orignalPackage = await packageSchema.findOne({ package_id });
    const discountedPrice = subscription.metadata.discountedPrice;
    const price = subscription.metadata.price;

    let priceInCents;
    if (subscription.currency === "USD") {
      priceInCents = subscription.amount_total;
    } else {
      const response = await axios.get(
        `https://api.exchangerate-api.com/v4/latest/USD`
      );
      const data = response.data;
      const exchangeRate = data.rates[subscription.currency.toUpperCase()];

      priceInCents = Math.round(subscription.amount_total / exchangeRate);
    }

    let payment_Data = {
      sessionObject: subscription,
      priceInCents: price * 100,
      name: subscription.customer_details.name,
      email: subscription.customer_details.email,
      phone: subscription.customer_details?.phone ?? "",
      status: subscription.status,
      discountedPrice: parent_id !== "" ? "" : discountedPrice,
      discountedPer: parent_id !== "" ? "" : discount,
      userId: userId,
      event: event,
      parent_id: parent_id !== "" ? parent_id : null,
    };

    //Purchase airalo sim
    if (package_key === "airalo") {
      await airaloTopupOrder(package_id, package_key, userId, iccid, parent_id);
    } else if (package_key === "esimgo") {
      await esimTopupOrder(package_id, package_key, userId, iccid, parent_id);
    } else {
      await esimVaultTopupOrder(
        package_id,
        package_key,
        userId,
        iccid,
        parent_id
      );
    }

    await paymentSchema.create(payment_Data);

    res.send({ url: session.url });
  } catch (err) {
    return res.status(500).json({
      success: false,
      error: err.message,
    });
  }
};
const createStripeTopUpSession = async (req, res) => {
  const topUp = req.body;
  let balance;

  const User = await Users.findOne({
    _id: new mongoose.Types.ObjectId(topUp.userId),
  });
  let lang;
  if (req.body.lang == "in") {
    lang = "id";
  } else if (req.body.lang == "ar") {
    lang = "en";
  } else if (req.body.lang == "en-US") {
    lang = "en";
  } else {
    lang = req.body.lang;
  }
  let currency;
  const cur = req.body.currency || "USD";
  if (req.body.key === "esimgo") {
    let token_config = {
      method: "get",
      maxBodyLength: Infinity,
      url: `${config.esim_url}organisation?`,
      headers: {
        "X-API-Key": config.esim_key,
        "Content-Type": "application/json",
      },
    };

    const response = await axios(token_config);
    balance = response.data.organisations[0].balance;
  }
  try {
    if (currency === "USD") {
      priceInCents = Math.round(req.body.price * 100);
    } else {
      const response = await axios.get(
        `https://api.exchangerate-api.com/v4/latest/USD`
      );
      const data = response.data;
      const exchangeRate = data.rates[cur];
      priceInCents = Math.round(req.body.price * exchangeRate * 100);
    }

    if (
      req.body.key === "esimgo" &&
      balance > priceInCents / 100 &&
      req.body.key !== "airalo" &&
      req.body.key !== "esimVault"
    ) {
      return res.status(500).json({
        success: false,
        error: i18next.t("stripErrorMessage", { lng: req.body.lang }),
        message: i18next.t("stripErrorMessage", { lng: req.body.lang }),
      });
    }
    const imageUrl =
      req.body.key === "airalo"
        ? config.server_url + "/public/images/airalo.png"
        : req.body.key === "esimVault"
        ? config.server_url + "/public/images/esimVault.png"
        : config.server_url + "/public/images/esimgo.png";

    const product = await stripe.products.create({
      name: req.body.title,
      description: req.body.short_info ?? req.body.title,
      images: [imageUrl],
    });

    const price = await stripe.prices.create({
      currency: cur,
      product: product.id,
      unit_amount: priceInCents,
    });

    const sessionData = {
      line_items: [
        {
          price: price.id,
          quantity: 1,
        },
      ],
      mode: "payment",
      success_url: `${config.frontend_url}/topup-listing?payment_success=true`,
      cancel_url: `${config.frontend_url}/top-up`,
      metadata: {
        package_id: topUp.id,
        package_key: topUp.key,
        userId: topUp.userId,
        event: topUp.type,
        parent_id: User?.parent_id?.toString() ?? null,
        iccid: req.body.iccid,
        discountedPrice: topUp.discountedPrice,
        price: topUp.price,
      },
      locale: lang,
    };
    if (!User?.parent_id) {
      const coupon = await stripe.coupons.create({
        percent_off: discount,
        duration: "once",
        name: "10% lifetime discount",
      });
      sessionData.discounts = [
        {
          coupon: coupon.id,
        },
      ];
    }
    const session = await stripe.checkout.sessions.create(sessionData);

    res.send({ url: session.url });
  } catch (err) {
    console.log(err);
    return res.status(500).json({
      success: false,
      error: err.message,
    });
  }
};
module.exports = {
  createStripeSession,
  sessionEndedSuccessfully,
  createStripeTopUpSession,
  topupEndedSuccessfully,
};
