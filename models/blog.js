const {Schema, model} = require("mongoose");

const blogSchema = new Schema({
    title : {
       type:String,
       required:true,
    },
    content:{
        type: String, 
        required: true,
    },
    coverImageURL:{
        type: String,
    },
    craetedBy:{
        type:Schema.Types.ObjectId,
        ref:'user'
    }
},{timestamps:true})

const Blog = model('blog',blogSchema);

module.exports = Blog;