const mongoose = require('mongoose')

const verificationSchema = new mongoose.Schema({
    email: {type: String, required: true},
    otp: {type: String, required: true}
})

const Verification = new mongoose.model('Verification', verificationSchema, 'verifications')

module.exports = Verification