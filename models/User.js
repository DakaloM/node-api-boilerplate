const mongoose = require('mongoose');
const crypto = require('crypto');

const UserSchema = new mongoose.Schema(
    {
        username: {type : String, required: true,unique: true},
        email: {type : String, required: true, unique: true},
        password: {type : String, required: true},
        isAdmin: {type : Boolean, default: false},
        passwordChangedAt: {type : Date},
        passwordResertToken: {type : String},
        passwordResertTokenExpiresAt: {type : Date}
    },
    {timestamps: true}
)

UserSchema.methods.createResetToken =  function () {
    const resetToken = crypto.randomBytes(32).toString('hex');
    this.passwordResertToken = crypto.createHash('sha256').update(resetToken).digest('hex');
    this.passwordResertTokenExpiresAt = Date.now() + (10 * 60 * 1000);

    // console.log(resetToken, this.passwordResertToken, this.passwordResertTokenExpiresAt)

    return resetToken; 
}
 
module.exports = mongoose.model("User", UserSchema);