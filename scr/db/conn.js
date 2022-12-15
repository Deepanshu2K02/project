import { createRequire } from "module";
const require = createRequire(import.meta.url);

export const mongoose = require('mongoose');
mongoose.set('strictQuery', false);
//Set up default mongoose connection
const mongoDB = 'mongodb://localhost:27017/Text-Tools';
mongoose.connect(mongoDB, { useNewUrlParser: true }).then(()=>{
    // console.log('Connected');
})

