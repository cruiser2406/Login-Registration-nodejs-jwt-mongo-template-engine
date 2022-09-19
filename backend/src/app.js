require('dotenv').config();
const express = require('express')
const app = express();
const path = require("path");

require("./db/conn")
const Register = require("./models/registers");
const port = process.env.PORT || 3000;
const static_path = path.join(__dirname,"../public")
const template_path = path.join(__dirname,"../templates/views")
const partials_path = path.join(__dirname,"../templates/partials")
const bcrypt = require('bcryptjs');
//const jwt = require("jsonwebtoken");
const auth = require("./middleware/auth")
const cookieParser = require("cookie-parser");
const hbs = require("hbs");
app.use(express.json());
app.use(cookieParser());
app.use(express.urlencoded({extended:false}));
app.use(express.static(static_path))
app.set("view engine","hbs");
app.set("views",template_path);
hbs.registerPartials(partials_path);
console.log(process.env.SECRET_KEY);
app.get('/',(req,res)=>{
    res.render("index")
});
app.get('/secret',auth,(req,res)=>{
    console.log(`this is the cookkie ${req.cookies.jwt}`); 
    res.render("secret")
})
app.get('/register',(req,res)=>{
    res.render("register")
})
app.post('/register',async (req,res)=>{
    try{
       const psw = req.body.psw;
       const pswrepeat = req.body.pswrepeat;
      if(psw === pswrepeat){
      const registerUser = new Register({
        firstName:req.body.firstName,
        lastName:req.body.lastName,
        phone:req.body.phone,
        email:req.body.email,
        age:req.body.age,
        gender:req.body.gender,
        psw:psw,
        pswrepeat:pswrepeat

      })
      console.log("sucess part"+registerUser);
    const token = await registerUser.generateAuthtoken();
    console.log('the token is'+token);
    res.cookie("jwt",token,{
        expires: new Date(Date.now()+600000),
        httpOnly:true
    });
     const registered = await  registerUser.save();
     res.status(201).render("index");
      }else{
        res.send('passwords dont match')
      }
    } 
    catch(error){
        res.status(400).send(error);
    }
    //res.render("register")
})
app.get('/login',(req,res)=>{
    res.render("login")
})
app.get('/logout',auth,async(req,res)=>{
try{
    
    req.user.tokens = req.user.tokens.filter((element)=>{
        return element.token != req.token
    })
    res.clearCookie("jwt");
    console.log('logout');
   await req.user.save();
    res.render("logout");
}catch(error){res.status(401).send(error)}
})
app.post('/login',async (req,res)=>{
    try{
    const email = req.body.email;
    const password = req.body.psw;
    const useremail = await Register.findOne({email:email});
    const isMatch = await bcrypt.compare(password,useremail.psw);
    const token = await useremail.generateAuthtoken();
    console.log('the token is'+token);
    res.cookie("jwt",token,{
        expires: new Date(Date.now()+30000),
        httpOnly:true,
        //secure:true
    });
    
    if(isMatch){
    res.status(201).render("index");
    }
    else{
        res.send("passwords is wrong");
    }
}
    catch(error){
        res.status(400).send("invalid email")
    }

})
const jwt = require('jsonwebtoken');
// const createToken = async()=>{
//     const token = await jwt.sign({_id:"62b20c84e6f4dccf3c112412"},"secret123",
//     {
//         expiresIn:"1 hour"
//     }); 
//     console.log(token);
//     const userVer = await jwt.verify(token,"secret123")
//     console.log(userVer)
// } 
// createToken();
app.listen(port,()=>{
    console.log(`server is running at port number ${port}`)
})