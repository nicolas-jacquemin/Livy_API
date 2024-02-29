import express from "express";
import cors from 'cors';
import cookie from "cookie-parser";
import dotenv from "dotenv";
import import_routes from "./router.js";
import { main as db } from "./controllers/db.js";
import requireEnv from './requiredEnvVars.js'
dotenv.config();

const app = express();

const livyMajorError = (msg: string) => {
  console.log(msg)
  app.disable("x-powered-by");
  app.use("*", (req, res) => {
    res.status(500).json({
      error: "Livy major error: Please contact the administrator.",
      msg,
    });
  });
  app.listen(process.env.LV_SRV_PORT);
};

const check_env_vars = () => {
  for (let i = 0; i < requireEnv.length; i++) {
    if (!process.env[requireEnv[i]]) {
      return false;
    }
  }
  return true;
};

const launchApp = async () => {
  console.log("Launching app...");
  if (!check_env_vars()) {
      livyMajorError("Environment variables error: Please check your '.env' file. It must contain all the required variables you have in '.env.example'.");
    return;
  }
  app.disable("x-powered-by");
  app.set("trust proxy", parseInt(process.env.LV_PROXY_LEVEL));
  app.get("/ip", (request, response) => response.send(request.ip));
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));
  app.use(cookie());
  app.use(cors());
  try {
    await db();
  } catch (err) {
    console.log(err);
    livyMajorError("Database error: Please check your database connection.");
    return;
  }
  app.listen(process.env.LV_SRV_PORT, () => {
    import_routes(() => {
      console.log(
        `Livy server listening at http://0.0.0.0:${process.env.LV_SRV_PORT}`
      );
      console.log("App launched.");
    });
  });
};

launchApp();

process.on("uncaughtException", function (err) {
  console.log("Caught exception: ", err);
});

export default app;
export { app };
