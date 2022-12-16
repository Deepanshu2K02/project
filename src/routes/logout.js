import { Router } from "express";
export const logout_router  = Router();
import env from "dotenv";
env.config();

// Handling request using router
logout_router.get("/",async (req, res) => {
    try {
    res.clearCookie('token');
    res.redirect("/loginpage");
  } catch (error) {
     res.redirect("/error");
   }
});
