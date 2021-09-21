const nodemailer= require('nodemailer');
const sendgridTransport= require('nodemailer-sendgrid-transport');
const config= require('config');

const transporter= nodemailer.createTransport(sendgridTransport({
    auth:{
      api_key: config.get("App.nodemailerApiKey")
    }
  }))

module.exports= (reciever,subject,data) => {
    transporter.sendMail({
        to:reciever,
        from:config.get("App.email"),
        subject:subject,
        html:data
    });
}

