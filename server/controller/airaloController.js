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

const getAiraloToken = async (req, res) => {
  try {
    const token_config = {
      method: "post",
      url: config.airalo_sandbox_url + "/token",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      data: {
        client_id: config.airalo_client_id,
        client_secret: config.airalo_client_secret,
        grant_type: config.airalo_grant_type,
      },
    };

    const response = await axios(token_config);

    return res.status(200).json({
      success: true,
      data: response.data,
      message: "Token generated successfully",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: "Internal server error",
    });
  }
};
const getAiraloSims = async (req, res) => {
  try {
    const accessToken = req.headers.authorization;
    lang = req.query.lang || "en";

    const token_config = {
      method: "get",
      maxBodyLength: Infinity,
      url: config.airalo_sandbox_url + "/sims",
      headers: {
        Accept: "application/json",
        Authorization: accessToken,
      },
    };

    const response = await axios(token_config);

    return res.status(200).json({
      success: true,
      data: response.data,
      message: i18next.t("eSIMsFetchedSuccessfully", { lng: lang }),
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: error.response.data.message,
    });
  }
};
const getAiraloSimsDetails = async (req, res) => {
  try {
    const accessToken = req.headers.authorization;
    lang = req.query.lang || "en";
    const simIccid = req.params.sim_iccid;

    if (!simIccid) {
      return res.status(400).json({
        success: false,
        error: i18next.t("simIdRequired", { lng: lang }),
      });
    }
    const token_config = {
      method: "get",
      maxBodyLength: Infinity,
      url: config.airalo_sandbox_url + "/sims",
      headers: {
        Accept: "application/json",
        Authorization: accessToken,
      },
    };
    if (simIccid) token_config.url += `/${simIccid}?`;

    const response = await axios(token_config);

    return res.status(200).json({
      success: true,
      data: response.data,
      message: i18next.t("eSIMsFetchedSuccessfully", { lng: lang }),
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: error,
    });
  }
};
const getAiraloPackages = async (req, res) => {
  try {
    const country = req.query.country;
    lang = req.query.lang || "en";
    const accessToken = req.headers.authorization;

    const token_config = {
      method: "get",
      maxBodyLength: Infinity,
      url: config.airalo_sandbox_url + "/packages",
      headers: {
        Accept: "application/json",
        Authorization: accessToken,
      },
    };
    if (country) token_config.url += `?country=${country}`;
    const response = await axios(token_config);

    return res.status(200).json({
      success: true,
      data: response.data,
      message: i18next.t("eSIMsPackagesFetchedSuccessfully", { lng: lang }),
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};
const saveAiraloPackages = async (req, res) => {
  try {
    const country = req.query.country;
    const lang = req.query.lang || "en";
    const accessToken = req.headers.authorization;
    let bundlesArray = [];
    let allPackages = [];

    let countriesNames = "";
    const fetchData = async (url) => {
      try {
        const token_config = {
          method: "get",
          maxBodyLength: Infinity,
          url,
          headers: {
            Accept: "application/json",
            Authorization: accessToken,
          },
        };

        const response = await axios(token_config);
        const responseData = response.data;

        if (!responseData) {
          throw new Error("Invalid response data");
        }

        if (Array.isArray(responseData.data)) {
          allPackages.push(...responseData.data);
        } else {
          Object.values(responseData.data).forEach((item) => {
            allPackages.push(item);
          });
        }

        const nextPage = response.data.links.next;
        if (nextPage) {
          await fetchData(nextPage);
        }
      } catch (error) {
        console.error("Error fetching data:", error);
        throw error;
      }
    };

    const url =
      config.airalo_sandbox_url +
      "/packages" +
      (country ? `?country=${country}` : "");
    await fetchData(url);

    for (const bundle of allPackages) {
      if (bundle?.operators) {
        for (const operator of bundle.operators) {
          countriesNames +=
            "Works in " +
            operator.countries.map((element) => element.title).join(", ");

          if (operator?.packages) {
            for (const pkg of operator.packages) {
              const existingPackage = await packageSchema.findOne({
                name: pkg.title,
                data: pkg.amount / 1024,
                validity: pkg.day,
                price: pkg.price,
                countries: countriesNames,
                countriesNames: countriesNames,
                imageUrl: bundle.image.url,
                key: "airalo",
              });

              if (existingPackage) {
                await packageSchema.updateOne(
                  { _id: existingPackage._id },
                  { package_id: pkg.id }
                );
              } else {
                const data = {
                  uuid: uuidv4(),
                  name: pkg.title,
                  data: pkg.amount / 1024,
                  validity: pkg.day,
                  price: pkg.price,
                  countries: countriesNames,
                  countriesNames: countriesNames,
                  imageUrl: bundle.image.url,
                  key: "airalo",
                  package_id: pkg.id,
                };
                bundlesArray.push(data);
                await packageSchema.create(data);
              }
            }
          }
        }
      }
    }

    const fileName = "airalo_packages_data.json";
    fs.writeFileSync(fileName, JSON.stringify(bundlesArray));

    return res.status(200).json({
      success: true,
      message: i18next.t("eSIMsPackagesFetchedSuccessfully", { lng: lang }),
    });
  } catch (error) {
    console.error("Internal server error:", error);
    return res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};
const purchaseAiraloPackages = async (
  package_id,
  package_key,
  userId,
  parent_id
) => {
  try {
    const user = await Users.findOne({ _id: userId }).select(
      "_id name phone_no email otpVerified countries role timestamps"
    );
    var FormData = require("form-data");
    var data = new FormData();
    data.append("quantity", "1");
    data.append("package_id", package_id);
    data.append("type", "sim");

    const token_config = {
      method: "post",
      url: config.airalo_sandbox_url + "/orders",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
        Authorization: `Bearer ${airloToken}`,
        ...data.getHeaders(),
      },
      data: data,
    };

    const response = await axios(token_config);
    const package = response.data.data;

    const orignalPackage = await packageSchema.findOne({ package_id });
    const discountedPrice = orignalPackage.price * ((100 - discount) / 100);
    await sims.create({
      ...package,
      price: orignalPackage.price,
      discountedPrice: parent_id !== "" ? "" : discountedPrice,
      discountedPer: parent_id !== "" ? "" : discount,
      vendorType: package_key,
      userId,
      package_id,
    });
    const mailOptions = {
      from: config.support_email,
      to: user.email,
      subject: "*Sim Purchased*",
      html: orderListingEmail({
        name: user.name,
        matching_id: response.data.data.sims[0].matching_id,
        qrcode: response.data.data.sims[0].qrcode,
        qrcode_url: response.data.data.sims[0].qrcode_url,
      }),
    };
    await sendEmail(mailOptions);
  } catch (error) {
    console.error("Internal server error:", error);
  }
};
const purchaseEsimPackages = async (
  package_id,
  package_key,
  userId,
  parent_id
) => {
  try {
    const user = await Users.findOne({ _id: userId }).select(
      "_id name phone_no email otpVerified countries role timestamps"
    );
    let data = JSON.stringify({
      type: "transaction",
      assign: true,
      Order: [
        {
          type: "bundle",
          quantity: 1,
          item: package_id,
        },
      ],
    });
    let token_config = {
      method: "post",
      maxBodyLength: Infinity,
      url: `${config.esim_url}/orders`,
      headers: {
        "X-API-Key": config.esim_key,
        "Content-Type": "application/json",
      },
      data: data,
    };

    const response = await axios(token_config);
    const orderObject = response.data;
    // const orderObject = {
    //   order: [
    //     {
    //       esims: [
    //         {
    //           iccid: "8943108165005471086",
    //           matchingId: "JQ-1Z351U-1U6E44B",
    //           smdpAddress: "rsp.truphone.com",
    //         },
    //       ],
    //       type: "bundle",
    //       item: "esim_1GB_7D_GB_V2",
    //       iccids: ["8943108165005471086"],
    //       quantity: 1,
    //       subTotal: 1.36,
    //       pricePerUnit: 1.36,
    //     },
    //   ],
    //   total: 1.36,
    //   currency: "USD",
    //   status: "completed",
    //   statusMessage: "Order completed: 1 eSIMs assigned",
    //   orderReference: "de54db6c-5efc-46e4-986b-3eb7f175c5b3",
    //   createdDate: "2024-05-02T10:57:30.858475018Z",
    //   assigned: true,
    // };
    //bundle details
    const responseData = await axios.get(
      `${config.esim_url}/catalogue/bundle/${orderObject.order[0].item}`,
      {
        headers: {
          "X-API-Key": config.esim_key,
          "Content-Type": "application/json",
        },
      }
    );
    const simData = responseData.data;
    const orignalPackage = await packageSchema.findOne({ package_id });
    const discountedPrice = orignalPackage.price * ((100 - discount) / 100);
    const simDetails = {
      userId,
      vendorType: package_key,
      created_at: new Date().toISOString(),
      price: orignalPackage.price,
      data: orderObject.order[0].quantity,
      package: orderObject.order[0].item,
      discountedPrice: parent_id !== "" ? "" : discountedPrice,
      discountedPer: parent_id !== "" ? "" : discount,
      // validity: simData.dataAmount / 1000,
      validity: simData.duration,
      esim_type: "Prepaid",
      description: simData.description,
      type: orderObject.type,
      quantity: orderObject.quantity,
      package_id: orderObject.order[0].item,
      currency: "USD",
      sims: [
        {
          created_at: new Date().toISOString(),
          iccid: orderObject.order[0].esims[0].iccid,
          lpa: orderObject.order[0].esims[0].smdpAddress,
          matching_id: orderObject.order[0].esims[0].matchingId,
          qrcode: `LPA:1$${orderObject.order[0].esims[0].smdpAddress}$${orderObject.order[0].esims[0].matchingId}`,
          is_roaming: simData.roamingEnabled ? true : false,
        },
      ],
    };

    const url = await generateQrCode(
      `LPA:1$${orderObject.order[0].esims[0].smdpAddress}$${orderObject.order[0].esims[0].matchingId}`
    );

    simDetails.sims[0].qrcode_url = url;

    const purchasedSim = await sims.create(simDetails);
    const mailOptions = {
      from: config.support_email,
      to: user.email,
      subject: "*Sim Purchased*",
      html: orderListingEmail({
        name: user.name,
        matching_id: orderObject.order[0].esims[0].matchingId,
        qrcode: `LPA:1$${orderObject.order[0].esims[0].smdpAddress}$${orderObject.order[0].esims[0].matchingId}`,
        qrcode_url: url,
      }),
    };
    await sendEmail(mailOptions);
  } catch (error) {
    console.log(error);
    console.error("Internal server error:", error);
  }
};
const getAiraloTopupList = async (req, res) => {
  try {
    const { iccid, vendorType, lang, country_code } = req.query;
    const bundlesArray = [];
    let packageDetails = "";
    let package = "";
    if (!iccid) {
      return res.status(400).json({
        success: false,
        message: i18next.t("invalidPayload", { lng: lang }),
      });
    }

    const esims = await sims
      .findOne({
        "sims.iccid": iccid,
      })
      .sort({ createdAt: -1 });

    packageDetails = await packageSchema.findOne({
      package_id: esims.package_id,
    });
    if (vendorType === "airalo") {
      const token_config = {
        method: "get",
        maxBodyLength: Infinity,
        url: config.airalo_sandbox_url + `/sims/${iccid}/topups`,
        headers: {
          Accept: "application/json",
          Authorization: `Bearer ${airloToken}`,
        },
      };
      const response = await axios(token_config);
      response.data.data.forEach((topup) => {
        bundlesArray.push({
          id: topup.id,
          type: topup.type,
          amount: topup.amount / 1024,
          validity: topup.day,
          price: topup.price * 1.3,
          discountedPrice: (topup?.price * 1.3 * (1 - discount / 100)).toFixed(
            2
          ),
          day: topup.day,
          is_unlimited: topup.is_unlimited,
          title: topup.title,
          data: topup.data,
          short_info: topup.short_info,
          key: "airalo",
          country_name: packageDetails.country,
          country_code: packageDetails.country_code,
        });
      });
      // if (!country_code) {
      //   package = await packageSchema.find({
      //     country: packageDetails.country,
      //     key: "airalo",
      //     type: "topup",
      //   });
      // } else {
      //   if (country_code.length === 1) {
      //     package = await packageSchema.find({
      //       country_code: country_code[0],
      //       key: "airalo",
      //       type: "topup",
      //     });
      //   } else if (country_code.length >= 2) {
      //     package = await packageSchema.find({
      //       "countriesArray.iso": { $all: country_code },
      //       key: "airalo",
      //       type: "topup",
      //     });
      //   }
      // }
      // package.forEach((topup) => {
      //   if (topup.data >= 1)
      //     bundlesArray.push({
      //       id: topup.package_id,
      //       type: "topup",
      //       amount: topup.data,
      //       validity: topup.validity,
      //       price: topup.price,
      //       day: topup.validity,
      //       title: topup.name,
      //       data: topup.data,
      //       short_info: topup.countries,
      //       key: "airalo",
      //       country_name: packageDetails.country,
      //       country_code: packageDetails.country_code,
      //       countries_count:
      //         topup.countriesArray.length > 1 ? topup.countriesArray.length : 0,
      //     });
      // });
    } else if (vendorType === "esimgo") {
      if (!country_code) {
        package = await packageSchema.find({
          country: packageDetails.country,
          key: "esimgo",
        });
      } else {
        if (country_code.length === 1) {
          package = await packageSchema.find({
            country_code: country_code[0],
            key: "esimgo",
          });
        } else if (country_code.length >= 2) {
          package = await packageSchema.find({
            "countriesArray.iso": { $all: country_code },
            key: "esimgo",
          });
        }
      }

      package.forEach((topup) => {
        if (topup.data >= 1)
          bundlesArray.push({
            id: topup.package_id,
            type: "topup",
            amount: topup.data,
            validity: topup.validity,
            price: topup.price,
            discountedPrice: topup?.price * (1 - discount / 100).toFixed(2),
            day: topup.validity,
            title: topup.name,
            data: topup.data,
            short_info: topup.countries,
            key: "esimgo",
            country_name: packageDetails.country,
            country_code: packageDetails.country_code,
            countries_count:
              topup.countriesArray.length > 1 ? topup.countriesArray.length : 0,
          });
      });
    } else {
      if (!country_code) {
        package = await packageSchema.find({
          country: packageDetails.country,
          key: "esimVault",
        });
      } else {
        if (country_code.length === 1 && country_code[0] !== "undefined") {
          package = await packageSchema.find({
            country_code: country_code[0],
            key: "esimVault",
          });
        } else if (country_code.length >= 2) {
          package = await packageSchema.find({
            "countriesArray.iso": { $all: country_code },
            key: "esimVault",
          });
        }
      }
      package.forEach((topup) => {
        if (topup.data >= 1)
          bundlesArray.push({
            id: topup.package_id,
            type: "topup",
            amount: topup.data,
            validity: topup.validity,
            price: topup.price,
            discountedPrice: topup?.price * (1 - discount / 100).toFixed(2),
            day: topup.validity,
            title: topup.name,
            data: topup.data,
            short_info: topup.countries,
            key: "esimVault",
            country_name: packageDetails.country,
            country_code: packageDetails.country_code,
            countries_count:
              topup.countriesArray.length > 1 ? topup.countriesArray.length : 0,
          });
      });
    }
    return res.status(200).json({
      success: true,
      countryDetais: {
        country_name: packageDetails.country,
        country_code: packageDetails.country_code,
      },
      topups: bundlesArray,
      message: i18next.t("topupsFetched", { lng: lang }),
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
// const airaloTopupOrder = async (req, res) => {
//   try {
//     const { iccid, package_id, description } = req.body;
//     lang = req.querylang;
//     if (!iccid || !package_id) {
//       return res.status(400).json({
//         success: false,
//         message: i18next.t("invalidPayload", { lng: lang }),
//       });
//     }
//     var FormData = require("form-data");
//     var data = new FormData();
//     data.append("package_id", package_id);
//     data.append("iccid", iccid);
//     data.append("description", description);

//     const token_config = {
//       method: "post",
//       url: config.airalo_sandbox_url + "/orders/topups",
//       headers: {
//         Accept: "application/json",
//         "Content-Type": "application/json",
//         Authorization: `Bearer ${airloToken}`,
//         ...data.getHeaders(),
//       },
//       data: data,
//     };

//     const response = await axios(token_config);
//     const topup = response.data.data;

//     return res.status(200).json({
//       success: true,
//       topups: topup,
//       message: i18next.t("topupSucess", { lng: lang }),
//     });
//   } catch (error) {
//     res.status(500).json({ success: false, message: error.message });
//   }
// };
const airaloTopupOrder = async (
  package_id,
  package_key,
  userId,
  simId,
  parent_id
) => {
  try {
    const user = await Users.findOne({ _id: userId }).select(
      "_id name phone_no email otpVerified countries role timestamps"
    );
    const existingPackage = await packageSchema.findOne({
      package_id: package_id,
    });
    const discountedPrice = existingPackage.price * ((100 - discount) / 100);
    const simsRecords = await sims.findOne({
      userId,
      "sims.iccid": simId,
    });
    const iccid = simsRecords.sims[0].iccid;
    const description = `Topup ( ${iccid} )`;

    var FormData = require("form-data");
    var data = new FormData();
    data.append("package_id", package_id);
    data.append("iccid", iccid);
    data.append("description", description);

    const token_config = {
      method: "post",
      url: config.airalo_sandbox_url + "/orders/topups",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
        Authorization: `Bearer ${airloToken}`,
        ...data.getHeaders(),
      },
      data: data,
    };

    const response = await axios(token_config);
    const topup = response.data.data;

    const { price, ...topupWithoutPrice } = topup;

    await topupSchema.create({
      ...topupWithoutPrice,
      price: existingPackage.price,
      discountedPrice: parent_id !== "" ? "" : discountedPrice,
      discountedPer: parent_id !== "" ? "" : discount,
      vendorType: package_key,
      userId,
      iccid,
      package_id,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
const esimTopupOrder = async (
  package_id,
  package_key,
  userId,
  simId,
  parent_id
) => {
  try {
    const user = await Users.findOne({ _id: userId }).select(
      "_id name phone_no email otpVerified countries role timestamps"
    );
    const existingPackage = await packageSchema.findOne({
      package_id: package_id,
    });
    const discountedPrice = existingPackage.price * ((100 - discount) / 100);

    const simsRecords = await sims.findOne({ userId, "sims.iccid": simId });
    const iccid = simsRecords.sims[0].iccid;
    const description = `Topup ( ${iccid} )`;
    let data = JSON.stringify({
      type: "transaction",
      assign: true,
      Order: [
        {
          type: "bundle",
          quantity: 1,
          item: package_id,
          iccids: [iccid],
        },
      ],
    });
    let token_config = {
      method: "post",
      maxBodyLength: Infinity,
      url: `${config.esim_url}/orders`,
      headers: {
        "X-API-Key": config.esim_key,
        "Content-Type": "application/json",
      },
      data: data,
    };

    const response = await axios(token_config);
    const topup = response.data;
    // const topup = {
    //   order: [
    //     {
    //       esims: [Array],
    //       type: "bundle",
    //       item: "esim_2GB_15D_GB_V2",
    //       iccids: [Array],
    //       quantity: 1,
    //       subTotal: 2.16,
    //       pricePerUnit: 2.16,
    //     },
    //   ],
    //   total: 2.16,
    //   currency: "USD",
    //   status: "completed",
    //   statusMessage: "Order completed: 1 eSIMs assigned",
    //   orderReference: "d4bd0588-dc97-4b62-9453-b36c8bd877e9",
    //   createdDate: "2024-05-10T07:16:14.458881529Z",
    //   assigned: true,
    // };
    const topupPurchased = await topupSchema.create({
      code: topup.orderReference,
      currency: topup.currency,
      quantity: topup.order[0].quantity,
      type: "topup",
      description: topup.statusMessage,
      esim_type: "prepaid",
      iccid: iccid,
      validity: existingPackage.validity,
      package: existingPackage.name,
      data: existingPackage.data,
      price: existingPackage.price,
      discountedPrice: parent_id !== "" ? "" : discountedPrice,
      discountedPer: parent_id !== "" ? "" : discount,
      created_at: topup.createdDate,
      installation_guides: "",
      vendorType: package_key,
      userId,
      iccid,
      package_id,
    });

    // const mailOptions = {
    //   from: config.support_email,
    //   to: user.email,
    //   subject: "Topup Order",
    //   text: `Your Topup was Completed Successfully. Response Data: ${JSON.stringify(
    //     topupPurchased
    //   )}`,
    // };
    // await sendEmail(mailOptions);
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
const getTopups = async (req, res) => {
  try {
    const userId = req.userId;
    lang = req.query.lang || "en";

    if (!userId) {
      return res.status(400).json({
        success: false,
        message: i18next.t("invalidPayload", { lng: lang }),
      });
    }
    const user = await Users.findOne({ _id: userId }).select(
      "_id name phone_no email otpVerified countries role timestamps"
    );
    let topups;

    if (user?.role === "admin") {
      topups = await topupSchema
        .find({})
        .sort({ createdAt: -1 })
        .populate("userId");
    } else {
      topups = await topupSchema
        .find({ userId: new mongoose.Types.ObjectId(userId) })
        .sort({ createdAt: -1 })
        .populate("userId");
    }

    return res.status(200).json({
      success: true,
      data: topups,
      message: i18next.t("userFetched", { lng: lang }),
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
const saveAiraloPackagesCron = async () => {
  console.log("Fetching Airalo packages");
  try {
    let bundlesArray = [];
    let allPackages = [];

    let countriesNames = "";
    let countriesArray = [];
    let reigonal = "";

    const fetchData = async (url) => {
      try {
        const token_config = {
          method: "get",
          maxBodyLength: Infinity,
          url,
          headers: {
            Accept: "application/json",
            Authorization: `Bearer ${airloToken}`,
          },
        };

        const response = await axios(token_config);
        const responseData = response.data;

        if (!responseData) {
          throw new Error("Invalid response data");
        }

        if (Array.isArray(responseData.data)) {
          allPackages.push(...responseData.data);
        } else {
          Object.values(responseData.data).forEach((item) => {
            allPackages.push(item);
          });
        }

        const nextPage = response.data.links.next;
        if (nextPage) {
          await fetchData(nextPage);
        }
      } catch (error) {
        console.error("Error fetching data:", error);
        throw error;
      }
    };

    const url = config.airalo_sandbox_url + "/packages";
    await fetchData(url);

    for (const bundle of allPackages) {
      countriesNames += "Works in ";
      countriesArray = [];
      reigonal = "";
      if (bundle?.operators) {
        for (const operator of bundle.operators) {
          countriesNames += operator.countries
            .map((element) => element.title)
            .join(", ");
          countriesArray.push(
            ...operator.countries.map((element) => ({
              iso: element.country_code,
              name: element.title,
            }))
          );
          const country = bundle.title;
          const country_code = bundle.country_code;
          reigonal =
            operator?.type === "global"
              ? "Global"
              : CountriesList.countries.find(
                  (country) => country.country_name === bundle?.title
                )?.region ?? "local";

          if (operator?.packages) {
            for (const pkg of operator.packages) {
              const countriesList = countriesNames
                .replace("Works in", "")
                .trim();
              let countriesData;
              if (countriesList.split(",").length > 1) {
                countriesData = `Works in ${bundle.title} & ${
                  countriesList.split(",").length
                } more destinations`;
              } else {
                countriesData = `Works in ${bundle.title} `;
              }
              const data = {
                uuid: uuidv4(),
                name: pkg.title,
                data: pkg.amount / 1024,
                validity: pkg.day,
                packagePrice: pkg.price,
                currentPrice: pkg.price * 1.3,
                price: pkg.price * 1.3,
                countries: countriesData,
                countriesNames: countriesList,
                imageUrl: bundle.image.url,
                key: "airalo",
                package_id: pkg.id,
                countriesArray: countriesArray,
                reigonal: reigonal,
                country: country,
                country_code: country_code,
                type: pkg.type,
                is_active: true,
              };

              bundlesArray.push(data);

              const existingPackage = await packageSchema.findOne({
                package_id: pkg.id,
                key: "airalo",
              });
              if (existingPackage) {
                await packageSchema.updateMany(
                  { _id: existingPackage._id },
                  {
                    $set: {
                      key: "airalo",
                      imageUrl: bundle.image.url,
                      countriesNames: countriesList,
                      countries: countriesData,
                      packagePrice: pkg.price,
                      currentPrice: pkg.price * 1.3,
                      price: pkg.price * 1.3,
                      validity: pkg.day,
                      data: pkg.amount / 1024,
                      name: pkg.title,
                      countriesArray: countriesArray,
                      reigonal: reigonal,
                      country: country,
                      country_code: country_code,
                      type: pkg.type,
                      is_active: true,
                    },
                  }
                );
              } else {
                await packageSchema.create(data);
              }
            }
          }
        }
      }
      countriesNames = "";
    }

    const existingPackages = await packageSchema.find({ key: "airalo" });

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
  } catch (error) {
    console.error("Internal server error:", error);
  }
};
const fetchAiraloPackageUseage = async () => {
  console.log("Fetching Airalo Useage");

  try {
    const simsRecords = await sims.find({ vendorType: "airalo" });
    simsRecords.forEach(async (item) => {
      const url =
        config.airalo_sandbox_url + `/sims/${item.sims[0].iccid}/usage`;
      const token_config = {
        method: "get",
        maxBodyLength: Infinity,
        url,
        headers: {
          Accept: "application/json",
          Authorization: `Bearer ${airloToken}`,
        },
      };
      const response = await axios(token_config);
      const responseData = { ...response.data.data, iccid: item.sims[0].iccid };

      const existingRecord = await DataUsage.findOneAndUpdate(
        { simId: item._id, userId: item.userId },
        { $set: { ...responseData, vendorType: "airalo" } },
        { upsert: true, new: true }
      );
    });
  } catch (error) {
    console.error("Error fetching data:", error);
    throw error;
  }
};
const fetchEsimgoPackageUseage = async (matches) => {
  try {
    const simsRecords = await sims.findOne({
      "sims.iccid": matches.iccid,
      vendorType: "esimgo",
    });

    const existingRecord = await DataUsage.findOneAndUpdate(
      { simId: simsRecords._id, userId: existingRecord.userId },
      {
        $set: {
          remaining: matches.remainingQuantity,
          total: matches.initialQuantity,
          expired_at: matches.endTime,
          is_unlimited: "false",
          status: "ACTIVE",
          iccid: matches.iccid,
          vendorType: "esimgo",
        },
      },
      { upsert: true, new: true }
    );
  } catch (error) {
    console.error("Error fetching data:", error);
    throw error;
  }
};
module.exports = {
  getAiraloToken,
  getAiraloSims,
  getAiraloPackages,
  getAiraloSimsDetails,
  saveAiraloPackages,
  purchaseAiraloPackages,
  purchaseEsimPackages,
  getAiraloTopupList,
  airaloTopupOrder,
  saveAiraloPackagesCron,
  getTopups,
  esimTopupOrder,
  fetchAiraloPackageUseage,
  fetchEsimgoPackageUseage,
};
