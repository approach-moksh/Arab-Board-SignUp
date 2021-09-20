const express= require("express");
const signupController = require('../controllers/signup');

const router= express.Router();

router.post('/signUp',signupController.signUp);

router.get('/emailVerifyreq/:id',signupController.emailVerify);

router.post('/login',signupController.postlogin);

router.post('/forgotPassword',signupController.forgotPassword);

router.post('/checkOtp',signupController.checkOtp);

router.post('/updatingPassword',signupController.updatingPassword);
// router.get('/404',signupController.get404);

module.exports = router;