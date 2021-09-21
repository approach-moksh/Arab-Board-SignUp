const multer= require('multer');
const path= require('path');

async function upload(req,res,patharea,calback){
    const fileStorageEngine = multer.diskStorage({
        destination:(req,file,cb) => {
            cb(null,path.join(__dirname,'../assets/',patharea));
        },
        filename: (req,file,cb) => {
            cb(null,new Date().toISOString().replace(/:/g,'-')+'--'+file.originalname);
        }
    });

    save= multer({ storage: fileStorageEngine }).any();
    save(req,res, function(err){
        if(err) {
            console.error('roror');
        }
        else{
            console.log('uploaded');
            calback(req)
            
        }
    })
}
module.exports =upload;