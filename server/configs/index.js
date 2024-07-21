import path from 'path';
import dotenv from 'dotenv';
import { env } from 'node:process';
dotenv.config();

const config = {
  port: env.SERVER_PORT??8000,
  expiresIn: env.TOKEN_EXPIRES_IN??"1d",
  jwtSecret: env.MY_SECRET_KEY ?? "#j1K!9la$qL2Pz#0",

  databaseUrl:env.DATABASE_URL ?? "mongodb+srv://rehmanali65922:jaadooghar65922@localcluster01.41zgdzu.mongodb.net/jaadooghar",
  frontend_url:env.FRONTEND_URL,
  server_url:env.SERVER_URL,

  esim_vault_url:env.ESIM_VAULT_URL ?? "https://ocs-api.esimvault.cloud/v1?token=Sh2FsmDFxWNg976saqwIF04T",

  esim_key: env.ESIM_KEY ?? "d8jlVS8Nt82AvxLHIwW5nXFHBdif97FymuT6NrsJ",
  esim_url: env.ESIM_url ?? "https://api.esim-go.com/v2.3/",

  airalo_sandbox_url: env.AIRALO_SANDBOX_URL ?? "https://sandbox-partners-api.airalo.com/v1",
  airalo_client_id: env.AIRALO_CLIENT_ID ?? "d607a06739088bce2a1b78eaf15b360e",
  airalo_client_secret: env.AIRALO_CLIENT_SECRET ?? "I24jkoFLmJqXDE7bttvYJk8bdbcrsXzy43vfe5gg",
  airalo_grant_type: env.AIRALO_GRANT_TYPE ?? "client_credentials",

  stripe_secret_key: env.STRIPE_SECRET_KEY,
  webhook_secret_key: env.WEBHOOK_SECRET_KEY,
  stripe_public_key: env.STRIPE_PUBLIC_KEY,

  // email: env.USER_EMAIL ?? "762c31001@smtp-brevo.com",
  // password: env.EMAIL_PASSWORD ?? "8D5mj6sbLhcSEMpP",
  // host: env.SMTP_HOST ?? "smtp-relay.brevo.com",
  // smtp_port: env.SMTP_PORT ?? "587",
  // support_email: env.SUPPORT_EMAIL ?? "support@gleesim.com",
  email: env.USER_EMAIL??"noreply@jaadooghar.com",
  password: env.EMAIL_PASSWORD??"Noconnectjaadooghar#@!09",
  host: env.SMTP_HOST??"smtp.hostinger.com",
  smtp_port: env.SMTP_PORT??465,
  support_email: env.SUPPORT_EMAIL??"noreply@jaadooghar.com",
};

export default config;
