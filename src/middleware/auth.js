import jwt from "jsonwebtoken";
import env from "dotenv";
env.config();



export const Uauth = async (req,res,next)=>{
   try {

    // console.log(req.session.token);
    const token = req.signedCookies.token;
    
    if(!token) res.redirect('/loginpage');
    else{
        res.send(req.signedCookies.token);
        // const verifyUser = jwt.verify(token,"Text-Tools_secret_key_CreatedBy_Kartik_Hatwar_for_registered_users");
     
        if(verifyUser) res.send(verifyUser);
        // if(verifyUser.email) next();
        // else{
        //     res.redirect('/loginpage');
        // }
    }
    
    
   } catch (err) {
        res.send(`auth sending ${err}`);
   }
}