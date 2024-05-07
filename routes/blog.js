const {Router} = require('express');
const multer  = require('multer');
const path = require('path');

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
router.post('/',upload.single('coverImage'),(req,res,next)=>{

    console.log(req.body,'body')
    console.log(req.file,'file')
    res.redirect('/');
})

module.exports = router;