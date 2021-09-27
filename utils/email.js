const nodemailer = require('nodemailer');

const accout = nodemailer.createTransport({
	service: 'gmail',
	host: 'smtp.gmail.com',
	auth: {
		user: process.env.EMAIL,
		pass: process.env.SENDEMAIL_PASS,
	},
});

const sendEmail =async (to, subject, text) => {
	let mailOptions = {
		from: process.env.EMAIL,
		to,
		subject,
		text,
	};

	await accout.sendMail(mailOptions);
};
module.exports= sendEmail