const mongoose = require('mongoose')


const patientSchema = new mongoose.Schema({
    user_id: {type: String, required: true},
    name: {type: String, required: true},
    gender: {type: String, required: true},
    age: {type: String, required: true},
    mobile_no: {type: String, required: true}
})

const Patient = new mongoose.model('Patient', patientSchema, 'patients')

module.exports = Patient