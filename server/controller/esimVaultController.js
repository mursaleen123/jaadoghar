const express = require("express");
const config = require("../configs");
const axios = require("axios");
const i18next = require("i18next");
const i18nextMiddleware = require("i18next-http-middleware");
const Backend = require("i18next-fs-backend");
const { v4: uuidv4 } = require("uuid");
const fs = require("fs");
const packageSchema = require("../models/packagesSchema");
const { airloToken, discount } = require("../constants/airloToken");
const sims = require("../models/AiraloSimSchema");
const sendEmail = require("../nodemailer");
const { bundleDetails } = require("./guestController");
const Users = require("../models/users");
const { CountriesList } = require("../constants/countries");
const topupSchema = require("../models/topUpSchema");
const mongoose = require("mongoose");
const path = require("path");
const handlebars = require("handlebars");
const DataUsage = require("../models/DataUsageSchema");
const { generateQrCode } = require("../helpers/generateQrCode");

let lang;
const oderListingTemplateSource = fs.readFileSync(
  path.join(__dirname, "../templates/en/orderList.handlebars"),
  "utf8"
);
const orderListingEmail = handlebars.compile(oderListingTemplateSource);

const saveEsimVaultPackagesCron = async () => {
  console.log("Fetching EsimVault packages");

  let bundlesArray = [];

  const bodyTemplate = {
    listPrepaidPackageTemplate: {},
  };

  const token_config = {
    method: "post",
    url: config.esim_vault_url,
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
    },
    data: bodyTemplate,
  };

  const response = await axios(token_config);
  const packages = response.data.listPrepaidPackageTemplate.template;

  for (const bundle of packages) {
    let countriesNames = "";
    const countriesArray = [];

    const body = {
      listLocationZoneElement: bundle.locationzoneid,
    };
    token_config.data = body;
    const response = await axios(token_config);
    const locationZones = response.data.listLocationZoneElement.operator;

    countriesNames += `Works in ${locationZones[0].countryName}`;

    let countriesData;
    const uniqueCountries = new Set();
    for (const zone of locationZones) {
      uniqueCountries.add(zone.countryName);
    }
    const uniqueCountryCount = uniqueCountries.size;
    const firstCountry = Array.from(uniqueCountries)[0];
    if (uniqueCountryCount > 1) {
      countriesData = `Works in ${firstCountry} & ${
        uniqueCountryCount - 1
      } more destinations`;
    } else {
      countriesData = `Works in ${firstCountry}`;
    }
    const uniqueCountryNames = new Set(
      locationZones.map((element) => element.countryName)
    );
    const countriesList = [...uniqueCountryNames].join(", ");

    locationZones.forEach((element) => {
      const iso = element.countryIso2.toUpperCase();
      const name = element.countryName;
      if (!countriesArray.some((country) => country.iso === iso)) {
        countriesArray.push({ iso, name });
      }
    });
    const data = {
      uuid: uuidv4(),
      name: bundle.prepaidpackagetemplatename,
      data: bundle.databyte / 1073741824,
      validity: bundle.perioddays,
      packagePrice: bundle.cost,
      currentPrice: (bundle.cost * 1.3).toFixed(2),
      price: (bundle.cost * 1.3).toFixed(2),
      countries: countriesData,
      countriesNames: countriesList,
      imageUrl: config.server_url + "/public/images/esimVault.png",
      key: "esimVault",
      package_id: bundle.prepaidpackagetemplateid,
      countriesArray: countriesArray,
      reigonal: locationZones[0].continent,
      country: locationZones[0].countryName,
      country_code: locationZones[0].countryIso2.toUpperCase(),
      reigonal: locationZones[0].continent,
      type: "sim",
      is_active: true,
    };

    bundlesArray.push(data);

    const existingPackage = await packageSchema.findOne({
      package_id: bundle.prepaidpackagetemplateid,
      key: "esimVault",
    });
    if (existingPackage) {
      await packageSchema.updateMany(
        { _id: existingPackage._id },
        {
          $set: {
            name: bundle.prepaidpackagetemplatename,
            data: bundle.databyte / 1073741824,
            validity: bundle.perioddays,
            packagePrice: bundle.cost,
            currentPrice: (bundle.cost * 1.3).toFixed(2),
            price: (bundle.cost * 1.3).toFixed(2),
            countries: countriesData,
            countriesNames: countriesList,
            imageUrl: config.server_url + "/public/images/esimVault.png",
            key: "esimVault",
            countriesArray: countriesArray,
            reigonal: locationZones[0].continent,
            country: locationZones[0].countryName,
            country_code: locationZones[0].countryIso2.toUpperCase(),
            type: "sim",
            reigonal: locationZones[0].continent,
            is_active: true,
          },
        }
      );
    } else {
      await packageSchema.create(data);
    }
    countriesNames = "";
  }

  const existingPackages = await packageSchema.find({ key: "esimVault" });

  for (const existingPackage of existingPackages) {
    const foundInNewData = bundlesArray.some(
      (bundle) => bundle.package_id === existingPackage.package_id
    );
    if (!foundInNewData) {
      await packageSchema.updateOne(
        { _id: existingPackage._id },
        { $set: { is_active: false } }
      );
    }
  }

  return 1;
};
const purchaseEsimVaultPackages = async (
  package_id,
  package_key,
  userId,
  parent_id
) => {
  try {
    const user = await Users.findOne({ _id: userId }).select(
      "_id name phone_no email otpVerified countries role timestamps"
    );
    const orignalPackage = await packageSchema.findOne({ package_id });
    const discountedPrice = orignalPackage.price * ((100 - discount) / 100);
    const bodyTemplate = {
      affectPackageToSubscriber: {
        packageTemplateId: package_id,
        accountForSubs: 1058,
      },
    };

    const token_config = {
      method: "post",
      url: config.esim_vault_url,
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      data: bodyTemplate,
    };

    const response = await axios(token_config);
    const simAssigned = response.data.affectPackageToSubscriber;
    // const simAssigned = {
    //   iccid: "8937204016153355214",
    //   smdpServer: "smdp.io",
    //   activationCode: "K2-1Y1XZ3-19BXXJ1",
    //   urlQrCode: "LPA:1$smdp.io$K2-1Y1XZ3-19BXXJ1",
    //   subscriberId: 1057698,
    //   esimId: 1076928,
    //   subsPackageId: 2501196,
    //   userSimName: "Euro International Communications_1057698",
    // };

    const simDetails = {
      userId,
      vendorType: orignalPackage.key,
      created_at: new Date().toISOString(),
      price: orignalPackage.price,
      data: orignalPackage.data,
      discountedPer: parent_id !== "" ? "" : discount,
      discountedPrice: parent_id !== "" ? "" : discountedPrice,
      package: orignalPackage.name,
      validity: orignalPackage.validity,
      esim_type: "Prepaid",
      code: simAssigned.subscriberId,
      type: "sim",
      quantity: "1",
      package_id: orignalPackage.package_id,
      currency: "USD",
      sims: [
        {
          created_at: new Date().toISOString(),
          iccid: simAssigned.iccid,
          lpa: simAssigned.smdpAddress,
          matching_id: simAssigned.activationCode,
          qrcode: simAssigned.urlQrCode,
          is_roaming: true,
        },
      ],
    };

    const url = await generateQrCode(simAssigned.urlQrCode);
    simDetails.sims[0].qrcode_url = url;

    const purchasedSim = await sims.create(simDetails);
    const mailOptions = {
      from: config.support_email,
      to: user.email,
      subject: "*Sim Purchased*",
      html: orderListingEmail({
        name: user.name,
        matching_id: simAssigned.activationCode,
        qrcode: simAssigned.urlQrCode,
        qrcode_url: url,
      }),
    };
    await sendEmail(mailOptions);
  } catch (error) {
    console.error("Internal server error:", error);
  }
};
const esimVaultTopupOrder = async (
  package_id,
  package_key,
  userId,
  simId,
  parent_id
) => {
  try {
    const user = await Users.findOne({ _id: userId });
    const existingPackage = await packageSchema.findOne({ package_id });
    const simsRecords = await sims.findOne({ userId, "sims.iccid": simId });
    const iccid = simsRecords.sims[0].iccid;
    const description = `Topup ( ${iccid} )`;
    const discountedPrice = existingPackage.price * ((100 - discount) / 100);

    const bodyTemplate = {
      listPrepaidPackageTemplate: {
        packageTemplateId: package_id,
        subscriber: {
          iccid,
        },
      },
    };

    const token_config = {
      method: "post",
      url: config.esim_vault_url,
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      data: bodyTemplate,
    };

    const response = await axios(token_config);
    const topup = response.affectPackageToSubscriber;

    // const topup = {
    //   iccid: "8937204016153355214",
    //   smdpServer: "smdp.io",
    //   activationCode: "K2-1Y1XZ3-19BXXJ1",
    //   urlQrCode: "LPA:1$smdp.io$K2-1Y1XZ3-19BXXJ1",
    //   subscriberId: 1057698,
    //   esimId: 1076928,
    //   subsPackageId: 2501196,
    //   userSimName: "Euro International Communications_1057698",
    // };
    const topupPurchased = await topupSchema.create({
      currency: "USD",
      description: topup.userSimName,
      esim_type: "prepaid",
      iccid: iccid,
      validity: existingPackage.validity,
      package: existingPackage.name,
      data: existingPackage.data,
      price: existingPackage.price,
      discountedPrice: parent_id !== "" ? "" : discountedPrice,
      discountedPer: parent_id !== "" ? "" : discount,
      installation_guides: "",
      vendorType: package_key,
      userId,
      iccid,
      package_id,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const fetchesimVaultPackageUseage = async () => {
  console.log("Fetching EsimVault Useagemeine ");

  try {
    const simsR = await sims.find({ vendorType: "esimVault" });

    simsR.forEach(async (simsRecords) => {
      const bodyTemplate = {
        getSubscriberActivePeriod: {
          subscriberId: simsRecords.code,
        },
      };

      const token_config = {
        method: "post",
        url: config.esim_vault_url,
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
        data: bodyTemplate,
      };

      const response = await axios(token_config);
      const dataUseage = response.data.getSubscriberActivePeriod;

      const activePeriod = dataUseage?.period;

      if (activePeriod) {
        const body = {
          subscriberUsageOverPeriod: {
            subscriber: {
              subscriberId: simsRecords.code,
            },
            period: {
              start: activePeriod.start,
              end: activePeriod.end,
            },
          },
        };

        const token = {
          method: "post",
          url: config.esim_vault_url,
          headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
          },
          data: body,
        };

        const responseData = await axios(token);
        // const dataUsed = responseData.data.subscriberUsageOverPeriod.usages[0].total.quantityPerType['33'];
        const dataUsed =
          responseData.data.subscriberUsageOverPeriod?.total?.quantityPerType[
            "33"
          ] / 1048576;
        if (dataUsed) {
          const existingPackage = await packageSchema.findOne({
            package_id: simsRecords.package_id,
            key: "esimVault",
          });
          const createdAt = new Date(simsRecords.created_at);
          const validityDays = parseInt(existingPackage.validity);
          const expiredAt = new Date(createdAt);
          expiredAt.setDate(expiredAt.getDate() + validityDays);

          const totalDataMB = existingPackage.data * 1024;
          const remainingDataMB = totalDataMB - dataUsed;

          const data = {
            remaining: remainingDataMB.toFixed(2),
            total: existingPackage.data,
            is_unlimited: "false",
            iccid: simsRecords.sims.iccid,
            vendorType: "esimVault",
            userId: simsRecords.userId,
            simId: simsRecords._id,
            expired_at: expiredAt,
          };

          const existingRecord = await DataUsage.findOneAndUpdate(
            { simId: simsRecords._id, userId: simsRecords.userId },
            { $set: { ...data, vendorType: "esimVault" } },
            { upsert: true, new: true }
          );
        }
      }
    });
  } catch (error) {
    console.error("Error fetching data:", error);
    throw error;
  }
};

module.exports = {
  saveEsimVaultPackagesCron,
  purchaseEsimVaultPackages,
  esimVaultTopupOrder,
  fetchesimVaultPackageUseage,
};
