const express = require("express");
const config = require("../configs");
const axios = require("axios");
const i18next = require("i18next");
const i18nextMiddleware = require("i18next-http-middleware");
const Backend = require("i18next-fs-backend");
const { CountriesList } = require("../constants/countries");
const { airloToken, discount } = require("../constants/airloToken");
const packageSchema = require("../models/packagesSchema");
const { v4: uuidv4 } = require("uuid");
const fs = require("fs");

let lang = "en";
const bundleDetails = async (req, res) => {
  try {
    const { name, key } = req.query;
    lang = req.query.lang;
    let countriesString = "";

    if (!name) {
      return res.status(400).json({
        success: false,
        error: i18next.t("bundleNameRequired", { lng: lang }),
      });
    }
    const package = await packageSchema.findOne({
      package_id: name,
      type: "sim",
    });
    if (key === "airalo") {
      const bundleDetail = {
        imageUrl: package.imageUrl,
        name: package.name,
        countriesString: package?.countriesNames ?? "",
        countries: package?.countries ?? "",
        country: package?.country ?? "",
        duration: package?.validity ?? "",
        dataAmount: package?.data ?? "",
        price: package?.price ?? "",
        discountedPrice: (package?.price * (1 - discount / 100)).toFixed(2),
        description: package?.name ?? "",
        package_id: package?.package_id ?? "",
        countries_count:
          package.countriesArray.length > 1 ? package.countriesArray.length : 0,
        key: package?.key ?? "",
        reigonal: package?.reigonal ?? "",
        countriesArray: package?.countriesArray ?? [],
      };
      return res.status(200).json({
        success: true,
        data: bundleDetail,
        message: i18next.t("bundleDetailsSuccess", { lng: lang }),
      });
    } else {
      const bundleDetail = {
        imageUrl: package.imageUrl,
        name: package.name,
        countriesString: package?.countriesNames ?? "",
        countries: package?.countries ?? "",
        duration: package?.validity ?? "",
        dataAmount: package?.data ?? "",
        price: package?.price ?? "",
        discountedPrice: (package?.price * (1 - discount / 100)).toFixed(2),
        description: package?.name ?? "",
        package_id: package?.package_id ?? "",
        country: package?.country ?? "",
        key: package?.key ?? "",
        reigonal: package?.reigonal ?? "",
        countriesArray: package?.countriesArray ?? [],
        countries_count:
          package.countriesArray.length > 1 ? package.countriesArray.length : 0,
      };
      return res.status(200).json({
        success: true,
        data: bundleDetail,
        message: i18next.t("bundleDetailsSuccess", { lng: lang }),
      });
    }
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: i18next.t("internalServerError", { lng: lang }),
      message: error,
    });
  }
};

const bundlesList = async (req, res) => {
  try {
    const { page, perPage, data, days, price } = req.query;
    let countriesFilter = req.query.countries || ["SA"];
    let region = req.query.region;
    lang = req.query.lang;
    let bundlesArray = [];
    let countriesNames = "";
    if (region === "Global") {
      region = "Global";
    } else {
      region =
        CountriesList.countries.find(
          (country) => country.country_name === region
        )?.region ?? region;
    }
    let Packages;
    if (region) {
      Packages = await packageSchema.aggregate([
        {
          $match: {
            reigonal: region,
            type: "sim",
            is_active: true,
          },
        },
        { $sort: { price: 1 } },
      ]);
    } else if (countriesFilter.length === 1) {
      var regex = new RegExp(countriesFilter[0], "i");
      var filterArray = Array.isArray(countriesFilter[0])
        ? countriesFilter[0]
        : [countriesFilter[0]];

      Packages = await packageSchema.aggregate([
        {
          $match: {
            $or: [
              {
                country_code: { $regex: regex },
                type: "sim",
                is_active: true,
              },
              {
                key: "esimVault",
                "countriesArray.iso": { $in: filterArray },
                is_active: true,
              },
            ],
          },
        },
        { $sort: { price: 1 } },
      ]);
    } else if (countriesFilter.length >= 2) {
      const regex = new RegExp(countriesFilter[0], "i");
      const countriesFilterCopy = [...countriesFilter];
      const firstCountry = countriesFilterCopy.shift();
      const filterArray = Array.isArray(countriesFilterCopy)
        ? countriesFilterCopy
        : [];

      Packages = await packageSchema.aggregate([
        {
          $match: {
            $or: [
              {
                key: "esimVault",
                "countriesArray.iso": { $all: filterArray },
                type: "sim",
                is_active: true,
              },
              {
                country_code: { $regex: new RegExp(firstCountry, "i") },
                "countriesArray.iso": { $all: filterArray },
                type: "sim",
                is_active: true,
              },
            ],
          },
        },
      ]);
    }
    for (const bundle of Packages) {
      if (bundle.data >= 1)
        bundlesArray.push({
          name: bundle.name,
          orignalName: bundle.package_id,
          data: bundle.data,
          validity: bundle.validity,
          price: bundle.price,
          discountedPrice: (bundle?.price * (1 - discount / 100)).toFixed(2),
          countries: bundle.countries,
          imageUrl: bundle.imageUrl,
          key: bundle.key,
          country_name: bundle.country,
          countries_count:
            bundle.countriesArray.length > 1 ? bundle.countriesArray.length : 0,
        });
    }
    if (bundlesArray.length === 0) {
      return res.status(200).json({
        success: true,
        data: [],
        message: i18next.t("noRecordsFound", { lng: lang }),
      });
    }
    bundlesArray.sort((a, b) => a.price - b.price);

    return res.status(200).json({
      success: true,
      data: bundlesArray,
      message: i18next.t("bundleDetailsSuccess", { lng: lang }),
    });
  } catch (error) {
    console.log(error);
    let errorMessage = i18next.t("internalServerError", { lng: lang });
    if (error.response && error.response.status === 400) {
      errorMessage =
        error.response.data.message || i18next.t("badRequest", { lng: lang });
    }
    return res.status(500).json({
      success: false,
      error: errorMessage,
    });
  }
};

