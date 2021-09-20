const User= require('../model/UserPasswordReset');


async function getOtp(){
    let x= Math.random().toString();
    let y= x.split('.')[1]%10000;
    return User.findAll({where:{otpvalue:y}})
    .then((userdata)=>{
        userdata= userdata.join('');
        if(!userdata &&  y.toString().length > 3 || userdata===[] &&  y.toString().length > 3){
            return y;
        }
        else{
            return getOtp();
        }
    }) 
}

module.exports = getOtp;