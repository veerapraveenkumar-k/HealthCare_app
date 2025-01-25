const express = require('express')
const db = require('./config/db.js')
const cors = require('cors')
const bodyParser = require('body-parser')
const commonRouter = require('./routes/commonRoutes.js')
const patoentRouter = require('./routes/patientRoute.js')
const doctorRouter = require('./routes/doctorRoute.js')
const staffsRouter = require('./routes/staffsRoute.js')
const adminRouter = require('./routes/adminRoute.js')
require('dotenv').config()

const PORT = process.env.PORT
const app = express()

app.use(express.json())
app.use(bodyParser.json())
app.use(cors())

app.use('/api', commonRouter)
app.use('/api/patient', patoentRouter)
app.use('/api/doctor', doctorRouter)
app.use('/api/staff', staffsRouter)
app.use('/api/admin', adminRouter)

const initializationFunction = async () => {
    try {
        await db()
        app.listen(PORT, () => {
            console.log('Server is running on PORT: ', PORT)
        })
    } catch (err){
        console.log('Server Initialization Error: ',err.message)
        process.exit(1)
    }
}

initializationFunction()