const saveBundlesList = async (req, res) => {
  try {
    const { limit = 100 } = req.query;
    lang = req.query.lang;
    let bundlesArray = [];
    let countriesString = "";
    let countriesNames = "";
    let page = 1;
    let totalPages = 1;

    // Loop until all pages are fetched
    while (page <= totalPages) {
      const token_config = {
        method: "get",
        url: `${config.esim_url}catalogue?`,
        headers: {
          "X-API-Key": config.esim_key,
          "Content-Type": "application/json",
        },
        params: {
          page,
          limit,
        },
      };

      const response = await axios(token_config);

      const simData = response.data;

      if (totalPages === 1) {
        totalPages = Math.ceil(simData.rows / limit);
      }

      for (const bundle of simData.bundles) {
        if (bundle.roamingEnabled.length !== 0) {
          const firstCountry =
            bundle.roamingEnabled.length > 0
              ? bundle.roamingEnabled[0].name
              : "Unknown";
          const remainingCount = bundle.roamingEnabled.length - 1;
          countriesString = `${i18next.t("worksIn", {
            lng: lang,
          })} ${firstCountry} ${i18next.t("and", {
            lng: lang,
          })} ${remainingCount} ${i18next.t("moreDestinations", {
            lng: lang,
          })}`;

          countriesNames = bundle.roamingEnabled
            .map((element) => element.name)
            .join(", ");
        } else {
          countriesString = i18next.t("roamingNotEnabled", { lng: lang });
        }
        const data = {
          uuid: uuidv4(),
          name: bundle.name,
          data: bundle.dataAmount / 1000,
          validity: bundle.duration,
          price: bundle.price,
          countries: countriesString,
          countriesNames: countriesNames,
          imageUrl: bundle.imageUrl,
          key: "esimgo",
        };
        bundlesArray.push(data);
        await packageSchema.create(data);
      }

      page++;
    }

    if (bundlesArray.length === 0) {
      return res.status(200).json({
        success: true,
        data: [],
        message: i18next.t("noRecordsFound", { lng: lang }),
      });
    }

    const fileName = "bundles.json";
    fs.writeFileSync(fileName, JSON.stringify(bundlesArray));

    return res.status(200).json({
      success: true,
      data: bundlesArray,
      message: i18next.t("bundleDetailsSuccess", { lng: lang }),
    });
  } catch (error) {
    let errorMessage = i18next.t("internalServerError", { lng: lang });
    if (error.response && error.response.status === 400) {
      errorMessage =
        error.response.data.message || i18next.t("badRequest", { lng: lang });
    }
    console.log(error);
    return res.status(500).json({
      success: false,
      error: errorMessage,
    });
  }
};

