const {Router} = require('express');
const multer  = require('multer');
const path = require('path');
const Blog = require('../models/blog')
const Comment = require('../models/comment')

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
  const blog = await Blog.findById(id).populate("createdBy");
  const comments = await Comment.find({ blogId:id }).populate("createdBy");
  // console.log(blog,'blog')
  return res.render('blog',{
    user:req.user,
    blog,
    comments,
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
})

// Comment routing

router.post('/comment/:blogId',async(req,res)=>{
  await Comment.create({
    content:req.body.content,
    blogId:req.params.blogId,
    createdBy:req.user._id,
  })
  return res.redirect(`/blog/${req.params.blogId}`)
})


module.exports = router;