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

router.post('/delete/:blogId', async (req, res, next) => {
  const id = req.params.blogId;

  try {
    const blog = await Blog.findById(id).populate("createdBy");
    console.log(blog);

    const currentUserId = req.user._id; // Assuming you have a user object with an _id property
    const blogCreatorId = blog.createdBy._id; // Extract creator's ID from the populated object

    console.log(currentUserId, "CurrentUserId");
    console.log(blogCreatorId.toString(), "blogCreatorId"); // Extract the string representation

    if (currentUserId.toString() !== blogCreatorId.toString()) {
      return res.json("You are not Authorized to Delete This Blog");
    }

    await Blog.deleteOne({ _id: id });
    console.log("Blog Deleted");

    return res.redirect('/');
  } catch (error) {
    console.error(error.message);
    throw error;
  }
});

router.get('/edit/:blogId',async (req,res)=>{
  const blogId = req.params.blogId;
  const blog = await Blog.findById({_id : blogId});
  console.log(blog)

  return res.render('blogEditPage',{
    user : req.user,
    blog,
  })
})
router.post('/update/:blogId', upload.single('coverImage'), async (req, res) => {
  const blogId = req.params.blogId;

  const coverImageURL = req.file ? `/uploads/${req.file.filename}` : req.body.coverImageURL; // Handle existing coverImageURL if needed
  const { title, content } = req.body;

  try {
    const updatedBlog = await Blog.findOneAndUpdate(
      { _id: blogId },
      { coverImageURL, title, content },
      { new: true } // Return the updated document
    );

    
    // Handle success (e.g., redirect with a success message)
    console.log('success', 'Blog updated successfully!'); // Assuming you have flash messages implemented

    res.redirect(`/blog/${updatedBlog._id}`); // Redirect to the updated blog page

  } catch (error) {
    console.error(error.message);
    console.log('error', 'Error updating blog!'); // Handle errors with flash messages
    res.redirect(`/blog/edit/${blogId}`); // Redirect back to the edit page
  }
});


module.exports = router;