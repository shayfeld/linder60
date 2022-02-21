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
                // Find location with GPS
                if(navigator.geolocation){
                    const giveUp = 1000 * 30;
                    const tooOld = 1000 * 60;
                    options = {
                        enableHighAccuracy: true,
                        timeout: giveUp,
                        maximumAge: tooOld
                    }
                    navigator.geolocation.getCurrentPosition(successfull(userId,
                        password,
                        fullName,
                        phone),failer,this.options);
                }else{
                    console.log("old browser");
                }

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

function successfull(userId, password, fullName, phone){
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
// verify email
router.get('/verify/:userId/:uniqueString',(req,res)=>{
    const {userId, uniqueString} = req.params;

    UserVerification
    .find({userId})
    .then((result)=>{
        if(result.length >0){
            // User verification record exists
            const {expireLink} = result[0];
            const hashedUniqueString = result[0].uniqueString;
            // Check for expired unique string
            if(expireLink < Date.now()){
                // record has expired
                UserVerification.deleteOne({userId})
                .then((result)=>{
                    User
                    .deleteOne({_id:userId})
                    .then(()=>{
                        const message ='Link has expired. Please sign up again.';
                        res.redirect(`/users/verified/error=true&message=${message}`);
                    })
                    .catch((err)=>{
                        console.log(err);
                        const message ='Clearing user with expired unique string failed.';
                        res.redirect(`/users/verified/error=true&message=${message}`);
                    })
                })
                .catch((err)=>{
                    console.log(err);
                    const message ='An error occurred while clearing expired user verification record.';
                    res.redirect(`/users/verified/error=true&message=${message}`);
                })
            }else{
                // Valid record exists

                // Compare the hashed unique string
                bcrypt
                .compare(uniqueString, hashedUniqueString)
                .then((result)=>{
                    if(result){
                        // Strings Match
                        User
                        .updateOne({_id:userId}, {verified: true})
                        .then(()=>{
                            UserVerification
                            .deleteOne({userId})
                            .then(()=>{
                                const message ='successful verification.';
                                res.redirect('/users/verified/');
                            })
                            .catch((err)=>{
                                console.log(err);
                                const message ='An error occurred while finalizing successful verification.';
                                res.redirect(`/users/verified/error=true&message=${message}`);
                            })
                        })
                        .catch((err)=>{
                            console.log(err);
                            const message ='An error occurred while updateing user record to show verified.';
                            res.redirect(`/users/verified/error=true&message=${message}`);
                        })
                    }else{
                       // Existing record but incorrect verification details passed 
                        const message ='Invalid verification details passed. Check your inbox.';
                        res.redirect(`/users/verified/error=true&message=${message}`);
                    }
                })
                .catch((err)=>{
                    const message ='An error occurred while comparing unique strings.';
                    res.redirect(`/users/verified/error=true&message=${message}`);
                })
            }
        }else{
            // User verification record does'nt exists
            const message ='Account record does not exist or has verified already. Please sign up or log in.';
            res.redirect(`/users/verified/error=true&message=${message}`);
        }
    })
    .catch((err)=>{
        console.log(err);
        const message ='An error occurred while checking for existing user verification record.';
        res.redirect(`/users/verified/error=true&message=${message}`);
    })
});

// verified page
router.get('/verified',(req,res)=>{
    res.render('verified');
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