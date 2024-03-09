import jwt from "jsonwebtoken";
import type { Response } from "express";
import type { User as UserT } from "../../models/user.js";

const tokenGen = (user: UserT, res: Response) => {
  const token = jwt.sign(
    { email: user.email, _id: user._id},
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
    .setHeader("Set-Cookie", `userToken=${token}; HttpOnly; Secure; SameSite=Lax; Path=/; Expires=${expiryDate.toUTCString()}`)
    .json({
      message: "Logged in.",
      expires: expiryDate,
    });
};

export default tokenGen;