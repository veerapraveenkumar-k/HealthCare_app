const mongoose = require('mongoose')


const userSchema = new mongoose.Schema({
    user_id: {type: String, required: true},
    email: {type: String, required: true},
    password: {type: String, required: true},
    role: {type: String, required: true}
})

const User = new mongoose.model('User', userSchema, 'users')

module.exports = User