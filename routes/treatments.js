const express = require('express');
const router = express.Router();
const { ensureAuthenticated } = require('../config/auth');
const request = require('request');

// User model
const User = require('../models/User');

// Treatment model
const Treatment = require('../models/Treatment');


// Add Treatment Handle
router.get('/addTreatment/:id/:userid', ensureAuthenticated, (req, res)=>{
    const userId = req.params.userid;
    const id = req.params.id;

    //find hobbie
    Treatment.findById(id)
        .then((hobbiee)=>{
            if(hobbiee){
                User.findOne({userId:userId})
                .then((user)=>{
                    if(user.hobbies.indexOf(hobbiee.hobbie) == -1){
                        user.hobbies.push(hobbiee.hobbie);
                        User.findByIdAndUpdate(user._id, {hobbies: user.hobbies}, {useFindAndModify: false})
                        .then(() =>{
                            Treatment.find({}, (err, treatments) =>{
                                res.render('hobbies',{
                                    userId:userId,
                                    treatmentList: treatments
                                })
                            })
                        })
                        .catch((err)=>{
                            console.log(err);
                        });
                    }
                        
                })
                .catch(err => console.log(err));
            }
        })
        .catch(err => console.log(err));

});


// Delete Treatment Handle
router.get('/deleteTreatment/:id/:userid', ensureAuthenticated, (req, res)=>{
    const userId = req.params.userid;
    const id = req.params.id;

    //find hobbie
    Treatment.findById(id)
        .then((hobbiee)=>{
            if(hobbiee){
                User.findOne({userId:userId})
                .then((user)=>{
                    if(user.hobbies.indexOf(hobbiee.hobbie)){
                        user.hobbies.splice(user.hobbies.indexOf(hobbiee.hobbie),1);
                        User.findByIdAndUpdate(user._id, {hobbies: user.hobbies}, {useFindAndModify: false})
                        .then(() =>{
                            Treatment.find({}, (err, treatments) =>{
                                res.render('hobbies',{
                                    userId:userId,
                                    treatmentList: treatments
                                })
                            })
                        })
                        .catch((err)=>{
                            console.log(err);
                        });
                    }
                        
                })
                .catch(err => console.log(err));
            }
        })
        .catch(err => console.log(err));
});



module.exports = router;