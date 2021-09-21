const upload= require('../helper/helperFunc');
const User= require('../model/user');
const security= require('../security/security');
const fs= require('fs');
const PasswordReset= require('../model/UserPasswordReset');
const jwt= require('jsonwebtoken');
const Joi= require('joi')
const sendEmail= require('../helper/emailSender'); 
const bcrypt= require('bcryptjs');
const ejs= require('ejs');
const path= require('path');
const Category = require('../model/category');
const dataExists= require('../helper/dataExistenceChk');
const helperfunc= require('../helper/dbUpdate');
const createOtp= require('../security/otp');
const config= require('config');

exports.noPagePath= (req,res,next) => {
    res.status(200).send("<h1>Node Server Running here</h1><img src='https://www.freeiconspng.com/uploads/virtual-server-icon-7.png' width='480' height='600'>");
}
///done with validation
exports.signUp =  async (req,res,next) => {
        await upload(req,res,config.get("App.imageSavingFolder"),async (data)=>{    
            try{
                const schema = Joi.object({
                    firstname: Joi.string()
                        .pattern(/^[a-z]+$/i)
                        .min(3)
                        .max(10)
                        .required()
                        .error(new Error('Firstname is required and Cannot have Non-Characters!')),
                    
                    lastname: Joi.string()
                        .pattern(/^[a-z]+$/i)
                        .min(3)
                        .max(10)
                        .required()
                        .error(new Error('Lastname is required and Cannot have Non-Characters!')),
                    
                    phone: Joi.number()
                        .integer()
                        .required()
                        .error(new Error('Valid number is required!')),
                        
                    gender:Joi.string()
                        .required()
                        .error(new Error('Valid Gender is required!')),
                
                    email: Joi.string()
                        .email({ minDomainSegments: 2, tlds: { allow: ['com', 'net',] } })
                        .required()
                        .error(new Error('Valid Email is required!')),
                
                    password: Joi.string()
                        .alphanum()
                        .min(8)
                        .max(10)
                        .required()
                        .error(new Error('Password must be 8 characters long and must be alphaNumeric!!!')),
                
                    categoryId: Joi.number()
                        .integer()
                        .min(1)
                        .max(7)
                        .required()
                        .error(new Error('Valid CategoryId is required!')),
                })
                userValidated= await schema.validateAsync(data.body)
                const userMailCheckout= await User.findOne({where:{email:data.body.email}})
                if(userMailCheckout){
                    fs.unlinkSync(data.files[0].path);
                }
                dataExists.checkExistence(!userMailCheckout,"Email Already Exists!!!!!");
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
                    sendEmail(result.email,'Successfully SignedUp!',data);                                
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

exports.emailVerify= (req,res,next)=>{
    User.findByPk(req.params.id)
    .then(async (user)=>{                                                                                     
        dataExists.checkAlreadyVerified(user,"link is invalid or user is already verified");
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
}

//validation done here
exports.postlogin=async (req,res,next) => {
    try{
        const schema = Joi.object({
            email: Joi.string()
                .email({ minDomainSegments: 2, tlds: { allow: ['com', 'net',] } })
                .required()
                .error(new Error('Valid Email is required!')),
        
            password: Joi.string()
                .alphanum()
                .min(8)
                .max(10)
                .required()
                .error(new Error('Password must be 8 characters long and must be alphaNumeric!!!')),
        })
        userValidated= await schema.validateAsync({email:req.body.email, password:req.body.password});
        let user=await User.findOne({where:{email:req.body.email},include:Category,attributes:{exclude:['createdAt','updatedAt']}})
        dataExists.checkExistence(user,'Mail not found!!!');
        // console.log('usersiisisiisisis',user,user[0].dataValues.category);
        dataExists.checkExistence(user.verified,"Mail not verified");
        const passwordCheck= bcrypt.compareSync(req.body.password, user.password);
        dataExists.checkExistence(passwordCheck,"Incorrect Password!!!");
        jwtToken= jwt.sign({
            id:user.id
        },config.get("App.jwtKey"));
        await helperfunc.update(user.id,jwtToken);
        // user= user.dataValues;
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

//validation done here
exports.forgotPassword= async(req,res,next)=>{
    try{
        const schema = Joi.object({
            email: Joi.string()
                .email({ minDomainSegments: 2, tlds: { allow: ['com', 'net',] } })
                .required()
                .error(new Error('Valid Email is required!'))
        })
        userValidated= await schema.validateAsync({email:req.body.email});
        let user=await User.findOne({where:{email:req.body.email}})
        dataExists.checkExistence(user,"Mail not Found!");
        const resetingPassword= await PasswordReset.create({
            otpValue:await createOtp(),
            expiresAt:Date.now()+config.get("App.otpTimer"),
            userId:user.id                    
        });
        const data= await ejs.renderFile(path.join(__dirname, '..','templates/','otpMail.ejs'),{
            firstname:user.firstname,
            lastname:user.lastname,
            otp:resetingPassword.otpValue
        })
        sendEmail(user.email,'Password Reset OTP!!!',data);                                         
        res.status(200).json({done:"Check your Email for Otp"});
    }
    catch(err){
        next(err);
    }
}

//validation done here
exports.checkOtp= async (req,res,next) => {
    try{
        const schema = Joi.object({
            otp:Joi.number()
                .integer()
                .min(1000)
                .max(9999)
                .required()
                .error(new Error('A 4 digit OTP is required!!!'))
        })
        userValidated= await schema.validateAsync(req.body);
        let user=await PasswordReset.findOne({where:{otpValue:req.body.otp}})
        dataExists.checkExistence(user,'Invalid OTP!!!');
        if(user.otpValue === req.body.otp){
            if(Date.now() < user.expiresAt ){
                return res.status(200).json({"done":"Successfully Verified OTP now Go to Update Password to Update it."});
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

//validation done here
exports.updatingPassword = async (req,res,next) => {
    try{
        const schema = Joi.object({
            otp:Joi.number()
                .integer()
                .min(1000)
                .max(9999)
                .required()
                .error(new Error('A 4 digit OTP is required!!!')),
            password: Joi.string()
                .alphanum()
                .min(8)
                .max(10)
                .required()
                .error(new Error('Password must be 8 characters long and must be alphaNumeric!!!')),
        })
        userValidated= await schema.validateAsync(req.body);
        let user=await PasswordReset.findOne({where:{otpValue:req.body.otp}})
        dataExists.checkExistence(user,'Invalid OTP!!!');
        if(user.otpValue === req.body.otp){
            await PasswordReset.destroy({where:{id:user.id}});
            const gettingUser= await User.findByPk(user.userId);
            gettingUser.password= req.body.password;
            await gettingUser.save();
            return res.status(200).json({"done":"Successfully updated password"});
        }
        const error= new Error('Incorrect Otp!!!');
        throw error;
    }
    catch(err){
        next(err);
    }
}