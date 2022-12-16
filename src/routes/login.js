import bcrypt from 'bcryptjs';
import { User } from "../models/userSignUp.js";
import { Router } from "express";
import env from 'dotenv';
import { connecttoDB } from '../db/db.js';
env.config();

await connecttoDB();

export const login_router  = Router();

login_router.post("/",async (req, res) => {
    try{
      const email = req.body.email;
      const password = req.body.password;
       
      await connecttoDB();
   
      const usermail = await User.findOne({email : email});
   
      if(!usermail){
       res.render("LoginPage", {
         code: "login",
         error: '*********'+'Wrong Credentials',
       });
      }
      else{
   
       const isMatch = await bcrypt.compare(password,usermail.password);
      
       const token = await usermail.generateAuthToken();
   
       if(isMatch){ 
         res.cookie('token',token,{
           httpOnly: true,
           maxAge : 24*60*60*1000, //  24 hrs
           // secure: true
         });
         res.redirect(`/`)
       }  
       else{
        res.render("LoginPage", {
          code: "login",
          error: '*********'+'Wrong Credentials',
        });
       }
      }
   
    }catch(err){
     res.render("LoginPage", {
       code: "login",
       error: '*********'+ err.message,
     });
    }
   
   });
