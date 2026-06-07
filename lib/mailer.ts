import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL,
    pass: process.env.EMAIL_PASSWORD,
  },
});

export async function sendEmail(
  to: string,
  subject: string,
  text: string
) {
 try{
  await transporter.sendMail({
    from: process.env.EMAIL,
    to,
    subject,
    text,
  });
 }
 catch(error){
  console.error('Error sending email:', error);
 }
}