import type { Request, Response, NextFunction } from "express";
import User from "../models/user.js";

const requireAdmin = async (req: Request, res: Response, next: NextFunction) => {
  if (req.user === undefined) {
    const user = await User.findById(req.user);
    if (!user || user.role !== "admin") {
      res.status(401).json({ message: "Forbidden." });
      return;
    }
  }
  next();
};

export default requireAdmin;