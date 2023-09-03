import jwt from "jsonwebtoken";
import type { VerifyErrors } from "jsonwebtoken";
import type { Request, Response, NextFunction } from "express";

export type DecodedToken = {
  email: string;
  _id: string;
};

const requireAuth = async (req: Request, res: Response, next: NextFunction) => {
  if (req.cookies === undefined || req.cookies.user === undefined) {
    res.status(401).json({ message: "Unauthorized." });
    return;
  }
  const token = req.cookies.user;
  if (token) {
    jwt.verify(token, process.env.LV_JWT_SECRET, (err: VerifyErrors | null, decodedToken: DecodedToken) => {
      if (err) {
        res.status(401).json({ message: "Unauthorized." });
      } else {
        req.user = decodedToken.email;
        req.userId = Number(decodedToken._id);
        next();
      }
    });
  } else {
    res.status(401).json({ message: "Unauthorized." });
  }
};

export default requireAuth;