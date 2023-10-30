const express=require("express")
const mongoose=require("mongoose")
const cors=require("cors")
const bcrypt=require("bcrypt")
const jwt=require('jsonwebtoken')
const cookieParser=require("cookie-parser")
const nodemailer=require("nodemailer")
const dotenv=require('dotenv')
const UserAccountModel=require('./models/UserAccountM')

const app=express()
app.use(cors(
    {
        origin:["http://localhost:5173"],
        methods:["POST","GET"],
        credentials:true
    }
))
app.use(express.json())
app.use(cookieParser())
dotenv.config()

mongoose.connect(`${process.env.dbUrl}/${process.env.dbName}`)

app.post('/register',(req,res)=>{
    const {name,email,password}=req.body;
    bcrypt.hash(password,process.env.SALT_ROUNDS)
    .then(hash=>{
        UserAccountModel.create({name,email,password:hash})
        .then(accounts=>res.json(accounts))
        .catch(err=>res.json(err))
    }).catch(err=>console.log(err.message))
   
})

app.post("/login",(req,res)=>{
    const {email,password}=req.body;
    UserAccountModel.findOne({email:email})
    .then(user=>{
        
        if(user){
            bcrypt.compare(password,user.password,(err,response)=>{
                if(response){
                    const token=jwt.sign({email:user.email},process.env.JWT_SECRET,process.env.JWT_EXPIRE)
                    res.cookie("token",token)
                    res.json("Success")
                }
                else{
                    res.json("Incorrect Password")
                }
            })
        }
        else{
            res.json("Not yet registered")
        }
    })
})

app.post('/forgot-password',(req,res)=>{
    const {email}=req.body
    UserAccountModel.findOne({email:email})
    .then(user=>{
        if(!user){
            return res.send({Status:"User not existed"})
        }
        const token=jwt.sign({id:user._id},process.env.JWT_SECRET,process.env.JWT_EXPIRE)
        var transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
              user: 'vidhyasuri97@gmail.com',
              pass: 'kvnk krya sgto kzkp'
            }
          });
          
          var mailOptions = {
            from: 'vidhyasuri97@gmail.com',
            to: 'vidhyasuri97@gmail.com',
            subject: 'Reset your password',
            text: `http://localhost:5173/reset-password/${user._id}/${token}`
          };
          
          transporter.sendMail(mailOptions, function(error, info){
            if (error) {
              console.log(error);
            } else {
             return res.json("Success")
            }
          });
    })
})

app.post('/reset-password/:id/:token',(req,res)=>{
    const {id,token}=req.params
    const {password}=req.body

    jwt.verify(token,"jwt-secret-key",(err,decoded)=>{
        if(err){
            return res.json({Status:"Error with token"})
        } else{
            bcrypt.hash(password,process.env.SALT_ROUNDS)
            .then(hash=>{
                UserAccountModel.findByIdAndUpdate({_id:id},{password:hash})
                .then(u=>res.send({Status:"Success"}))
                .catch(err=>res.send({Status:err}))
            })
        }
    })
})

app.listen(8000,()=>{console.log(`Server listening to port 8000`)})