const express = require("express")
// Middleware to connect express
const cors = require('cors')
// For database
const mongoose = require("mongoose")
const User = require("./models/User")
const Post = require("./models/Post")
// To encrypt 
const bcrypt = require('bcryptjs');
const cookieParser = require('cookie-parser');
const multer = require('multer'); 
const uploadMiddleware = multer({ dest: 'uploads/' })
const fs = require('fs');
const app = express();

const salt = bcrypt.genSaltSync(10);
const secret ='dkjedjedbsywhs2w92w2o2292o1019w2o1019'

app.use(cors({credentials:true,origin:'http://localhost:3000'}))
app.use(express.json())
app.use(cookieParser())
app.use('/uploads',express.static(__dirname + '/uploads'))
const jwt = require('jsonwebtoken')
const PostModel = require("./models/Post")
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
            res.cookie('token',token).json({
                id:UserDoc._id,
                username
            })
        })
    }else{
        res.status(400).json('Wrong credentials')
    }
})

// check if user is logged in
app.get('/profile',(req, res)=>{
    const {token} = req.cookies
    jwt.verify(token,secret,{},(err,info)=>{
        if(err) throw err
        res.json(info)
    })
})

// logout
app.post('/logout',(req, res)=>{
    res.cookie('token','').json('ok')
})

// createpost
app.post('/post',uploadMiddleware.single("file"),async (req, res)=>{
    const {originalname,path} = req.file
    const parts = originalname.split('.')
    const ext = parts[parts.length-1];
    const newPath = `${path}.${ext}`
    fs.renameSync(path,newPath)

    const {token} = req.cookies
    jwt.verify(token,secret,{},async (err,info)=>{
        console.log(info)
        if(err) throw err
        const{title,summary,content} = req.body
        const postDoc = await Post.create({
            title,
            summary,
            content,
            cover:newPath,
            author: info.id
        })
        res.json(postDoc)
    })
})

//get posts
app.get('/post', async (req, res)=>{
    const posts = await Post.find()
    .populate('author',['username'])
    .sort({createdAt:-1})
    .limit(20)
    res.json(posts)
})

app.get('/post/:id', async (req, res)=>{
    const {id} = req.params
    const postDoc = await Post.findById(id).populate('author',['username'])
    res.json(postDoc)

})

app.put('/post/:id', uploadMiddleware.single("file"), async (req, res)=>{
    let newPath = null
    if(req.file){
        const {originalname,path} = req.file
        const parts = originalname.split('.')
        const ext = parts[parts.length-1];
        newPath = `${path}.${ext}`
        fs.renameSync(path,newPath)
    }

    const {token} = req.cookies
    jwt.verify(token,secret,{},async (err,info)=>{
        console.log(info)
        if(err) throw err
        const{id,title,summary,content} = req.body
        const postDoc = await Post.findById(id)
        const isAuthor =  JSON.stringify(postDoc.author) === JSON.stringify(info.id)
        if(!isAuthor){
            return  response.status(404).json('You are not the author')
            // throw 'You are not the author'
        } 
        await postDoc.update({title,
            summary,
            content,
            cover:newPath?newPath:postDoc.cover})
        res.json(postDoc)
    })
})

app.listen(4000)