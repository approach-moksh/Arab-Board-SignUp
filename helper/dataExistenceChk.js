exports.dataFound= (data,errormessage) => {                          // FOR ARRAY TYPE OF DATA AS PARAMETERS
    data= data.join('');
    if(data===""){
        console.log('inExistence');
        const error= new Error(errormessage);
        throw error;
    }
    return
}

exports.checkExistence= (data,errormessage) => {                                         // FOR NORMAL TYPE OF DATA AS PARAMETERS
    if(!data || data==="0"){
        const error= new Error(errormessage);
        throw error;
    }
    return
}                  

exports.checkAlreadyVerified= (data,errormessage) => {                       //FOR VERIFICATION 
    if(!data){
        const error= new Error(errormessage);
        console.log('infirst');
        throw error;
    }
    if(data.verified!="0"  ){
        const error= new Error(errormessage);
        console.log('inSecond');
        throw error;
    }
    return 
}