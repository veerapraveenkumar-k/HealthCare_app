const mongoose = require('mongoose')


const adminSchema = new mongoose.Schema({
    user_id: {type: String, required: true},
    name: {type: String, required: true}
})

const Admin = new mongoose.model('Admin', adminSchema, 'admins')

module.exports = Admin