const express = require('express');
const app = express();
const path = require('path');
const axios = require('axios');
const nodemailer = require('nodemailer');
const bodyParser = require('body-parser');
const fs = require('fs');

// Define the path to clicks.json file
const clicksFilePath = path.join(__dirname, 'clicks.json');

// Middleware to parse JSON request bodies
app.use(express.json());

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

// Serve submitticket.html
app.get('/', (req, res) => {
  res.sendFile(__dirname + '/Tawkto-submitticket.html');
});



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


///////////////////////// Node mailer ////////////////////////////////////////////
// Middleware setup
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// POST endpoint for sending tickets
app.post('/send-ticket', (req, res) => {
    const { title, name, email, details } = req.body;

    // Create a Nodemailer transporter using SMTP
    let transporter = nodemailer.createTransport({
        host: 'mail.elabram.com',       // Your cPanel mail server hostname
        port: 465,                      // Typically, use port 465 for SMTP over SSL
        secure: true,                   // true for 465, false for other ports
        auth: {
            user: 'Ask.IT@elabram.com',  // Your cPanel email account
            pass: 'KQwSs^Esvak_'          // Password for the cPanel email account
        }
    });

    // Email options
    let mailOptions = {
        from: 'Ask.IT@elabram.com',  // Sender email address
        to: 'support@elabram.com', // Receiver email address (Tawk.to)
        subject: title,
        text: `Name: ${name}\nEmail: ${email}\n\nDetails:\n${details}`
    };

    // Send email
    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
          console.error('Error sending email:', error);
          return res.status(500).json({ success: false, message: 'Failed to create ticket. Please try again later.' });
      }
      console.log('Email sent:', info.response);
      res.json({ success: true, message: 'Ticket created successfully' });
  });
});




// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
