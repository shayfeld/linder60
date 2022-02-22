const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
    userId:{
        type: String,
        required: true
    },
    password:{
        type: String,
        required: true
    },
    fullName:{
        type: String,
        required: true
    },
    phone:{
        type: Date,
        default: Date.now
    },
    hobbies:{
        type: Array,
        required: true
    },
    location:{
        type: String,
        required: true
    },
});

const User = mongoose.model('User', UserSchema);

module.exports = User;