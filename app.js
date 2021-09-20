const express= require('express');
const bodyParser= require('body-parser');
const sequelize= require('./database/db');
const Users= require('./model/user');
const signupLoginRoute= require('./routes/signupLoginRoute');
const logintoDashboardRoute= require('./routes/afterLoginRoute');


const app= express();
app.use(bodyParser.urlencoded({extended: false}));
app.use(express.urlencoded({extended: false}));
app.use(express.json()); 
app.set('view engine','ejs');

app.use((req, res,next) => {
    res.setHeader('Access-Control-Allow-Origin','*');
    res.setHeader('Access-Control-Allow-Methods','POST,GET,PUT,PATCH,DELETE');
    res.setHeader('Access-Control-Allow-Headers','Content-Type','Authorization');
    next();
})

app.use(signupLoginRoute);
app.use(logintoDashboardRoute);

app.use((error, req, res, next) => {
    console.log(error);
    const status = error.statusCode || 500;
    const message = error.message;
    res.status(status).json({ message: message });
  });

sequelize
    .sync()
    .then(() => {
        app.listen(8080,(err)=>{
            if(!err){
                console.log('server started on port 8080');
            }
        });
    })
    .catch((err)=>{
        console.log('Some DB Error\n ',err);
    })

