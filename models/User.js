const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema(
    {
        username: {type : String, required: true, unique: true},
        firstname: {type : String, required: true, },
        lastname: {type : String, required: true, },
        password: {type : String, required: true},
        isAdmin: {type : Boolean, required: true, default: false},
    },
    {timestamps: true}
)

module.exports = mongoose.model("User", UserSchema);