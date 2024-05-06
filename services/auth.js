const jwtToken = require('jsonwebtoken');
const secret = "$upertoken$uper$ecurity"
function genrateTokenForUser(user){
   const payload = {
    fullName : user.fullName,
    _id : user._id,
    email : user.email,
    profileImageURL : user.profileImageURL,
    role:user.role,
   }
   return jwtToken.sign(payload,secret);
}

function validateUserToken(token){
    const payload = jwtToken.verify(token,secret);
    return payload;
}

module.exports = {
    genrateTokenForUser,
    validateUserToken,
}