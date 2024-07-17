const path = require("path");
require("dotenv").config();

const config = {
  port: 8000,
  expiresIn: "1d",
  jwtSecret: process.env.MY_SECRET_KEY ?? "#j1K!9la$qL2Pz#0",

  databaseUrl: process.env.DATABASE_URL,
  frontend_url: process.env.FRONTEND_URL,
  server_url: process.env.SERVER_URL,

  esim_vault_url:
    process.env.ESIM_VAULT_URL ??
    " https://ocs-api.esimvault.cloud/v1?token=Sh2FsmDFxWNg976saqwIF04T",

  esim_key: process.env.ESIM_KEY ?? "d8jlVS8Nt82AvxLHIwW5nXFHBdif97FymuT6NrsJ",
  esim_url: process.env.ESIM_url ?? "https://api.esim-go.com/v2.3/",

  airalo_sandbox_url:
    process.env.AIRALO_SANDBOX_URL ??
    "https://sandbox-partners-api.airalo.com/v1",
  airalo_client_id:
    process.env.AIRALO_CLIENT_ID ?? "d607a06739088bce2a1b78eaf15b360e",
  airalo_client_secret:
    process.env.AIRALO_CLIENT_SECRET ??
    "I24jkoFLmJqXDE7bttvYJk8bdbcrsXzy43vfe5gg",
  airalo_grant_type: process.env.AIRALO_GRANT_TYPE ?? "client_credentials",

  stripe_secret_key: process.env.STRIPE_SECRET_KEY,
  webhook_secret_key: process.env.WEBHOOK_SECRET_KEY,
  stripe_public_key: process.env.STRIPE_PUBLIC_KEY,

  email: process.env.USER_EMAIL ?? "762c31001@smtp-brevo.com",
  password: process.env.EMAIL_PASSWORD ?? "8D5mj6sbLhcSEMpP",
  host: process.env.SMTP_HOST ?? "smtp-relay.brevo.com",
  smtp_port: process.env.SMTP_PORT ?? "587",
  support_email: process.env.SUPPORT_EMAIL ?? "support@gleesim.com",
};

module.exports = config;
