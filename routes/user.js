const {Router} = require('express')
const User = require('../models/user');

const router = Router();

router.get('/signin',(req,res)=>{
    res.render('signin');
})
router.get('/signup',(req,res)=>{
    res.render('signup');
})

router.post('/signin',(req,res)=>{
    const {email,password} = req.body;
    const user = User.matchPassword(email,password);
    if(!user) return res.redirect('/signin')
    res.redirect('/');
})
router.post('/signup',async(req,res)=>{
    console.log(req.body)
    const {fullName,email,password} = req.body;
    await User.create({
      fullName,
      email,
      password,
    })
    return res.redirect('/');
})

module.exports = router;