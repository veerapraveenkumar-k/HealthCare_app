const express = require('express')
const jwt = require('jsonwebtoken')
const bcrypt = require('bcryptjs')
const {v4: uuidV4} = require('uuid')
const User = require('../models/userSchema')
const Patient = require('../models/patientSchema')
const Apointment = require('../models/appointmentSchema')
const AuthorizationFunction = require('../middlewareFunctions/authorization')
require('dotenv').config()

const router = express.Router()

router.post('/login', async (req, res) => {
    try {
        const {email, password} = await req.body
        const user = await User.findOne({
            $and: [
                {email: email},
                {role: 'Patient'}
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
    const {userDetails} = await req.body
    try {
        const newProfile = new Patient({
            user_id: userId,
            name: userDetails.name,
            gender: userDetails.gender,
            age: userDetails.age,
            mobile_no: userDetails.mobileNum
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
        const userProfile = await Patient.findOne({user_id: userId})
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
        const {updateDetails} = await req.body
        const userProfile = await Patient.findOne({user_id: userId})
        if(userProfile != undefined){
            await Patient.updateOne({user_id: userId}, {
                name: updateDetails.name || userProfile.name,
                gender: updateDetails.gender || userProfile.gender,
                age: updateDetails.age || userProfile.age,
                mobile_no: updateDetails.mobileNum || userProfile.mobile_no
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

router.post('/book-appointment', AuthorizationFunction, async (req, res) => {
    try {
        const userId = await req.userId
        const userRole = await req.userRole
        if(userRole === 'Patient'){
            const {appoinmentDetails} = await req.body
            const newAppointment = new Apointment({
                patient_id: userId,
                appointment_id: uuidV4(),
                description: appoinmentDetails.description,
                date: appoinmentDetails.date,
                status: 'Requested'
            })
            await newAppointment.save()
            res.status(200)
            res.json({
                message: 'Appointment Booked Successfully',
                appointment_id: newAppointment.appointment_id
            })
        } else {
            res.status(401)
            res.json({error_msg: 'Unauthorized'})
        }
    } catch (err){
        res.status(400)
        res.json({error_msg: 'Failed To Book an Appointment'})
    }
})

router.get('/get-appointments', AuthorizationFunction, async (req, res) => {
    try {
        const userId = await req.userId
        const appointmentList = await Apointment.find({patient_id: userId})
        res.status(200)
        res.json({appointment_list: appointmentList})
    } catch(err){
        res.status(400)
        res.json({error_msg: 'Failed To Get an Appointments'})
    }
})

module.exports = router