async function getAiraloPackages(countries, region, res, req) {
  try {
    const country = countries,
      limit = 100;
    lang = req.query.lang || "en";
    const accessToken = `Bearer ${airloToken}`;

    const token_config = {
      method: "get",
      maxBodyLength: Infinity,
      url: config.airalo_sandbox_url + "/packages",
      params: {},
      headers: {
        Accept: "application/json",
        Authorization: accessToken,
      },
    };

    if (region !== "Global") {
      if (country) token_config.params["filter[country]"] = country;
    } else {
      token_config.params["filter[type]"] = region;
    }

    if (limit) token_config.params["limit"] = limit;

    const response = await axios(token_config);

    return response.data.data;
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: error.message,
    });
  }
}

const purchaseEsimGo = async (req, res) => {
  let config = {
    method: "post",
    maxBodyLength: Infinity,
    url: "https://api.esim-go.com/v2.3/esims/apply",
    headers: {
      "X-API-Key": "d8jlVS8Nt82AvxLHIwW5nXFHBdif97FymuT6NrsJ",
      "Content-Type": "application/json",
    },
    data: {
      bundle: "esim_1GB_7D_SD_V2", // Name of the Bundle to apply
      repeat: 1, // Optional: How many eSIMs will be assigned with this bundle applied
    },
  };

  axios
    .request(config)
    .then((response) => {})
    .catch((error) => {
      console.log(error);
    });
};

const saveBundlesCron = async () => {
  console.log("Fetching Esimgo packages");
  try {
    const limit = 100;
    let bundlesArray = [];
    let countriesString = "";
    let countriesNames = "";
    let page = 1;
    let totalPages = 1;
    let countriesArray = [];
    let reigonal = "";
    while (page <= totalPages) {
      const token_config = {
        method: "get",
        url: `${config.esim_url}catalogue?`,
        headers: {
          "X-API-Key": config.esim_key,
          "Content-Type": "application/json",
        },
        params: {
          page,
          limit,
        },
      };

      const response = await axios(token_config);

      const simData = response.data;

      if (totalPages === 1) {
        totalPages = Math.ceil(simData.rows / limit);
      }

      for (const bundle of simData.bundles) {
        countriesString = "";
        countriesNames = "";
        countriesArray = [];
        reigonal = "";
        if (bundle.roamingEnabled.length) {
          const remainingCount = bundle.roamingEnabled.length;
          countriesString = `Works in ${bundle.countries[0].name} and ${remainingCount} more destinations`;

          countriesNames = bundle.roamingEnabled
            .map((element) => element.name)
            .join(", ");

          countriesArray.push(
            ...bundle.roamingEnabled.map((element) => ({
              iso: element.iso,
              name: element.name,
            }))
          );

          reigonal = bundle.countries[0].region;
        } else {
          countriesString = `Works in ${bundle.countries[0].name}`;
          countriesNames = countriesString.replace("Works in", "").trim();
          countriesArray.push({
            iso: bundle.countries[0].iso,
            name: bundle.countries[0].name,
          });
          reigonal = bundle.countries[0].region;
        }
        const data = {
          uuid: uuidv4(),
          name: bundle.description,
          data: bundle.dataAmount / 1000,
          validity: bundle.duration,
          packagePrice: bundle.price,
          currentPrice: bundle.price * 1.3,
          price: bundle.price * 1.3,
          countries: countriesString,
          countriesNames: countriesNames,
          imageUrl: bundle.imageUrl,
          key: "esimgo",
          package_id: bundle.name,
          countriesArray: countriesArray,
          reigonal: reigonal,
          is_active: true,
          country: bundle.countries[0].name,
          country_code: bundle.countries[0].iso,
          type: "sim",
        };
        bundlesArray.push(data);
        console.log(bundlesArray.length);
        const existingPackage = await packageSchema.findOne({
          package_id: bundle.name,
          key: "esimgo",
        });

        if (existingPackage) {
          await packageSchema.updateMany(
            { _id: existingPackage._id },
            {
              $set: {
                key: "esimgo",
                imageUrl: bundle.imageUrl,
                countriesNames: countriesNames,
                countries: countriesString,
                packagePrice: bundle.price,
                currentPrice: bundle.price * 1.3,
                price: bundle.price * 1.3,
                validity: bundle.duration,
                data: bundle.dataAmount / 1000,
                name: bundle.description,
                countriesArray: countriesArray,
                country: bundle.countries[0].name,
                country_code: bundle.countries[0].iso,
                type: "sim",
                is_active: true,
              },
            }
          );
        } else {
          await packageSchema.create(data);
        }
      }
      page++;
    }
    console.log("Fetching done");
    const existingPackages = await packageSchema.find({ key: "esimgo" });

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
    console.log(error);
  }
};
module.exports = {
  bundleDetails,
  bundlesList,
  saveBundlesList,
  purchaseEsimGo,
  saveBundlesCron,
};
