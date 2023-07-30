const router = require('express').Router();
const Post = require('../models/Post');

const CryptoJS = require("crypto-js")
const { verifyToken, verifyTokenAndAuthorization, verifyTokenAndAdmin } = require("./verifyToken");

// CREATE POST
router.post("/", verifyTokenAndAdmin, async (req, res) => {

    const duplicate = await Post.findOne({title: req.body.title})
    if(duplicate){
        return res.status(409).json({message: "Title already in use"})
    }
    const newPost = new Post(req.body);
    try{
       const savedPost =  await newPost.save();
       res.status(200).json({message: "Post created successfully"});
    }catch(e){
        res.status(500).json(e);
    }
});

// UPDATE POST
router.patch("/:id", verifyTokenAndAdmin, async (req, res) => {

    const find = await Post.findById(req.params.id);
    if(!find) {
        return res.status(404).json({message: "Post Not Found"})
    }
    
   
    try{
        const post = await Post.findByIdAndUpdate(req.params.id, {$set: req.body}, {new:true});
        res.status(200).json({message: `Post with Id: ${req.params.id} has been updated successfully`});
    }catch(e){
        res.status(500).json(e);
    }
})
// DELETE POST
router.delete("/:id", verifyTokenAndAdmin, async (req, res) => {
   const find = await Post.findById(req.params.id);
   if(!find) {
    return res.status(404).json({message: "Post Not Found"})

   }
    try{
        const post = await Post.findByIdAndDelete(req.params.id);
        res.status(200).json({message: `post with Id: ${req.params.id} has been deleted`});
    }catch(e){
        res.status(500).json(e);
    }
})

// GET POST
router.get("/:id", async (req, res) => {
   
    try{
        const post = await Post.findById(req.params.id);
        if(!post){
            return res.status(404).json({message: "Post not found"})
        }
        res.status(200).json(post);
    }catch(e){
        res.status(500).json(e);
    }
})

// GET ALL POSTS
router.get("/", async (req, res) => {
    const qNew = req.query.new;
    const qCategory = req.query.category;
    try{
        let posts; 
         if(qNew){
            posts = await Post.find().sort({createdAt: -1})
         }else if(qCategory){
            posts = await Post.find({
                category: {
                    $in: [qCategory]
                }
            })
         } else {
            posts = await Post.aggregate([
                {
                    $group: {
                      _id: 0,
                      data: {
                        $push: {
                          _id: "$_id",
                          title: "$title",
                          category: "$category",
                          story: "$story",
                          image: "$image",
                          createdAt: "$createdAt",
                          pinned: "$pinned",
                          userId: "$userId",
                          createdAt: "$createdAt",
                        }
                      }
                      
                    }
                  },
                  {
                    $unwind: {path: "$data", includeArrayIndex: "no"}
                  },
                  {
                    "$project": {
                      "_id": "$data._id",
                      "count": {"$add": ["$no",  1] },
                      "title": "$data.title",
                      "story": "$data.story",
                      "image": "$data.image",
                      "category": "$data.category",
                      "createdAt": "$data.createdAt",
                      "pinned": "$data.pinned",
                      "userId": "$data.userId",
                      "createdAt": "$data.createdAt",
                    }
                  }
            ]);
         }
        res.status(200).json(posts);
    }catch(e){
        res.status(500).json(e);
    }
})
// router.get("/", async (req, res) => {
//     const qNew = req.query.new;
//     const qCategory = req.query.category;
//     try{
//         let Post.; 
//          if(qNew){
//             products = await Product.find().sort({createdAt: -1}).limit(12)
//          }else if(qCategory){
//             products = await Product.find({
//                 categories: {
//                     $in: [qCategory]
//                 }
//             })
//          } else {
//             products = await Product.find().sort({createdAt: -1});
//          }
//         res.status(200).json(products);
//     }catch(e){
//         res.status(500).json(e);
//     }
// })
// GET Number of PRODUCTS
// router.get("/", async (req, res) => {
   
//     try{
//         const total = await Product.aggregate([
//             {$group: {_id: null, total: {$sum: 1} }}
//         ]);
//         res.status(200).json(total);
//     }catch(e){
//         res.status(500).json(e);
//     }
// })


module.exports = router;