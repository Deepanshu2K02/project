import { createRequire } from "module";
const require = createRequire(import.meta.url);

const jwt = require("jsonwebtoken");
import { User } from "../models/userSignUp.js";

export const Uauth = async (req,res,next)=>{
   try {
    const token = req.cookies.token;
    if(!token) res.redirect('/loginpage');
    else{
        const verifyUser = jwt.verify(token,process.env.SECRET);
        if(verifyUser.email) next();
        else{
            res.redirect('/loginpage');
        }
    }
    
   } catch (err) {
        res.send(err);
   }
}