const {Schema, model} = require("mongoose");
const { createHmac, randomBytes } = require('crypto');
const { genrateTokenForUser } = require("../services/auth");

const userSchema = new Schema({
    fullName:{
        type:String,
        required:true,
    },
    email:{
        type:String,
        unique:true,
        required:true,
    },
    password:{
        type:String,
        required:true,
    },
    salt:{
        type:String,
    },
    profileImageURL:{
        type: String,
        default: "/images/default.png",
    },
    role:{
        type:String,
        enum:["user","admin"],
        default:"user",
    }
},{timestamps:true});

userSchema.static('matchPasswordAndGenerateToken',async function(email,password){
    const user = await this.findOne({email});

    if(!user) throw new Error ('User Not Found');
    
    const salt = user.salt;
    const hashedPassword = user.password;

    const userProvidedHash = createHmac('sha256',salt).update(password).digest('hex');

    if(hashedPassword !== userProvidedHash) throw new Error ('Incorrect Password');

    const token = genrateTokenForUser(user);

    return token;

})

userSchema.pre("save",function(next){
    const user = this;
    if(!user.isModified("password")) return;

    const salt = randomBytes(16).toString();
    const hashedPassword = createHmac('sha256', salt).update(user.password).digest('hex');

    user.salt = salt;
    user.password = hashedPassword;

    next();
})

const User = model('user',userSchema);

module.exports = User;