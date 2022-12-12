const express = require('express');
const connection = require('../connection');
const router = express.Router();

const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');
const { response } = require('express');
require('dotenv').config();
var auth = require('../services/authrntication');
var checkRole = require('../services/checkRole');

router.post('/signup', (req, res)=>{
    let user = req.body;
    query = "select email, password, role, status from user where email = ?"
    connection.query(query,[user.email],(err, results)=>{
        if(!err){
            if(results.length <= 0){
                query = "insert into user(name, contactNumber, email,password, status,role) values(?,?,?,?,'false','user')";
                connection.query(query,[user.name, user.contactNumber, user.email, user.password],(err, results)=>{
                    if(!err){
                        return res.status(200).json({message: "Sucessfully Registered"});
                    }
                    else{
                        return res.status(500).json(err);
                    }
                })
            }
            else {
                return res.status(400).json({message: "Email Already Exist."});
            }
        } else{
            return res.status(500).json(err);
        }
    })
})

router.post('/login',(req,res)=>{
    const user = req.body;
    query = "select email, password, role, status from user where email = ?";
    connection.query(query, [user.email],(err,results)=>{
        if(!err){
            if(results.length  <= 0 || results[0].password != user.password){
                return res.status(401).json({message:"Incorrect Username or Password"});
            }
            else if(results[0].status === 'false'){
                return res.status(401).json({message: "Wait for Admin Approval"});
            }
            else if(results[0].password == user.password){
                const response = {email: results[0].email,role:results[0].role}
                const acessToken = jwt.sign(response, process.env.ACCESS_TOKEN,{expiresIn: '8h'})
                res.status(200).json({token:accessToken});

            } 
            else{
                return res.status(400).json({message:"Something went wrong. Please try again later"});
            }

        } else{
            return res.status(500).json(err);
        }

    })
})
var transport = nodemailer.createTransport({
    service:'gmail',
    auth:{
        user: process.env.EMAIL,
        pass: process.env.PASSWORD
    }
})
router.post('forgotPassword',(req,res)=>{
    const user = req.body;
    query = "select email, password from user where email=?";
    connection.query(query,[user.email],(err, results)=>{
        if(!err){
            if(results.length <= 0){
                return res.status(200).json({message:"Password sent sucessfully to your email."});
            }
            else {
                var mailOptions = {
                    from: process.env.EMAIL,
                    to: results[0].email,
                    subject: 'Password by Cafe Management System',
                    html: '<p><br> Your Login details for Cafe Management System </br'+results[0].email+'<br> <br>Password: </br>'+results[0].password+ '<br> <a href = " http:// localhost:4200/"> Click here to login </a></p>'
                };

                transporter.sendMail(mailOptions, function(error, info){
                    if(error){
                        console.log(error);
                        }
                        else{
                            console.log('Eamil sent:' +info.response);
                        }
                   
                });
                return res.status(200).json({message:"Password sent sucessful;y to your email."});
            }
        }
        else {
            return res.status(500).json(err);
        }
    })
})

router.get('/get',auth.authenticateToken,(req, res)=>{
    var query = "select id, name,  email, contactNumber, status from user where role = 'user'";
    connection.query(query,(err,results) =>{
        if(!err){
            return res.status(200).json(results);
        } else{
            return res.status(500).json(err);
        }
    })
})

router.patch('/update',auth.authenticateToken,(req, res)=>{
    let user = req.body;
    var query = "update user set status = ? where id=?";
    connection.query(query,[user.status, user.id], (err, results)=>{
        if(!err){
            if(results.affectedRows == 0){
                return res.status(400).json({message:"User id does not  exist"});
            }
            return res.status(200).json({message:"User update Sucessfully"});
        } else{
            return res.status(500).json(err);
        }

    })
})

router.get('/checkToken',auth.authenticateToken,(req, res)=>{
    return res.status(200).json({message:"True"});

})
router.get('/changePassword', (req, res)=>{


})

module.exports = router