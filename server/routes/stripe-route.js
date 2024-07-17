const express = require("express");
const { createStripeSession, createStripeTopUpSession } = require("../controller/stripe-controller");

const router = express.Router();

router.post("/create-checkout-session", createStripeSession);
router.post("/create-stripe-topUp-session", createStripeTopUpSession)
module.exports = router;
