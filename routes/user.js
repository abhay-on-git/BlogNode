const { Router } = require("express");
const User = require("../models/user");
const { genrateTokenForUser } = require("../services/auth");

const router = Router();

router.get("/signin", (req, res) => {
  res.render("signin");
});
router.get("/signup", (req, res) => {
  res.render("signup");
});

router.post("/signin", async (req, res) => {
  const { email, password } = req.body;
  try {
    const token = await User.matchPasswordAndGenerateToken(email, password);
    if (!token) return res.redirect("/signin");
    return res.cookie("token", token).redirect("/");
  } catch (error) {
    return res.render("signin", {
      error: "Incorrect email or Password",
    });
  }
});
router.post("/signup", async (req, res) => {
  // console.log(req.body)
  try {
    const { fullName, email, password } = req.body;
    const user = await User.create({
      fullName,
      email,
      password,
    });
    const token = genrateTokenForUser(user);
    if (!token) res.redirect("/signup");
    return res.cookie("token", token).redirect("/");
  } catch (error) {
    console.log(error.message);
    return redirect("/signup");
  }
});

router.get("/logout", (req, res) => {
  res.clearCookie("token").redirect("/");
});

module.exports = router;
