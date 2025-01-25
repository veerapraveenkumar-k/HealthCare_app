const mongoose = require('mongoose')


const doctorsSchema = new mongoose.Schema({
    user_id: {type: String, required: true},
    name: {type: String, required: true},
    gender: {type: String, required: true},
    age: {type: String, required: true},
    mobile_no: {type: String, required: true},
    specialization: {type: String, required: true},
    available_status: {type: String}
})

const Doctor = new mongoose.model('Doctor', doctorsSchema, 'doctors')

module.exports = Doctor