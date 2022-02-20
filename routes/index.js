const express = require('express');
const router = express.Router();
const { ensureAuthenticated } = require('../config/auth');

const Treatment = require('../models/Treatment');
const User = require('../models/User');

// Welcome page
router.get('/',(req, res)=>{
    res.render('login')
});

// Dashbord page
router.get('/dashboard', ensureAuthenticated, (req, res)=>{
    Treatment.find({}, (err, treatments) =>{
        res.render('tables',{
            treatmentList: treatments
        })
    })
    
});

// Hobbies page
router.get('/hobbies', ensureAuthenticated, (req, res)=>{
    //const {userId} = req.params;
    Treatment.find({}, (err, treatments) =>{
        res.render('hobbies',{
            treatmentList: treatments
        })
    })
    
});

// New Treatment page
router.get('/aboutUs', ensureAuthenticated, (req, res)=>{
    res.render('aboutUs')
});

// Page Not Found

router.get('/PageNotFound', (req, res)=>{
    res.render('404');
});

module.exports = router;