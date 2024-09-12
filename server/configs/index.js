import path from "path";
import dotenv from "dotenv";
import { env } from "node:process";
dotenv.config();

const config = {
  port: env.SERVER_PORT ?? 9000,
  expiresIn: env.TOKEN_EXPIRES_IN ?? "1d",
  jwtSecret: env.MY_SECRET_KEY ?? "#j1K!9la$qL2Pz#0",

  databaseUrl:
    env.DATABASE_URL ??
    "mongodb+srv://rehmanali65922:jaadooghar65922@localcluster01.41zgdzu.mongodb.net/jaadooghar",
  frontend_url: env.FRONTEND_URL,
  server_url: env.SERVER_URL ?? "http://localhost:9000",

  email: process.env.USER_EMAIL ?? "noreply@jaadooghar.com",
  password: process.env.EMAIL_PASSWORD ?? "Noconnectjaadooghar#@!09",
  host: process.env.SMTP_HOST ?? "smtp.hostinger.com",
  smtp_port: process.env.SMTP_PORT ?? "465",
  support_email: process.env.SUPPORT_EMAIL ?? "noreply@jaadooghar.com",
};

export default config;
