const jwt = require('jsonwebtoken')
require('dotenv').config()

const authorizationFunction = async (req, res, next) => {
    try {
        const authHeader = await req.headers['authorization']
        let jwtToken;
        if(authHeader !== undefined){
            jwtToken = authHeader.split(' ')[1]
        }
        if(jwtToken == undefined){
            res.status(404)
            res.json({error_msg: 'Unauthorized'})
        }
        else {
            jwt.verify(jwtToken, process.env.JWT_SECRECT_KEY, (error, payLoad) => {
                if(error){
                    res.status(400)
                    res.json({error_msg: 'Invalid Token'})
                } else {
                    req.userId = payLoad.userId,
                    req.userRole = payLoad.role
                    next()
                }
            })
        }
    } catch (err){
        res.status(400)
        res.json({authorization_error: err.message})
    }
}

module.exports = authorizationFunction