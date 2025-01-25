const express = require('express')
const jwt = require('jsonwebtoken')
const bcrypt = require('bcryptjs')
const {v4: uuidV4} = require('uuid')
const User = require('../models/userSchema')
const Patient = require('../models/patientSchema')
const Apointment = require('../models/appointmentSchema')
const Doctor = require('../models/doctorsSchema')
const AuthorizationFunction = require('../middlewareFunctions/authorization')
require('dotenv').config()

const router = express.Router()

router.post('/login', async (req, res) => {
    try {
        const {email, password} = await req.body
        const user = await User.findOne({
            $and: [
                {email: email},
                {role: 'Doctor'}
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
        const newProfile = new Doctor({
            user_id: userId,
            name: userDetails.name,
            gender: userDetails.gender,
            age: userDetails.age,
            mobile_no: userDetails.mobileNum,
            specialization: userDetails.specialization
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
        const userProfile = await Doctor.findOne({user_id: userId})
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
        const userProfile = await Doctor.findOne({user_id: userId})
        if(userProfile != undefined){
            await Doctor.updateOne({user_id: userId}, {
                name: updateDetails.name || userProfile.name,
                gender: updateDetails.gender || userProfile.gender,
                age: updateDetails.age || userProfile.age,
                mobile_no: updateDetails.mobileNum || userProfile.mobile_no,
                specialization: updateDetails.specialization || userProfile.specialization
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

router.put('/change-available-status', AuthorizationFunction, async (req, res) => {
    try {
        const userId = await req.userId
        const {availableStatusValue} = await req.body
        const userProfile = await Doctor.findOne({user_id: userId})
        if(userProfile != undefined){
            const result = await Doctor.updateOne({user_id: userId}, {
                available_status: availableStatusValue
            })
            res.status(200)
            res.json({message: 'Status Updated Successfully'})
        }
        else {
            res.status(404)
            res.json({error_msg: 'No Profile Found'})
        }

    } catch (err){
        res.status(400)
        res.json({error_msg: 'Failed To Update Available Status'})
    }
})

router.get('/get-appointments', AuthorizationFunction, async (req, res) => {
    try {
        const userId = await req.userId
        const appointmentList = await Apointment.find({doctor_id: userId})
        res.status(200)
        res.json({appointment_list: appointmentList})
    } catch(err){
        res.status(400)
        res.json({error_msg: 'Failed To Get an Appointments'})
    }
})

module.exports = router