const jwt = require("jsonwebtoken");

const verifyToken = (req, res, next) => {
    const authHeader = req.headers.token;
    if(authHeader){
        const token = authHeader.split(" ")[1];
        jwt.verify(token, process.env.ACCESS_TOKEN, (err, data) => {
            if(err) res.status(403).json({message: "Invalid Token"});
            // we can retrieve the info hidden in the key
            // We hid the userId and isAdmin in the key
            req.user = data 
            next();
        });
    }else{
        return res.status(401).json({message: "Authentication failled"})
    }
}

const verifyTokenAndAuthorization = (req, res, next) => {
    verifyToken(req, res, () => {
        if(req.user.id === req.params.id || req.user.isAdmin){
            next();
        }else{
            res.status(403).json({message: "Permission Denied!", user: req.user})
        }
    })
}

const verifyTokenAndAdmin = (req, res, next) => {
    verifyToken(req, res, () => {
        if(req.user.isAdmin){
            next();
        }else{
            res.status(403).json({message: "Permission Denied!"})
        }
    }) 
}

module.exports = { verifyToken , verifyTokenAndAuthorization, verifyTokenAndAdmin }