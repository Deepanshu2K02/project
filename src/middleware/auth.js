import jwt from "jsonwebtoken";
import env from "dotenv";
env.config();



export const Uauth = async (req,res,next)=>{
   try {

    // console.log(req.session.token);
    const token = req.cookies.token;
    
    if(!token) res.redirect('/loginpage');
    else{
        const verifyUser2 = jwt.verify(token,"Text-Tools_secret_key_CreatedBy_Kartik_Hatwar_for_registered_users")
        if(verifyUser2){ 
            next()
        }
        else{
            res.redirect('/loginpage');
        }
    }
    
    
   } catch (err) {
        res.send(`auth sending :  ${err}`);
   }
}