const express = require('express')
const jwt = require('jsonwebtoken')
const bcrypt = require('bcryptjs')
const {v4: uuidV4} = require('uuid')
const User = require('../models/userSchema')
const Patient = require('../models/patientSchema')
const Apointment = require('../models/appointmentSchema')
const Admin = require('../models/adminSchema')
const AuthorizationFunction = require('../middlewareFunctions/authorization')
const Doctor = require('../models/doctorsSchema')
const Staff = require('../models/staffsSchema')
const Appointment = require('../models/appointmentSchema')
require('dotenv').config()

const router = express.Router()

router.post('/login', async (req, res) => {
    try {
        const {email, password} = await req.body
        const user = await User.findOne({
            $and: [
                {email: email},
                {role: 'Admin'}
            ]
        })
        if(user != undefined){
            const isPassCorrect = await bcrypt.compare(password, user.password)
            if(isPassCorrect){
                const payLoad = {
                    userId: user.user_id,
                    role: user.role
                }
                const jwtToken = jwt.sign(payLoad, process.env.JWT_SECRECT_KEY)
                res.status(200)
                res.json({jwt_token: jwtToken})
            } else {
                res.status(400)
                res.json({error_msg: "The email and password doesn't match"})
            }
        } else {
            res.status(404)
            res.json({error_msg: 'Invalid email address'})
        }
    } catch (err){
        res.status(400)
        res.json({
            error_msg: 'Login Failed'
        })
    }
})

router.post('/create-profile', AuthorizationFunction, async (req, res) => {
    const userId = await req.userId
    const {name} = await req.body
    try {
        const newProfile = new Admin({
            user_id: userId,
            name: name
        })
        await newProfile.save()
        res.status(200)
        res.json({message: 'Profile Created Successfully'})
    } catch (err){
        res.status(400)
        res.json({error_msg: 'Failed To Create a Profile'})
    }
})

router.get('/get-profile', AuthorizationFunction, async (req, res) => {
    try {
        const userId = await req.userId
        const userProfile = await Admin.findOne({user_id: userId})
        if(userProfile != undefined){
            res.status(200)
            res.json({profile: userProfile})
        } else {
            res.status(404)
            res.json({error_msg: 'No Profile Found'})
        }
    } catch (err){
        res.status(400)
        res.json({error_msg: 'Failed To Get a Profile'})
    }
})

router.put('/update-profile', AuthorizationFunction, async (req, res) => {
    try {
        const userId = await req.userId
        const {name} = await req.body
        const userProfile = await Admin.findOne({user_id: userId})
        if(userProfile != undefined){
            await Admin.updateOne({user_id: userId}, {
                name: name || userProfile.name
            })
            res.status(200)
            res.json({message: 'Profile Updated Successfully'})
        }
        else {
            res.status(404)
            res.json({error_msg: 'No Profile Found'})
        }
    } catch (err){
        res.status(400)
        res.json({error_msg: 'Failed To Update a Profile'})
    }
})

router.get('/get-patient-profile', AuthorizationFunction, async (req, res) => {
    try {
        const userRole = await req.userRole
        if(userRole === 'Admin'){
            const patientList = await Patient.find()
            res.status(200)
            res.json({patient_list: patientList})
        } else {
            res.status(401)
            res.json({error_msg: 'Unauthorized'})
        }
    } catch (err){
        re.status(400)
        res.json({error_msg: 'Unable to get Patient Profile'})
    }
})

router.get('/get-doctors-profile', AuthorizationFunction, async (req, res) => {
    try {
        const userRole = await req.userRole
        if(userRole === 'Admin'){
            const doctorsList = await Doctor.find()
            res.status(200)
            res.json({doctors_list: doctorsList})
        } else {
            res.status(401)
            res.json({error_msg: 'Unauthorized'})
        }
    } catch (err){
        re.status(400)
        res.json({error_msg: 'Unable to get Doctors Profile'})
    }
})

router.get('/get-staffs-profile', AuthorizationFunction, async (req, res) => {
    try {
        const userRole = await req.userRole
        if(userRole === 'Admin'){
            const staffsList = await Staff.find()
            res.status(200)
            res.json({staffs_list: staffsList})
        } else {
            res.status(401)
            res.json({error_msg: 'Unauthorized'})
        }
    } catch (err){
        re.status(400)
        res.json({error_msg: "Unable to get Staff's Profile"})
    }
})

router.get('/get-all-appointments', AuthorizationFunction, async (req, res) => {
    try {
        const userRole = await req.userRole
        if(userRole === 'Admin'){
            const appointmentsList = await Appointment.find()
            res.status(200)
            res.json({appointments_list: appointmentsList})
        } else {
            res.status(401)
            res.json({error_msg: 'Unauthorized'})
        }
    } catch (err){
        re.status(400)
        res.json({error_msg: "Unable to get appointment's details"})
    }
})


module.exports = router