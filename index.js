const express = require('express');
const mongoose = require('mongoose');
const path = require('path')
const Blog = require('./models/blog')
const {checkForAuthenticationByCookie} = require('./middlewares/auth')
const cookieParser = require('cookie-parser')
const flash = require('connect-flash');

const userRouter = require('./routes/user');
const blogRouter = require('./routes/blog');



const app = express();
const PORT = 8000;
mongoose.connect('mongodb://127.0.0.1:27017/blognode').then(e=>console.log('MongoDB Connected'));

app.use(express.urlencoded({extended : false}));
app.use(cookieParser())
app.use(flash());
app.use(checkForAuthenticationByCookie('token'));
app.use(express.static(path.join(__dirname, 'public')));

app.set('view engine','ejs');
app.set(__dirname,path.resolve('views'));


app.use('/user',userRouter);
app.use('/blog',blogRouter);
app.get('/',async function(req,res){
    const allBlogs = await Blog.find({});
    res.render('home',{
    blogs:allBlogs,
    user : req.user,
    });
})

app.listen(PORT,()=>console.log(`Server Started at ${PORT}`));