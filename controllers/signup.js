const upload= require('../helper/helperFunc');
const User= require('../model/user');
const security= require('../security/security');
const PasswordReset= require('../model/UserPasswordReset');
const jwt= require('jsonwebtoken');
const nodemailer= require('nodemailer');
const sendgridTransport= require('nodemailer-sendgrid-transport');
const bcrypt= require('bcryptjs');
const ejs= require('ejs');
const path= require('path');
const validation= require('../model/userValidator');
const Category = require('../model/category');
const dataExists= require('../helper/dataExistenceChk');
const helperfunc= require('../helper/dbUpdate');
const createOtp= require('../security/otp');



const transporter= nodemailer.createTransport(sendgridTransport({
    auth:{
      api_key: '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'
    }
  }))




exports.signUp =  async (req,res,next) => {
        await upload(req,res,'profile',async (data)=>{    
            try{
                const userMailCheckout= await User.findOne({where:{email:data.body.email}})
                // dataExists.checkExistence(userMailCheckout,"Email Already Exists!!!!!");
                userValidated= await validation.validateAsync(data.body)
                console.log(userValidated);
                if(userValidated.error){
                    let error= new Error(userValidated.error.details);
                    throw error;
                }
                if(userMailCheckout){
                    let error = new Error('Email Already Exists!!');
                    throw error;
                }
                await User.create({
                    firstname:data.body.firstname,
                    lastname:data.body.lastname,
                    phone:data.body.phone,
                    gender:data.body.gender,
                    email:data.body.email,
                    password:data.body.password,
                    profileUrl:data.files[0].path,
                    categoryId:data.body.categoryId
                })
                .then(async (result)=>{                
                    const data= await ejs.renderFile(path.join(__dirname, '..','templates/','email.ejs'),{
                        firstname:result.firstname,
                        lastname:result.lastname,
                        id:result.id
                    })                                         
                    transporter.sendMail({
                        to:result.email,
                        from:'2018cscloudmoksh6777@poornima.edu.in',
                        subject:'sucessfully signedUp!',
                        html:data
                    });
                    res.status(200).json({"done":"yes, Now check your mail for verification",status:true});
                })
                .catch((err)=>{
                    console.log(err);
                    throw err;
                }) 
            }
            catch (err){
                next (err);
            }     
        })
    }

exports.emailVerify= ((req,res,next)=>{
    User.findByPk(req.params.id)
    .then(async (user)=>{                                                                                     
        dataExists.alreadyVerified(user,"link is invalid or user is already verified");
        user.verified= "1";
        await user.save()
         .then(()=>{
            res.status(200).redirect('https://arabboard.org/arabboard/login#loginSection');
        })
        .catch((err)=>{
            res.status(200).redirect('https://arabboard.org/arabboard/signup');
        })
    })
    .catch((err)=>{
        console.log(err);
        next(err);
    })
})


exports.postlogin=async (req,res,next) => {
    try{
        let user=await User.findAll({where:{email:req.body.email},include:Category,attributes:{exclude:['createdAt','updatedAt']}})
        dataExists.dataFound(user);
        console.log('usersiisisiisisis',user,user[0].dataValues.category);
        dataExists.checkExistence(user[0].verified,"Mail not verified");
        const passwordCheck= bcrypt.compareSync(req.body.password, user[0].password);
        dataExists.checkExistence(passwordCheck,"Incorrect Password!!!");
        jwtToken= jwt.sign({
            id:user[0].id
        },'mysecretsupersecret');
        await helperfunc.update(user[0].id,jwtToken);
        user= user[0].dataValues;
        delete user.verified;
        delete user.password;
        delete user.category.dataValues.createdAt;
        delete user.category.dataValues.updatedAt;
        user.token= jwtToken;
        user.isLoggedIn=true;
        return res.status(200).json({user:user});       
    }
    catch(err){
        next(err);
    }
}

exports.Logout= async (req,res,next)=>{
    try{
        const user= await User.findByPk(req.userId)
        dataExists.checkExistence(user.token,"NO such user is logged in!");
        user.token= null;
        user.isLoggedIn= false;
        await user.save()
        res.status(200).json({done:"Successfully logged out"});
    }
    catch(error){
        next(error);
    }
}


exports.forgotPassword= async(req,res,next)=>{
    try{
        let user=await User.findAll({where:{email:req.body.email}})
        dataExists.dataFound(user,"Mail not Found!");
        const resetingPassword= await PasswordReset.create({
            otpValue:await createOtp(),
            expiresAt:Date.now()+300000,
            userId:user[0].id                    
        });
        console.log('resettttifdfksdlpass',resetingPassword);
        const data= await ejs.renderFile(path.join(__dirname, '..','templates/','otpMail.ejs'),{
            firstname:user[0].firstname,
            lastname:user[0].lastname,
            otp:resetingPassword.otpValue
        })                                         
        transporter.sendMail({
            to:user[0].email,
            from:'2018cscloudmoksh6777@poornima.edu.in',
            subject:'Password Reset OTP!',
            html:data
        });
        res.status(200).json({done:"Check your Email for Otp"});
    }
    catch(err){
        next(err);
    }
}


exports.checkOtp= async (req,res,next) => {
    try{
        dataExists.checkExistence(req.body.otp,'please enter OTP');
        let user=await PasswordReset.findAll({where:{otpValue:req.body.otp}})
        dataExists.dataFound(user,'Invalid OTP!!!');
        console.log(user[0].otpValue);
        if(user[0].otpValue === req.body.otp){
            if(Date.now() < user[0].expiresAt ){
                res.status(200).json({"done":"Successfully Verified OTP now Go to Update Password to Update it."});
            }
            const error = new Error('OTP has been Expired!!!');
            throw error;
        }
        const error= new Error('Incorrect Otp!!!');
        throw error;

    }
    catch(err){
        next(err);
    }
}

exports.updatingPassword = async (req,res,next) => {
    try{
        dataExists.checkExistence(req.body.otp,'please enter OTP');
        dataExists.checkExistence(req.body.password,'enter a password please');
        let user=await PasswordReset.findAll({where:{otpValue:req.body.otp}})
        dataExists.dataFound(user,'Invalid OTP!!!');
        if(user[0].otpValue === req.body.otp){
            await PasswordReset.destroy({where:{id:user[0].id}});
            const gettingUser= await User.findByPk(user[0].userId);
            gettingUser.password= req.body.password;
            gettingUser.save();
            res.status(200).json({"done":"Successfully updated password"});
        }
        const error= new Error('Incorrect Otp!!!');
        throw error;
    }
    catch(err){
        next(err);
    }
}