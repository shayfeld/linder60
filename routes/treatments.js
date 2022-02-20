const express = require('express');
const router = express.Router();
const { ensureAuthenticated } = require('../config/auth');
const request = require('request');

// User model
const User = require('../models/User');

// Treatment model
const Treatment = require('../models/Treatment');


// Add Treatment Page
router.get('/addTreatment', ensureAuthenticated, (req, res)=>{
    res.render('addTreatment')
});

// Edit Treatment Page
router.get('/editTreatment/:id', ensureAuthenticated, (req, res)=>{
    const userId = req.params.id;
    const put = "PUT";
    Treatment.findById(userId)
    .then((user)=>{
        res.render('editTreatment',{
            userId: userId,
            treatmentNumber: user.treatmentNumber,
            workerEmail: user.workerEmail,
            treatmentInformation: user.treatmentInformation,
            carNumber: user.carNumber,
            inputDate: user.inputDate,
            tempTreatmentNumber:user.treatmentNumber,
            put: put
        });
    })
    .catch((err)=>{
        console.log(err);
    });
});

// Add Treatment Handle
router.post('/addTreatment', ensureAuthenticated, (req, res)=>{
    const {treatmentNumber, carNumber, treatmentInformation, workerEmail} = req.body;
    let errors = [];

    //Check required fields
    if(!treatmentNumber || !carNumber || !treatmentInformation || !workerEmail){
        errors.push({msg:'Please fill in all fields'});
    }
    
    if(errors.length > 0){
        res.render('addTreatment',{
                    errors,
                    treatmentNumber,
                    carNumber,
                    treatmentInformation,
                    workerEmail,

                });
    }else{
        Treatment.findOne({treatmentNumber: treatmentNumber})
        .then((treatment)=>{
            if(treatment){
                errors.push({msg:'The treatment number exist'});
                res.render('addTreatment',{
                    errors,
                    treatmentNumber,
                    carNumber,
                    treatmentInformation,
                    workerEmail,

                });
            }
            else{
                const treatment = new Treatment({
                    treatmentNumber:treatmentNumber,
                    treatmentInformation:treatmentInformation,
                    workerEmail:workerEmail,
                    carNumber: carNumber
                });
            
                treatment.save()
                .then(() => {
                    // Back to dashboard
                    res.redirect('/dashboard');
                })
                .catch(err => console.log(err));
            }
        })
        .catch(err => console.log(err));  
    }   

});



// Edit Treatment Handle
router.post('/editTreatment/:id', ensureAuthenticated, (req, res)=>{
    const userId = req.params.id;
    const {treatmentNumber, carNumber, treatmentInformation, workerEmail, put, tempTreatmentNumber} = req.body;
    let errors = [];

    //Check required fields
    if(!treatmentNumber || !carNumber || !treatmentInformation || !workerEmail){
        errors.push({msg:'Please fill in all fields'});
    }
    
    if(errors.length > 0){
        res.render('editTreatment',{
                    errors,
                    treatmentNumber,
                    carNumber,
                    treatmentInformation,
                    workerEmail,
                    userId,
                    tempTreatmentNumber,
                    put
                });
    }else{
        if(tempTreatmentNumber !== treatmentNumber){
            Treatment.findOne({treatmentNumber: treatmentNumber})
            .then((treatment)=>{
                if(treatment){
                    errors.push({msg:'The treatment number exist'});
                    res.render('editTreatment',{
                        errors,
                        treatmentNumber,
                        carNumber,
                        treatmentInformation,
                        workerEmail,
                        userId,
                        tempTreatmentNumber,
                        put
                    });
                }else{
                    Treatment.findByIdAndUpdate(userId, req.body, {useFindAndModify: false})
                    .then(() =>{
                        res.redirect('/dashboard');
                    })
                    .catch((err)=>{
                        console.log(err);
                    });

                }
            });

        }else{
            Treatment.findByIdAndUpdate(userId, req.body, {useFindAndModify: false})
            .then(() =>{
                res.redirect('/dashboard');
            })
            .catch((err)=>{
                console.log(err);
            });
        }

    }

});


// Delete Treatment Handle
router.get('/deleteTreatment/:id', ensureAuthenticated, (req, res)=>{
    const id = req.params.id;
    Treatment.findByIdAndDelete(id)
    .then(()=>{
        res.redirect('/dashboard');
    })
    .catch((err)=>{
        console.log(err);
    });
});



module.exports = router;