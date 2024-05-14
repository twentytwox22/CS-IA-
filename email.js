const nodemailer = require('nodemailer');

// Create a transporter object using SMTP transport
const transporter = nodemailer.createTransport({
    service: 'outlook',
    auth: {
        user: 'junrui.lim@cgs.act.edu.au',
        pass: 'qwerty1234356'
    }
});

async function sendParkingSpaceNotification(emails) {
  let mailOptions = {
      from: 'junrui.lim@cgs.act.edu.au',
      to: emails.join(', '), // Sending email to multiple recipients
      subject: 'Parking Space Allocation',
      text: 'Congratulations! You have been allocated a parking space. Please check your dashboard for more details.'
  };

  try {
      let info = await transporter.sendMail(mailOptions);
      console.log('Email sent: ' + info.response);
  } catch (error) {
      console.error('Failed to send email:', error);
  }
}

// Assume winners is an array of user objects with email addresses
const winnersEmails = winners.map(winner => winner.email);
sendParkingSpaceNotification(winnersEmails);