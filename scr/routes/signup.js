import { Router } from "express";
import { User } from "../models/userSignUp.js";

export const signup_router= Router()

// Handling request using router
signup_router.post("/",async (req, res) => {
    try {
    
      let Password = req.body.spassword;
      let Cpassword = req.body.spassword2;
  
      if(Password === Cpassword){
        const Register_User = new User({
          name : req.body.sname,
          email : req.body.semail,
          contact : req.body.scontact,
          password : req.body.spassword,
        });
  
        const token = await Register_User.generateAuthToken();
  
        await Register_User.save();
  
        res.cookie('token',token,{
          httpOnly: true,
          maxAge : 24*60*60*1000, //  60 seconds
        });
        res.redirect('/');
      }
      else{
        res.render("LoginPage", {
          code: "signup",
          error: ' ********Passwords are Not Matching',
        });
      }
    } catch (err) {
      console.log(err);
      if(err.code){
        if(err.code == 11000){
          res.render("LoginPage", {
            code: "signup",
            error: '*********'+'Users one or more credentials already exists',
          });
        }
      }
      else{
        res.render("LoginPage", {
          code: "signup",
          error: '********'+err.message,
        });
      }
  
    }
  });
