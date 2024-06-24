const express = require('express');
const app = express();
const path = require('path');
const nodemailer = require('nodemailer');
const bodyParser = require('body-parser');
const fs = require('fs');
const hCaptcha = require('express-hcaptcha');

// Define the path to clicks.json file
const clicksFilePath = path.join(__dirname, 'clicks.json');

// Serve static files from the current directory
app.use(express.static(__dirname));

// Serve index.html file for the root URL
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

// Serve ticketcreatetozammad.html
app.get('/ticketcreatetozammad.html', (req, res) => {
  res.sendFile(path.join(__dirname, 'ticketcreatetozammad.html'));
});

// Serve Tawkto-submitticket.html file
app.get('/Tawkto-submitticket.html', (req, res) => {
  res.sendFile(path.join(__dirname, 'Tawkto-submitticket.html'));
});

// Middleware to parse JSON request bodies
app.use(express.json());

// Route for updating the click count
app.post('/update-click-count', (req, res) => {
  const { articleName, clickCount } = req.body;
  const articleClicks = JSON.parse(fs.readFileSync(clicksFilePath));
  articleClicks[articleName] = clickCount;
  fs.writeFileSync(clicksFilePath, JSON.stringify(articleClicks, null, 2));
  res.send('Click count updated successfully');
});

// Route for retrieving click count data
app.get('/click-count-data', (req, res) => {
  const articleClicks = JSON.parse(fs.readFileSync(clicksFilePath));
  res.json(articleClicks);
});
// Your hCaptcha secret key
const hcaptchaSecret = 'ES_610e8d934a2f46fab5bc1bc78484b806';

// Create a Nodemailer transporter using SMTP
let transporter = nodemailer.createTransport({
    host: 'mail.elabram.com', // Your cPanel mail server hostname
    port: 465, // Typically, use port 465 for SMTP over SSL
    secure: true, // true for 465, false for other ports
    auth: {
        user: 'ask.it@elabram.com', // Your cPanel email account
        pass: 'KQwSs^Esvak_' // Password for the cPanel email account
    }
});

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// POST endpoint for sending tickets without hCaptcha
app.post('/send-ticket', (req, res) => {
    const { title, name, email, details } = req.body;

    // Email options for Tawk.to
    let mailOptions = {
        from: email, // Sender email address (User's entered email)
        to: '___ice___@hotmail.co.th', // Receiver email address (Tawk.to)
        replyTo: email, // Set replyTo to the user's email
        subject: title,
        text: `Name: ${name}\nEmail: ${email}\n\nDetails:\n${details}`
    };

    // Email options for sending confirmation to user
    let userMailOptions = {
        from: 'Ask.IT@elabram.com', // Sender email address
        to: email, // Receiver email address (User's email)
        subject: 'Ask IT Elabram: Ticket Submission Confirmation',
        text: `Dear ${name},\n\nThank you for submitting your ticket to Ask IT. We have received your request and will review it shortly.\n\nTitle: ${title}\nDetails: ${details}\n\nPlease note, this email is for confirmation purposes only. Do not reply to this email.\n\nBest regards,\nElabram IT Infrastructure Team`
    };

    // Send email to Tawk.to
    transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
            console.error('Error sending email to Tawk.to:', error);
            return res.status(500).json({ success: false, message: 'Failed to create ticket. Please try again later.' });
        }
        console.log('Email sent to Tawk.to:', info.response);

        // Send confirmation email to the user
        transporter.sendMail(userMailOptions, (userMailError, userMailInfo) => {
            if (userMailError) {
                console.error('Error sending confirmation email to user:', userMailError);
                // Don't halt the process if confirmation email fails
            } else {
                console.log('Confirmation email sent to user:', userMailInfo.response);
            }

            // Respond to the client
            res.json({ success: true, message: 'Ticket created successfully' });
        });
    });
});

// POST endpoint for sending tickets with hCaptcha verification
app.post('/send-ticket-hcaptcha', async (req, res) => {
    const { title, name, email, details, captchaResponse } = req.body;

    // Verify hCaptcha response
    const verifyUrl = `https://hcaptcha.com/siteverify`;
    const response = await fetch(verifyUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: `response=${captchaResponse}&secret=${hcaptchaSecret}`
    });
    const hcaptchaValidation = await response.json();

    if (!hcaptchaValidation.success) {
        console.error('hCaptcha verification failed:', hcaptchaValidation);
        return res.status(403).json({ success: false, message: 'hCaptcha verification failed. Please try again.' });
    }

    // Email options for Tawk.to
    let mailOptions = {
        from: email, // Sender email address (User's entered email)
        to: '___ice___@hotmail.co.th', // Receiver email address (Tawk.to)
        replyTo: email, // Set replyTo to the user's email
        subject: title,
        text: `Name: ${name}\nEmail: ${email}\n\nDetails:\n${details}`
    };

    // Email options for sending confirmation to user
    let userMailOptions = {
        from: 'Ask.IT@elabram.com', // Sender email address
        to: email, // Receiver email address (User's email)
        subject: 'Ask IT Elabram: Ticket Submission Confirmation',
        text: `Dear ${name},\n\nThank you for submitting your ticket to Ask IT. We have received your request and will review it shortly.\n\nTitle: ${title}\nDetails: ${details}\n\nPlease note, this email is for confirmation purposes only. Do not reply to this email.\n\nBest regards,\nElabram IT Infrastructure Team`
    };

    // Send email to Tawk.to
    transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
            console.error('Error sending email to Tawk.to:', error);
            return res.status(500).json({ success: false, message: 'Failed to create ticket. Please try again later.' });
        }
        console.log('Email sent to Tawk.to:', info.response);

        // Send confirmation email to the user
        transporter.sendMail(userMailOptions, (userMailError, userMailInfo) => {
            if (userMailError) {
                console.error('Error sending confirmation email to user:', userMailError);
                // Don't halt the process if confirmation email fails
            } else {
                console.log('Confirmation email sent to user:', userMailInfo.response);
            }

            // Respond to the client
            res.json({ success: true, message: 'Ticket created successfully' });
        });
    });
});

// Start the server
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
