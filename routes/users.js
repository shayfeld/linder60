const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const passport = require('passport');
const request = require('request');
const NodeGeocoder = require('node-geocoder');


// User model
const User = require('../models/User');

// User Verification model
const UserVerification = require('../models/UserVerification');


//env variables
require('dotenv').config();

// email handler
const {v4: uuidv4, stringify} = require('uuid');

const nodemailer = require('nodemailer');
const { route } = require('.');
const { response } = require('express');

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth:{
        user: process.env.AUTH_EMAIL,
        pass: process.env.AUTH_PASS
    }
})

// testing nodemailer success
transporter.verify((err, success)=>{
    if(err){
        console.log(err);
    }else{
        console.log("Ready for messages");
        console.log(success);
    }
});


// Login Page
router.get('/login',(req, res)=>{
    res.render('login')
});

// Register Page
router.get('/register',(req, res)=>{
    res.render('register')
});

// Register Handle
router.post('/register',async(req, res, next)=>{
    const {userId, fullName, phone} = req.body;
    const password = userId;

    let errors = [];

    
    //Check required fields
    if(!userId || !fullName || !phone){
        errors.push({msg:'נא מלא את כל השדות'});
    }

    if(errors.length > 0){
        res.render('register',{
            errors,
            userId,
            fullName,
            phone
        });
    }else{
        
        // Validation passed
        User.findOne({userId: userId})
        .then(user =>{
            if(user){
                errors.push({msg: 'המשתמש כבר קיים במערכת'});
                    res.render('login',{
                        errors
                    });

            }else{

                const newUser = new User({
                    userId,
                    password,
                    fullName,
                    phone, 
                });

                // Hash Password
                bcrypt.genSalt(10, (err, salt)=> 
                    bcrypt.hash(newUser.password, salt, (err, hash)=>{
                        if(err) throw err;
                        // Set password to hashed
                        newUser.password = hash;
                        // Save user
                        newUser.save()
                        .then(user => {
                            // Account verification handler
                            passport.authenticate('local', {
                                successRedirect: '/dashboard',
                                failureRedirect: '/users/login',
                                failureFlash: true
                            })(req, res, next);
                        })
                        .catch(err => console.log(err));
                }));
            }
        });

    }

});


// Login Handle
router.post('/login',async(req, res, next)=>{
    const {userId} = req.body;
    let errors = [];

    
    //Check required fields
    if(!userId){
        errors.push({msg:'נא להזין את תעודת הזהות'});
    }

    if(errors.length > 0){
        res.render('login',{
                    errors,
                    userId
                });
    }else {

        passport.authenticate('local', {
            successRedirect: '/dashboard',
            failureRedirect: '/users/login',
            failureFlash: true
        })(req, res, next);

         
    } 
});

// Logout Handle
router.post('/logout',(req, res, next)=>{
    req.logout();
    req.flash('success_msg', 'You are logged out');
    res.redirect('/users/login');
});




module.exports = router;