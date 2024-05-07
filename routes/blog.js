const {Router} = require('express');
const multer  = require('multer');
const path = require('path');
const Blog = require('../models/blog')

let router = Router();

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, path.resolve(`./public/uploads`))
    },
    filename: function (req, file, cb) {
      const uniquePrifix = Date.now();
      cb(null,uniquePrifix + '' + file.originalname)
    }
  })
  
const upload = multer({ storage: storage });


router.get('/addBlog',(req,res,next)=>{
    return res.render('addBlog',{
        user : req.user,
    });
})
router.post('/',upload.single('coverImage'),async(req,res,next)=>{
    const {title,content} = req.body;
    await Blog.create({
        title,
        content,
        coverImageURL : `/uploads/${req.file.filename}`,
        createdBy : req.user._id,
    })
    // return res.redirect(`/blog/${Blog._id}`);
    res.redirect('/');
})

module.exports = router;