require('dotenv').config(); 
const postmark = require("postmark");

const client = new postmark.ServerClient(process.env.POSTMARK_SERVER_TOKEN);

// Successful ballot result
const successfulTextBody = `
Dear [Student Name],

Congratulations! You have been successfully allocated a parking spot in the student parking area. Please show this to your HOSH who will then give you your permit.

Best regards,
Student Parking Management Team
`;

const successfulHtmlBody = `
<!DOCTYPE html>
<html>
<head>
  <title>Successful Ballot Result</title>
</head>
<body>
  <p>Dear <strong>[Student Name]</strong>,</p>
  <p>Congratulations! You have been successfully allocated a parking spot in the student parking area. Please show this to your HOSH who will then give you your permit.</p>
  <p>Best regards,</p>
  <p>Student Parking Management Team</p>
</body>
</html>
`;

// Unsuccessful ballot result
const unsuccessfulTextBody = `
Dear [Student Name],

We regret to inform you that you were not allocated a parking spot in this ballot. You can try again in the next round.

Best regards,
Student Parking Management Team
`;

const unsuccessfulHtmlBody = `
<!DOCTYPE html>
<html>
<head>
  <title>Unsuccessful Ballot Result</title>
</head>
<body>
  <p>Dear <strong>[Student Name]</strong>,</p>
  <p>We regret to inform you that you were not allocated a parking spot in this ballot. You can try again in the next round.</p>
  <p>Best regards,</p>
  <p>Student Parking Management Team</p>
</body>
</html>
`;

99
async function sendEmail(to, htmlBody, textBody) {
  try {
    const response = await client.sendEmail({
      "From": "parking@studentproj.cgscomputing.com",
      "To": to,
      "Subject": "Year 12 Carpark Balloting Results",
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
  successfulTextBody,
  successfulHtmlBody,
  unsuccessfulTextBody,
  unsuccessfulHtmlBody,
};
