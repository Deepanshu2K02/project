import bcrypt from 'bcryptjs';
import { Router } from "express";
import env from 'dotenv';
import { User } from "../models/userSignUp.js";
env.config();



export const login_router  = Router();

login_router.post("/",async (req, res) => {
    try{
      const email = req.body.email;
      const password = req.body.password;
       
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

       console.log(token);
   
       if(isMatch){ 
        res.clearCookie('token');
        res.status(200).cookie('token', token, {
          maxAge : 24*60*60*1000, //  24 hrs
          secure: env.ENVIRONMENT === 'LIVE',
          sameSite: env.ENVIRONMENT === 'LIVE' ? 'none' : 'lax',
          httpOnly: true
        })

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
