const express = require('express');
const mongoose = require('mongoose');
const path = require('path')
const userRouter = require('./routes/user')



const app = express();
const PORT = 8000;
mongoose.connect('mongodb://127.0.0.1:27017/blognode').then(e=>console.log('MongoDB Connected'));

app.use(express.urlencoded({extended : false}));
app.use(express.static(path.join(__dirname, 'public')));

app.set('view engine','ejs');
app.set(__dirname,path.resolve('views'));


app.use('/user',userRouter);
app.get('/',function(req,res){
    res.render('home');
})

app.listen(PORT,()=>console.log(`Server Started at ${PORT}`));