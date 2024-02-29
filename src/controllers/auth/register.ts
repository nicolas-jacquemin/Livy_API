import User from "../../models/user.js";
import type { User as UserT } from "../../models/user.js";
import bcrypt from "bcrypt";
import tokenGen from "./tokenGen.js";
import type { Request, Response } from "express";

const fieldsValidation = async (req: Request, res: Response) => {
  if (process.env.BLOCK_REGISTRATION && process.env.BLOCK_REGISTRATION === "true") {
    res.status(400).json({ message: "Registration is currently disabled." });
    return false;
  }
  if(!req.body.name || req.body.name.length < 2 || req.body.name.length > 30){
    res.status(400).json({ message: "Name must be between 2 and 30 characters long." });
    return false;
  }
  if(!/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(req.body.email)){
    res.status(400).json({ message: "Email is not valid." });
    return false;
  }
  if(!req.body.password || req.body.password.length < 8){
    res.status(400).json({ message: "Password must be at least 8 characters long" });
    return false;
  }
  if (process.env.BLOCK_REGISTRATION === "true") {
    res.status(400).json({ message: "Registration is currently disabled." });
    return false;
  }
  if (process.env.BLOCK_REGISTRATION === "onlyMasterInvite") {
    if (!process.env.MASTER_INVITE_CODE || req.body.inviteCode !== process.env.MASTER_INVITE_CODE) {
      res.status(400).json({ message: "Invite code is not valid." });
      return false;
    }
  }
  // let code = await inviteCode.findOne({
  //   inviteCode: req.body.inviteCode
  // })
  // if(!code){
  //   res.status(400).json({ message: "Invite code is not valid." });
  //   return false;
  // }
  return true; 
}

const register = async (req: Request, res: Response) => {
  if (
    req.body.name == undefined ||
    req.body.email == undefined ||
    req.body.password == undefined
  ) {
    res.status(400).json({ message: "Missing fields..." });
    return;
  }

  if(!await fieldsValidation(req, res))
    return;

  const { name, email, password, inviteCode } = req.body;

  User.find({ email: req.body.email }, (err: any, user: UserT[]) => {
    if (user.length > 0) {
      res.status(400).json({ message: "Email already exists." });
    } else {
      bcrypt.hash(password, 10, function (err, hash) {

        var user = new User();
        user.name = name;
        user.email = email;
        user.password = hash;
        user.inviteCode = inviteCode;

        user.save((err, user) => {
          if (err) {
            res.status(500).json({ message: "Error registering user." });
          } else {
            tokenGen(user, res);  
          }
        });
      });
    }
  });
};

export default register;
