import type { Request, Response } from "express";

const logout = (req: Request, res: Response) => {
  res.clearCookie("userToken");
  res.status(200).json({ message: "Logged out." });
};

export default logout;
