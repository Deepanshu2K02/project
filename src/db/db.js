import mongoose from "mongoose";

const DB = process.env.DATABASE || "mongodb+srv://kartikhatwar98:9371865060k@cluster0.w3714lm.mongodb.net/Text-Tools?retryWrites=true&w=majority";

export const connecttoDB = async ()=>{
    const result = await mongoose.connect(DB, { useNewUrlParser: true});
    }

