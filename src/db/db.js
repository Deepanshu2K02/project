import { createRequire } from "module";
const require = createRequire(import.meta.url);

import env from "dotenv";
env.config();


export const mongoose = require('mongoose');

mongoose.set('strictQuery', false);
//Set up default mongoose connection

const DB = process.env.DATABASE;
mongoose.connect(DB, { useNewUrlParser: true }).then(()=>{
    // console.log('Connected');
})