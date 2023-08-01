const {response} = require("express");
const router = require('express').Router();
const User = require("../models/User");
const dotenv = require('dotenv');
const CryptoJS = require("crypto-js");
const jwt = require('jsonwebtoken');
const sendEmail = require("../utils/email");
const crypto = require('crypto');

dotenv.config();

// Register 
router.post("/register", async (req, res) => {

    const {username,email,...others} = req.body

   
    
    // Check for duplicate
    const duplicateUsername = await User.findOne({username : username})
    if(duplicateUsername) {
        return res.status(409).json({message: "Username already in use"})
    }
    const duplicateEmail = await User.findOne({email : email})
    if(duplicateEmail) {
        return res.status(409).json({message: "Email already in use"})
    }

    
    const hashedPassword = CryptoJS.AES.encrypt(req.body.password, process.env.SECRET_KEY).toString()
    

    const newUser = new User({
        username: req.body.username,
        email: req.body.email,
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

    const username = req.body.username;
    const email = req.body.email;
    let user

    try {
        if(email){
            user = await User.findOne({ email: email})
            if(!user) {
                return res.status(404).json({message: "User email not found"})
            }
        } else if(username) {
            user = await User.findOne({ username: username})
            if(!user) {
                return res.status(404).json({message: "Username not found"})
            }
        }

        const hashedPassword = CryptoJS.AES.decrypt(user.password, process.env.SECRET_KEY);
        const userPassword = hashedPassword.toString(CryptoJS.enc.Utf8);
        if(userPassword !== req.body.password) return res.status(404).json({message: "Error!. incorrect loging credentials"});
        const accessToken = jwt.sign(
            {
                // we are hiding these information inside a key
                id: user._id, 
                isAdmin: user.isAdmin
            },
            process.env.ACCESS_TOKEN, 
            {expiresIn: "1h"}
        )
       
        const {password, ...others} = user._doc;
        // res.cookie("refreshToken", refreshToken, {httpOnly: true, maxAge: 1 * 60 * 60 * 1000})
        res.status(200).json({...others, accessToken});
    } catch(err) {
        res.status(500).json(err);
    }
})

// forgot password
router.post("/forgotPassword", async (req, res) => {
    // get the user based on the provided email address 
    
    const user = await User.findOne({email: req.body.email});

    

    if(!user) {
        return res.status(404).json({message: "Email not found"})
    }
    // Generate a token for that user
    const resetToken = user.createResetToken();
    await user.save({validateBeforeSave: false});

    // Send the  token to the email address provided
    const resetUrl = `${req.get('origin')}/resetPassword/${resetToken}`
    const message = ` Use the link below to reset your password \n\n${resetUrl}\n\n This link will expire in 10 minutes`

    try {
        
        await sendEmail({
            email: user.email,
            subject: "Password resert",
            message: resetUrl
        })

        res.status(200).json({message: "password reset link has been sent to your email address"});

    } catch (error) {
        user.passwordResertToken = undefined;
        user.passwordResertTokenExpiresAt = undefined;
        user.save({validateBeforeSave: false})
        
        return res.status(500).json({message: "failed to sent password reset link"});
    }
})
// resert password
router.patch("/resetPassword/:token", async (req, res) => {

    const token = crypto.createHash('sha256').update(req.params.token).digest('hex');
    const user = await User.findOne({passwordResertToken: token, passwordResertTokenExpiresAt: {$gt: Date.now()}});
    if(!user) {
        return res.status(403).json({message: "Your token is invalid or has expired"});
    }

    user.password = req.body.password;
    user.passwordResertToken = undefined;
    user.passwordResertTokenExpiresAt = undefined
    user.passwordChangedAt = Date.now();

    try {
        await user.save();
        res.status(200).json({message: "New password is saved successfully"})
    } catch (error) {
        return res.status(500).json({message:"Error saving password"});
    }



})

module.exports = router;