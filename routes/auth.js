const {response} = require("express");
const router = require('express').Router();
const User = require("../models/User");
const dotenv = require('dotenv');
const CryptoJS = require("crypto-js");
const jwt = require('jsonwebtoken');

dotenv.config();

// Register 
router.post("/register", async (req, res) => {

    const {username,...others} = req.body
    
    // Check for duplicate
    const duplicateUsername = await User.findOne({username : username})
    if(duplicateUsername) {
        return res.status(409).json({message: "Username already in use"})
    }

    
    const hashedPassword = CryptoJS.AES.encrypt(req.body.password, process.env.SECRET_KEY).toString()
    

    const newUser = new User({
        username: req.body.username,
        firstname: req.body.firstname,
        lastname: req.body.lastname,
        password: CryptoJS.AES.encrypt(req.body.password, process.env.SECRET_KEY).toString()
    });

    

    try{
        const savedUser = await newUser.save();
        res.status(200).json({message: "User Registration Successful"});
    } catch(err) {
        res.status(500).json(err);
    }
})

//login 
router.post('/login', async (req, res) => {

    try {
        const user = await User.findOne({username: req.body.username});

        if(!user) return res.status(404).json({message: "Username not found"});
        const hashedPassword = CryptoJS.AES.decrypt(user.password, process.env.SECRET_KEY);
        const userPassword = hashedPassword.toString(CryptoJS.enc.Utf8);
        if(userPassword !== req.body.password) return res.status(404).json({message: "incorrect username or password"});
        const accessToken = jwt.sign(
            {
                // we are hiding these information inside a key
                id: user._id, 
                isAdmin: user.isAdmin
            },
            process.env.ACCESS_TOKEN, 
            {expiresIn: "1h"}
        )
        const refreshToken = jwt.sign(
            {
                id: user._id, 
                isAdmin: user.isAdmin
            },
            process.env.REFRESH_TOKEN, 
            {expiresIn: "20m"}
        )

        const {password, ...others} = user._doc;
        // res.cookie("refreshToken", refreshToken, {httpOnly: true, maxAge: 1 * 60 * 60 * 1000})
        res.status(200).json({...others, accessToken});
    } catch(err) {
        res.status(500).json(err);
    }
})

module.exports = router;