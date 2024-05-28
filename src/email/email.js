require('dotenv').config(); //

const postmark = require("postmark");

const client = new postmark.ServerClient(process.env.POSTMARK_API_TOKEN);


//success messages 
const successEmailHtml = " ";
const htmlBody = `<p>Hello ${studentName},</p><p>Your ballot status is: <strong>${ballotStatus}</strong></p>`;
const successEmailText =" "; 

//fail messages 
const failEmailHtml ="";
const failEmailText ="";


async function sendEmail(to, htmlBody, textBody = '') {
    try {
        const response = await client.sendEmail({
            "From": "parking@studentproj.cgscomputing.com",
            "To": to,
            "Subject": "Student Parking Space Balloting Results",
            "HtmlBody": htmlBody,
            "TextBody": textBody,
            "MessageStream": "outbound"
        });
        console.log('Email sent successfully:', response);
    } catch (error) {
        console.error('Error sending email:', error);
    }
}

module.exports = { 
    sendEmail,
    successEmailHtml,
    successEmailText,
    failEmailHtml,
    failEmailText,
};