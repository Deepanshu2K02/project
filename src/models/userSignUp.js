import { createRequire } from "module";
import validator from 'validator';
import bcrypt from 'bcryptjs';
// import { mongoose } from "../db/db.js";
import jwt from "jsonwebtoken";

import env from "dotenv";
env.config();

import mongoose from "mongoose";

mongoose.set('strictQuery', false);
//Set up default mongoose connection

const DB = "mongodb+srv://kartikhatwar98:9371865060k@cluster0.w3714lm.mongodb.net/Text-Tools?retryWrites=true&w=majority";

mongoose.connect(DB, { useNewUrlParser: true }).then(()=>{
    // console.log('Connected');
})

const userSchema = new mongoose.Schema({
    name : {
        type: String,
        required: true,
    },
    email :{
        type: String,
        required : true,
        unique: true,

        validate(value){
            if(!validator.isEmail(value)){
                throw new Error('Email Id is not Valid');
            }
        }
    },
    contact : {
        type : String,
        unique : true,
        minLength : [10,"********Invalid Contact"]
    },
    password : {
        type : String,
        required : true,
        minLength : [6,"********Password should be of minimum 8 Letters"]
    },
    tokens : [{
         token : {
            type : String,
            required : true
         },
    }]
});

userSchema.methods.generateAuthToken = async function(){
    try {
        const gentoken = await jwt.sign(JSON.stringify({email :this.email}),process.env.SECRET);
        this.tokens = this.tokens.concat( { token:gentoken });
        return gentoken;
    } catch (error) {
        console.log(error);
        return error;
    }
}

// Hashing Password for security
userSchema.pre("save", async function (next){

    if(this.isModified("password")){
        this.password = await bcrypt.hash(this.password,10);
    }
    next();

})

export const User = new mongoose.model("User",userSchema);