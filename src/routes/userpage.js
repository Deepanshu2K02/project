import { Router } from "express";
import jwt from "jsonwebtoken";
import { User } from "../models/userSignUp.js";
import { allurlformpath } from "../functions/functions.js";
import env from "dotenv";
env.config();

export const userpage = Router();

userpage.get('/', async (req, res) => {
    try {
        
        let token = req.session.token;
  
        if(!token) res.redirect('/loginpage');
        else{
          const genEmail = jwt.verify(token,process.env.SECRET);
  
          if(!genEmail){
            res.redirect('/loginpage');
          }
          else{
          // genEmail = genEmail.email;
          const useremail = genEmail.email;
          
          const user = await User.findOne({email : useremail});
  
          if(user){
            const displayName = user.name || 'not found';
            const email = user.email;
            const contact = user.contact || 'not found';
          
      
            let imgtotxturls = allurlformpath(`users/${user.email}/imgtotxt`);
      
            let summaryurls = allurlformpath(`users/${user.email}/summary`);
      
            let QnAurls = allurlformpath(`users/${user.email}/QnA`);
      
            let translatedurls = allurlformpath(`users/${user.email}/translation`);
      
            let data = await Promise.all([imgtotxturls,summaryurls,QnAurls,translatedurls]);
      
            res.render("User.ejs", {
              displayName: displayName,
              email: email,
              contact : contact,
              imgtotxturls: data[0],
              summaryurls: data[1],
              QnAurls: data[2],
              translatedurls: data[3],
            });
          }
          else{
            res.send('user not found');
          }
        
          }
        }
        
      
    } catch (error) {
      res.redirect("/error");
    }
  })