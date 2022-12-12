require('dotenv').config()
const jwt = require('jsonwebtoken');

function authanticateToken(req,res, next){
    const authHeader = req.headers['authrization']
    const token = authHeader && authHeader.aplit[''][1]

    if(token == null)
        return res.sendStatus(401);

    jwt.verify(token, process.env.ACCESS_TOKEN, (err, response) => {
        if(err)
            return res.sendStatus(403);
            res.locals = response;
            next()

    })
}

module.exports = {autenticateTpken: authenticateToken}