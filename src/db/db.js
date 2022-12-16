import { createRequire } from "module";
const require = createRequire(import.meta.url);

import env from "dotenv";
env.config();

import mongoose from "mongoose";

mongoose.set('strictQuery', false);
//Set up default mongoose connection

const DB = "mongodb+srv://kartikhatwar98:9371865060k@cluster0.w3714lm.mongodb.net/Text-Tools?retryWrites=true&w=majority";

mongoose.connect(DB, { useNewUrlParser: true }).then(()=>{
    // console.log('Connected');
})

module.exports = mongoose;