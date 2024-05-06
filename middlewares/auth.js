const { validateUserToken } = require("../services/auth");

function checkForAuthenticationByCookie(cookieName){
   return (req,res,next)=>{
     const cookieValue = req.cookies[cookieName];
     if(!cookieValue) return next()
     try {
        const userPayload = validateUserToken(cookieValue);
        req.user = userPayload;
        // console.log(req.user)
     } catch (error) {}
     return next(); 
   }

}

module.exports = {
    checkForAuthenticationByCookie,
}