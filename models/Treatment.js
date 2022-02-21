const mongoose = require('mongoose');

const TreatmentSchema = new mongoose.Schema({
    hobbie:{
        type: String,
        required: true
    }
});

const Treatment = mongoose.model('Treatment', TreatmentSchema);

module.exports = Treatment;