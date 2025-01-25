const mongoose = require('mongoose')

const staffsSchema = new mongoose.Schema({
    user_id: {type: String, required: true},
    name: {type: String, required: true},
    gender: {type: String, required: true},
    age: {type: String, required: true},
    mobile_no: {type: String, required: true}
})

const Staff = new mongoose.model('Staff', staffsSchema, 'staffs')

module.exports = Staff