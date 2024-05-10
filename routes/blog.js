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
  try {
    await Comment.create({
      content:req.body.content,
      blogId:req.params.blogId,
      createdBy:req.user._id,
    })
    return res.redirect(`/blog/${req.params.blogId}`)
  } catch (error) {
    console.log(error.message);
    return res.redirect(`/blog/${req.params.blogId}`)
  }
})

// Like route

router.post('/like/:blogId', async (req, res) => {
 try {
  const blogId = req.params.blogId;
  const userId = req.user._id;
  
  try {
    // Fetch the blog post
    const blog = await Blog.findById(blogId);

    if (!blog) {
      return res.status(404).send('Blog post not found');
    }

    // Check if the user has already liked the post
    const userHasLiked = blog.likes.includes(userId);
    const userHasDisliked = blog.dislikes.includes(userId);

    if (userHasDisliked) {
      // Remove existing dislike if present
      await Blog.findByIdAndUpdate(blogId, {
        $pull: { dislikes: userId },
      });
    }

    if (userHasLiked) {
      // User has already liked the post, remove the like
      await Blog.findByIdAndUpdate(blogId, {
        $pull: { likes: userId },
      });
    } else {
      // User has not liked the post yet, add the like
      await Blog.findByIdAndUpdate(blogId, {
        $push: { likes: userId },
      });
    }

    // Redirect back
    res.redirect('back');
  } catch (error) {
    console.log(error, 'error');
    res.status(500).send(error.message);
  }
 } catch (error) {
  console.log(error);
  return res.redirect('/user/signin');
 }
});


// Dislike route 
router.post('/disLike/:blogId', async (req, res) => {
  try {
    const blogId = req.params.blogId;
  const userId = req.user._id;
  
  try {
    // Fetch the blog post
    const blog = await Blog.findById(blogId);

    if (!blog) {
      return res.status(404).send('Blog post not found');
    }

    // Check if the user has already disliked the post
    const userHasDisliked = blog.dislikes.includes(userId);
    const userHasLiked = blog.likes.includes(userId);

    if (userHasLiked) {
      // Remove existing like if present
      await Blog.findByIdAndUpdate(blogId, {
        $pull: { likes: userId },
      });
    }

    if (userHasDisliked) {
      // User has already disliked the post, remove the dislike
      await Blog.findByIdAndUpdate(blogId, {
        $pull: { dislikes: userId },
      });
    } else {
      // User has not disliked the post yet, add the dislike
      await Blog.findByIdAndUpdate(blogId, {
        $push: { dislikes: userId },
      });
    }

    // Redirect back
    res.redirect('back');
  } catch (error) {
    console.log(error, 'error');
    res.status(500).send(error.message);
  }
  } catch (error) {
    console.log(error);
   return res.redirect('/user/signin');
  }

});

module.exports = router;