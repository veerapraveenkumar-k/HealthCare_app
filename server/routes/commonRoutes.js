const express = require('express')
const User = require('../models/userSchema')
const AuthorizationFunction = require('../middlewareFunctions/authorization')
const bcrypt = require('bcryptjs')
const Staff = require('../models/staffsSchema')
const Patient = require('../models/patientSchema')
const Doctor = require('../models/doctorsSchema')
const Apointment = require('../models/appointmentSchema')
const Verification = require('../models/verificationSchema')
const nodemailer = require("nodemailer")
const jwt = require('jsonwebtoken')
const {v4: uuidV4}  = require('uuid')
require("dotenv").config();


const router = express.Router()

router.post('/login', async (req, res) => {
    try {
        const {email, password} = await req.body
        const user = await User.findOne({email: email})
        if(user != undefined){
            const isPassCorrect = await bcrypt.compare(password, user.password)
            if(isPassCorrect){
                const payLoad = {
                    userId: user.user_id,
                    role: user.role
                }
                const jwtToken = jwt.sign(payLoad, process.env.JWT_SECRECT_KEY)
                console.log(payLoad)
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

router.post('/create-account', async (req, res) => {
    try {
        const {email, password, role} = await req.body
        const user = await User.findOne({email: email})
        if(user != undefined){
            res.status(400)
            res.json({error_msg: 'This email already exist'})
        }
        else {
            if(password.length >= 5){
                const hashedpass = await bcrypt.hash(password, 10)
                const newUser = new User({
                    user_id: uuidV4(),
                    email: email,
                    password: hashedpass,
                    role: role
                })
                await newUser.save()
                res.status(200)
                res.json({
                    message: 'User Created SuccessFully',
                    user_id: newUser.user_id
                })
            } else {
                res.status(400)
                res.json({error_msg: 'The Password must contain minimum 5 characters'})
            }
        }
    } catch (err){
        res.status(400)
        res.json({error_msg: err.message})
    }
})

router.delete('/delete-user-account', AuthorizationFunction, async (req, res) => {
    try {
        const userRole = req.userRole
        if(userRole === 'Admin'){
            const {deleteUserId} = await req.body
            const user = await User.findOne({user_id: deleteUserId})
            const role = user.role
            console.log(role)
            await User.deleteOne({user_id: deleteUserId})
            if(role === 'Staff'){
                await Staff.deleteOne({user_id: deleteUserId})
            } else if(role === 'Doctor'){
                await Doctor.deleteOne({user_id: deleteUserId})
            }else {
                await Patient.deleteOne({user_id: deleteUserId})
            }
            res.status(200)
            res.json({message: 'User Delete SuccessFully'}) 
        } else {
            res.status(400)
            res.json({error_msg: 'Unauthorized'})
        }  
    } catch(err){
        res.status(400)
        res.json({error_msg: err.message})
    }
})

router.delete('/delete-account', AuthorizationFunction, async (req, res) => {
    try {
        const userId = await req.userId
        const role = await req.userRole
        await User.deleteOne({user_id: userId})
        if(role === 'Staff'){
            await Staff.deleteOne({user_id: deleteUserId})
        } else if(role === 'Doctor'){
            await Doctor.deleteOne({user_id: deleteUserId})
        }else {
            await Patient.deleteOne({user_id: deleteUserId})
        }
        res.status(200)
        res.json({message: 'User Delete SuccessFully'}) 
    } catch(err){
        res.status(400)
        res.json({error_msg: err.message})
    }
})

router.put('/update-password', AuthorizationFunction, async (req, res) => {
    try {
        const userId = await req.userId
        const {newPassword} = await req.body
        const hashedpass = await bcrypt.hash(newPassword, 10)
        await User.updateOne({user_id: userId}, 
            {password: hashedpass}
        )
        res.status(200)
        res.json({message: 'Password Successfully Updated'})
    } catch(err){
        res.status(400)
        res.json({error_msg: err.message})
    }
})

router.delete('/delete-appoinment', AuthorizationFunction, async (req, res) => {
    try {
        const userRole = req.userRole
        if(userRole === 'Admin' || userRole === 'Staff'){
            const {deleteAppointmentId} = await req.body
            await Apointment.deleteOne({appointment_id: deleteAppointmentId})
            res.status(200)
            res.json({message: 'Appointment Deleted SuccessFully'}) 
        } else {
            res.status(400)
            res.json({error_msg: 'Unauthorized'})
        }  
    } catch(err){
        res.status(400)
        res.json({error_msg: err.message})
    }
})

const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: process.env.EMAIL_PORT,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
})

router.post("/send-verification-email", async (req, res) => {
    const { email } = await req.body;
    if (!email) return res.status(400).send("Email is required");
    console.log(email)
    // Create a OTP
    const otp = Math.ceil(Math.random() * 8000 + 1000)
    console.log(otp)
    const mailOptions = {
        from: process.env.EMAIL_USER,
        to: email,
        subject: "Email Verification",
        text: `Your OTP Is ${otp}`
    }
    
    transporter.sendMail(mailOptions, async (error, info) => {
    if (error) {
        res.status(500)
        res.json({error_msg: error.message})
    } else {
        const newOtp = new Verification({
            email: email,
            otp: otp
        })
            await newOtp.save()
            res.status(200).send("OTP sent successfully");
        }
    });
})
    
router.post("/verify-email", async (req, res) => {
    const {email, otp} = await req.body
    if (!otp) return res.status(400).send("OTP is missing");
    try {
        const isOtpCorrect = await Verification.findOne({
            $and: [
                {email: email},
                {otp: otp}
            ]
        })
        if(isOtpCorrect == undefined){
            res.status(400)
            res.json({error_msg: "Invalid OTP"})
        }
        else {
            await Verification.deleteOne({email: email})
            res.status(200)
            res.json({msg: 'OTP Verified'})
        }
    }catch (err) {
        res.status(400)
        res.json({error_msg: "Can't Verify OTP"})
    }
})


module.exports = router