const express = require("express");
const { upload } = require("../helpers/uploadFile");
const {
  registerVendor,
  getVendors,
  deleteVendor,
} = require("../controller/vendorController");

const app = express();

app.post(
  "/registerVendor",
  upload.fields([
    { name: "gst_img", maxCount: 1 },
    { name: "pan_img", maxCount: 1 },
    { name: "cheque_img", maxCount: 1 },
  ]),
  registerVendor
);
app.get("/getVendors", getVendors);
app.delete("/deleteVendor", deleteVendor);
