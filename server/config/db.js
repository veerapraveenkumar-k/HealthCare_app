const mongoose = require('mongoose')
require('dotenv').config()

const conection_string = process.env.MONGOOSE_CONNECTION_STRING

const dbConnection = async () => {
    try {
        await mongoose.connect(conection_string)
        console.log("DB Connected Successfully")
    } catch (err){
        console.log("DB Connection Error: ", err.message)
        process.exit(1)
    }
}

module.exports = dbConnection
