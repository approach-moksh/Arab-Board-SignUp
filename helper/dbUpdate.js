const User= require('../model/user');

exports.update= async (id,token)=>{
    const user= await User.findByPk(id)
    if(user.isLoggedIn==false){
        user.token= token;
        user.isLoggedIn= true;
        const chk= await user.save();
        return 
    }
    const error= new Error('User is Already Logged In');
    throw error;
}