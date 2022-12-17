import jwt from "jsonwebtoken";
import env from "dotenv";
env.config();



export const Uauth = async (req,res,next)=>{
   try {

    // console.log(req.session.token);
    const token = req.signedCookies.token;

    

    if(!token) res.redirect('/loginpage');
    else{
        res.send(token);
        // const verifyUser = jwt.verify(token,process.env.SECRET);
     
        // if(verifyUser.email) next();
        // else{
        //     res.redirect('/loginpage');
        // }
    }
    
    
   } catch (err) {
        res.send(`auth sending ${err}`);
   }
}