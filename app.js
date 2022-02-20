const express = require('express');
const expressLayout = require('express-ejs-layouts');
const mongoose = require('mongoose');
const passport = require('passport');
const flash = require('connect-flash');
const session = require('express-session');

const app = express();

// Passport config
require('./config/passport')(passport);

// BD Config
const db = require('./config/keys').MongoURI;

// Connect to Mongo
mongoose.connect(db, { useNewUrlParser: true})
.then(()=>console.log('MongoDB Connected...'))
.catch(err=>console.log(err));

// EJS
app.set('view engine', 'ejs');

//Use public directory as /static in server
app.use('/static', express.static('./'));

// Bodyparser
app.use(express.urlencoded({extended: false}));
app.use(express.json());

// Express Session
app.use(session({
    secret: 'secret',
    resave: true,
    saveUninitialized: true
    //cookie: { secure: true }
}));

// Passport middleware
app.use(passport.initialize());
app.use(passport.session());

// Connect flash
app.use(flash());

// Global Vars
app.use((req, res, next)=>{
    res.locals.success_msg = req.flash('success_msg');
    res.locals.error_msg = req.flash('error_msg');
    res.locals.error = req.flash('error');
    next();
});

// Routes
app.use('/', require('./routes/index'));
app.use('/users', require('./routes/users'));
app.use('/treatments', require('./routes/treatments'));

// Page Not Found
app.get('*', function(req, res){
    res.status(404).redirect('/PageNotFound');
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, console.log(`Server started on port ${PORT}`));