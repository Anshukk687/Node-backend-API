const Contact = require('../models/contact');
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');
const transporter = require('../config/mailer');

// exports.addContact = async (req, res) => {
//     try {
//         const { name, email, phoneNumber, description } = req.body;

//         const token = jwt.sign(
//             { email: email },
//             process.env.JWT_SECRET,
//             { expiresIn: '5m' }
//         );

//         const expire_token = new Date(Date.now() + 5 * 60 * 1000);

//         const contact = new Contact({
//             name,
//             email,
//             phoneNumber,
//             description,
//             token,
//             expire_token
//         });

//         await contact.save();

//         await transporter.sendMail({
//             from: process.env.EMAIL_USER,
//             to: email,
//             subject: 'Verify your email',
//             html: `
//                     <h2>Hello ${name},</h2>
//                     <p>You can verify your email using one of the following methods:</p>
//                     <p>
//                         <strong>1. Verify using app:</strong><br/>
//                         <a href="my-daisyui-project://verified?token=${token}"
//                             style="display:inline-block;padding:10px 20px;background-color:#28a745;color:white;border-radius:5px;text-decoration:none;">
//                         Open in App
//                         </a>    
//                     </p>
//                     <p>If the button doesn’t work, open this link on your phone: <br />
//                         my-daisyui-project://verified?token=${token}
//                     </p>
//                     <p>This link will expire in 5 minutes.</p>
//                 `
//         });

//         res.status(201).json({ message: 'Contact form created successfully! Verification email sent.' });
//     } catch (error) {
//         console.error('Error saving contact:', error);
//         res.status(500).json({ message: 'Server error' });
//     }
// };

// exports.verified = async (req, res) => {
//   try {
//     const { token } = req.query;

//     if (!token) {
//       return res.status(400).json({ message: "Token is missing" });
//     }

//     const decoded = jwt.verify(token, process.env.JWT_SECRET);
//     const email = decoded.email;

//     const contact = await Contact.findOne({ email });

//     if (!contact) {
//       return res.status(404).json({ message: "Contact not found" });
//     }

//     contact.isVerified = true;
//     await contact.save();

//     res.status(200).json({ message: "Token is valid", email });
//   } catch (error) {
//     console.error("Token verification failed:", error);
//     res.status(400).json({ message: "Invalid or expired token" });
//   }
// };

// Working with MAIL trap
// exports.addContact = async (req, res) => {
//     try {
//         const { name, email, phoneNumber, description } = req.body;

//         const token = jwt.sign(
//             { email: email },
//             process.env.JWT_SECRET,
//             { expiresIn: '5m' }
//         );

//         const expire_token = new Date(Date.now() + 5 * 60 * 1000);

//         const contact = new Contact({
//             name,
//             email,
//             phoneNumber,
//             description,
//             token,
//             expire_token
//         });

//         await contact.save();

//         await transporter.sendMail({
//             from: process.env.EMAIL_USER,
//             to: email,
//             subject: 'Verify your email',
//             html: `
//                     <h2>Hello ${name},</h2>
//                     <p>You can verify your email using one of the following methods:</p>
//                     <p>
//                         <strong>1. Verify using app:</strong><br/>
//                         <a href="myapp://verified?token=${token}"
//                             style="display:inline-block;padding:10px 20px;background-color:#28a745;color:white;border-radius:5px;text-decoration:none;">
//                         Open in App
//                         </a>    
//                     </p>
//                     <p>If the button doesn’t work, open this link on your phone: <br />
//                         myapp://verified?token=${token}
//                     </p>
//                     <p>This link will expire in 5 minutes.</p>
//                 `
//         });

//         res.status(201).json({ message: 'Contact form created successfully! Verification email sent.' });
//     } catch (error) {
//         console.error('Error saving contact:', error);
//         res.status(500).json({ message: 'Server error' });
//     }
// };

exports.addContact = async (req, res) => {
  try {
    const { name, email, phoneNumber, description } = req.body;

    const token = jwt.sign(
      { email: email },
      process.env.JWT_SECRET,
      { expiresIn: '5m' }
    );

    const expire_token = new Date(Date.now() + 5 * 60 * 1000);

    const contact = new Contact({
      name,
      email,
      phoneNumber,
      description,
      token,
      expire_token
    });

    await contact.save();

    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });

    await transporter.sendMail({
      from: process.env.SMTP_USER,
      to: email,
      subject: 'Verify your email',
      html: `
        <h2>Hello ${name},</h2>
        <p>You can verify your email using one of the following methods:</p>
        <p>
            <strong>1. Verify using app:</strong><br/>
            <a href="myapp://verified?token=${token}"
                style="display:inline-block;padding:10px 20px;background-color:#28a745;color:white;border-radius:5px;text-decoration:none;">
            Open in App
            </a>    
        </p>
        <a href="myapp://verified?token=${token}"<p>If the button doesn’t work, open this link on your phone: <br />
            myapp://verified?token=${token}
        </p></a>
        <p>This link will expire in 5 minutes.</p>
      `
    });

    res.status(201).json({ message: 'Contact form created successfully! Verification email sent.' });
  } catch (error) {
    console.error('Error saving contact:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.verified = async (req, res) => {
  try {
    const { token } = req.query;

    if (!token) {
      return res.status(400).json({ message: "Token is missing" });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const email = decoded.email;

    const contact = await Contact.findOne({ email });

    if (!contact) {
      return res.status(404).json({ message: "Contact not found" });
    }

    contact.isVerified = true;
    await contact.save();

    res.status(200).json({ message: "Token is valid", email });
  } catch (error) {
    console.error("Token verification failed:", error);
    res.status(400).json({ message: "Invalid or expired token" });
  }
};

exports.dummy = async (req, res) => {
  try {
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });

    const mailOptions = {
      from: process.env.SMTP_USER,
      to: 'anshu.grootsoftwares@gmail.com',
      subject: 'Hello from Node.js',
      text: 'This is a test email sent from dummy API!',
    };

    await transporter.sendMail(mailOptions);

    res.status(200).json({ success: true, message: 'Email sent successfully' });
  } catch (error) {
    console.error('❌ Email error:', error);
    res.status(500).json({ success: false, message: 'Email failed to send' });
  }
};