const mongoose = require('mongoose')


const appointmentSchema = new mongoose.Schema({
    patient_id: {type: String, required: true},
    appointment_id: {type: String, required: true},
    description: {type: String, required: true},
    date: {type: Date, required: true},
    status: {type: String, required: true},
    doctor_id: {type: String}
})

const Appointment = new mongoose.model('Apointment', appointmentSchema, 'appointments')

module.exports = Appointment