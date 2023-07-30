const User = require("../models/User");
const CryptoJS = require("crypto-js")
const router = require('express').Router();
const { verifyToken, verifyTokenAndAuthorization, verifyTokenAndAdmin } = require("./verifyToken");

// Update User
router.patch("/:id", verifyTokenAndAuthorization, async (req, res) => {

    const find = await User.findById(req.params.id);
    if(!find) {
        return res.status(404).json({message: 'User not found'})
    }

    if(req.body.password) {
        req.body.password = CryptoJS.AES.encrypt(req.body.password, process.env.SECRET_KEY).toString()
    }


    try{
        const updatedUser = await User.findByIdAndUpdate(req.params.id, {
            $set: req.body
        }, {new: true})
         res.status(200).json({message: `User ${updatedUser.firstname}  ${updatedUser.lastname} has been updated`});
    } catch(e){
        res.status(500).json(e);
    }
})

// Delete User
router.delete("/:id", verifyTokenAndAdmin, async (req, res) => {
    const find = await User.findById(req.params.id);
    if(!find) {
        return res.status(404).json({message: 'User not found'})
    }
    try{
        await User.findByIdAndDelete(req.params.id);
         res.status(200).json({message: "User has been deleted "});
    } catch(e){
        res.status(500).json(e);
    }
    
});

// Get User
router.get("/find/:id", verifyTokenAndAdmin, async (req, res) => {

    try{
        const user = await User.findById(req.params.id);
        const {password, ...others } = user._doc;
        res.status(200).json(others);
    } catch(e){
        res.status(500).json(e);
    }
    
});

// Get all Users
router.get("/", async (req, res) => {
    
    try{ 
        const users = await User.find().sort({createdAt: -1 });  
        if(!users) {
            return res.status(400).json("No users found")
        }
        newUsersData = [] 
        for(let i = 0; i < users.length; i++) {
            const {password, ...others} = users[i]._doc;
            newUsersData.push(others);
        }
        res.status(200).json(newUsersData);
    } catch(e){
        res.status(500).json(e);
    }
    
});

// Get User stats
router.get("/stats", verifyTokenAndAdmin, async (req, res) => {
    const date = new Date();
    const lastYear = new Date(date.setFullYear(date.getFullYear() - 1))
    try{ 
        const data = await User.aggregate([
            {$match: {createdAt: {$gte: lastYear}}},
            {
                $project: {
                    month: {$month: "$createdAt"}
                },
            },
            {
                $group:{
                    _id: "$month",
                    total: {$sum: 1}
                }
            }
        ])
        res.status(200).json(data);
    } catch(e){
        res.status(500).json(e);
    }
    
});

module.exports = router;