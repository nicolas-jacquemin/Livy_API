import jwt from "jsonwebtoken";
import type { VerifyErrors } from "jsonwebtoken";
import type { Request, Response, NextFunction } from "express";
import User from "../models/user.js";

export type DecodedToken = {
  email: string;
  _id: string;
};

const requireAuth = async (req: Request, res: Response, next: NextFunction) => {
  if (req.cookies === undefined || req.cookies.userToken === undefined) {
    res.status(401).json({ message: "Unauthorized." });
    return;
  }
  const token = req.cookies.userToken;
  if (token) {
    jwt.verify(token, process.env.LV_JWT_SECRET, async (err: VerifyErrors | null, decodedToken: DecodedToken) => {
      if (err) {
        res.status(401).json({ message: "Unauthorized." });
      } else {
        req.user = decodedToken.email;
        req.userId = Number(decodedToken._id);
        const user = await User.findById(decodedToken._id);
        if (!user) {
          res.status(401).json({ message: "Unauthorized." });
          return;
        }
        next();
      }
    });
  } else {
    res.status(401).json({ message: "Unauthorized." });
  }
};

export default requireAuth;