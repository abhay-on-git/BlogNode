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

router.get('/:id',async(req,res)=>{
  const id=req.params.id;
  // console.log(id)
  const blog = await Blog.findById(id)
  return res.render('blog',{
    user:req.user,
    blog,
  })
})

router.post('/',upload.single('coverImage'),async(req,res,next)=>{
   const {title,content} = req.body;
   const blog =  await Blog.create({
        title,
        content,
        coverImageURL : `/uploads/${req.file.filename}`,
        createdBy : req.user._id,
    })
    return res.redirect(`/blog/${blog._id}`);
    // res.redirect('/');
})


module.exports = router;