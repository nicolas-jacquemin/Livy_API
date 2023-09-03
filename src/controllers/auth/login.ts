import User from "../../models/user.js";
import type { User as UserT } from "../../models/user.js";
import tokenGen from "./tokenGen.js";
import bcrypt from "bcrypt";
import type { Request, Response } from "express";

const login = (req: Request, res: Response) => {
  if (!req.body.email || !req.body.password) {
    res.status(422).json({ message: "Missing fields..." });
    return;
  }
  User.findOne({ email: req.body.email }, (err: any, user: UserT) => {
    if (err) {
      res.status(500).json({ message: "Error logging in." });
      console.error(err)
    } else {
      if (!user) {
        res.status(401).json({ message: "Incorrect email or password." });
      } else {
        bcrypt.compare(req.body.password, user.password, function (err, result) {
          if (result) {
            tokenGen(user, res);
          } else {
            res.status(401).json({ message: "Incorrect email or password." });
          }
        });
      }
    }
  });
};

export default login;
