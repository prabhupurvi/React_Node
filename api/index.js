const express = require("express")
// Middleware to connect express
const cors = require('cors')
// For database
const mongoose = require("mongoose")
const User = require("./models/User")
// To encrypt 
const bcrypt = require('bcryptjs');
const app = express();

const salt = bcrypt.genSaltSync(10);
const secret ='dkjedjedbsywhs2w92w2o2292o1019w2o1019'

app.use(cors({credentials:true,origin:'http://localhost:3000'}))
app.use(express.json())
const jwt = require('jsonwebtoken')
// Database connection
// y4XdFdfBh654WuRm
// mongodb+srv://prabhupurvi:y4XdFdfBh654WuRm@cluster0.eezgwzc.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0
mongoose.connect('mongodb+srv://prabhupurvi:y4XdFdfBh654WuRm@cluster0.eezgwzc.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0')

// Register 
app.post('/register',async (req,res)=>{
    const {username,password} = req.body
    try{
        const userDoc = await User.create({username,password:bcrypt.hashSync(password,salt)})
        res.json(userDoc)
    }catch(e){
        console.log(e)
        res.status(400).json(e)
    }
})

// Login
app.post('/login',async (req,res)=>{
    const {username,password} = req.body
    const UserDoc = await User.findOne({username})
    const passOk = bcrypt.compareSync(password,UserDoc?.password?UserDoc.password:"")
    if(passOk){
        // Logged in
        jwt.sign({username,id:UserDoc._id},secret,{},(err,token)=>{
            if(err) throw err
            res.cookie('token',token).json('ok')
        })
    }else{
        res.status(400).json('Wrong credentials')
    }
})


app.listen(4000)