const mongoose = require('mongoose');

const PostSchema = new mongoose.Schema(
    {
        title : {type: String, required: true, unique: true},
        category : {type: String, required: true},
        story: {type: String, required: true},
        image: {type: String, required: true},
        pinned: {type: Boolean, required: true, default: false},
        userId: {type: String, required: true},

    },
    {timestamps: true}
)

module.exports = mongoose.model('Post', PostSchema);