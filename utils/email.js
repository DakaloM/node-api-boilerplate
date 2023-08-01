const nodemailer = require('nodemailer');
const Mail = require('nodemailer/lib/mailer');
const mailHtml = require('./emailTemplate');


const sendEmail = async (option) => {
    // create a transporter
    const transporter = nodemailer.createTransport({
        host: process.env.EMAIL_HOST, 
        port: process.env.EMAIL_PORT,
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASSWORD
        }
    })

    

    // Define email options
    const emailOptions = {
        from: 'DakaloTech support<dakalo997@gmail.com>',
        to: option.email,
        subject: option.subject,
        html: mailHtml(option.message)
    }

  

    // send email
    try {
        await transporter.sendMail(emailOptions)
        console.log("works")
        
    } catch (error) {
        console.log(error)
    }
    
}



// const sendEmail = async (option) => {
//     // create a transporter
    
    
// }

module.exports = sendEmail;