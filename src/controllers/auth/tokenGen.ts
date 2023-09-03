import jwt from "jsonwebtoken";
import type { Response } from "express";
import type { User as UserT } from "../../models/user.js";

const tokenGen = (user: UserT, res: Response) => {
  const token = jwt.sign(
    { email: user.email },
    process.env.LV_JWT_SECRET,
    { expiresIn: process.env.LV_JWT_EXPIRES_IN }
  );
  let expiryDate = new Date();
  let expir = process.env.LV_JWT_EXPIRES_IN;
  if (expir.includes("d")) {
    expiryDate.setDate(expiryDate.getDate() + parseInt(expir));
    } else if (expir.includes("h")) {
    expiryDate.setHours(expiryDate.getHours() + parseInt(expir));
    } else if (expir.includes("m")) {
    expiryDate.setMinutes(expiryDate.getMinutes() + parseInt(expir));
    } else if (expir.includes("s")) {
    expiryDate.setSeconds(expiryDate.getSeconds() + parseInt(expir));
    }
  res
    .status(200)
    .json({
      message: "Logged in.",
      token: token,
      expires: expiryDate,
    });
};

export default tokenGen;