const express= require("express");
const signupController = require('../controllers/signup');
const auth= require("../middleware/is-TokenAuth");

const router= express.Router();


router.get('/logout',auth,signupController.Logout);

module.exports= router;