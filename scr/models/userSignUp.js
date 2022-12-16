import { createRequire } from "module";
import validator from 'validator';
import bcrypt from 'bcryptjs';
const require = createRequire(import.meta.url);

const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');

const userSchema = new mongoose.Schema({
    name : {
        type: String,
        required: true,
    },
    email :{
        type: String,
        required : true,
        unique: true,
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
        const gentoken = await jwt.sign({email :this.email},process.env.SECRET);
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
