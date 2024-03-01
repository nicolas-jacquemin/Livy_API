import tokenGen from "./tokenGen.js";
import jwt from "jsonwebtoken";
import User from "../../models/user.js";
import type { Request, Response } from "express";
import type { DecodedToken } from "../../middlewares/requireAuth.js";
import type { User as UserT } from "../../models/user.js";

const renewToken = (req: Request, res: Response) => {
  if (!req.body.token) {
    res.status(500).json({ message: "Missing fields..." });
    return;
  }

  jwt.verify(req.body.token, process.env.LV_JWT_SECRET, (err: any, decodedToken: DecodedToken) => {
    if (err) {
      res.status(401).json({ message: "Unauthorized." });
    } else {
      User.findById(decodedToken._id, (err: any, user: UserT) => {
        if (err) {
          res.status(500).json({ message: "Error renewing token." });
        } else {
          if (!user) {
            res.status(404).json({ message: "Unauthorized." });
          } else {
            tokenGen(user, res);
          }
        }
      });
    }
  });

};

export default renewToken;
