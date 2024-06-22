const axios = require('axios');

// Define Zammad API base URL and token
const zammadBaseUrl = 'http://localhost:8080/api/v1';
const zammadApiToken = 'wpMYX0h3mcZRVu58n1OK5Z9BtCDurHLJw5N6pQYLwkV5L_K7u_700O7mx-Z8G_IL'; // Replace with your actual Zammad API token

// Function to create a ticket in Zammad
async function createTicket(title, email, message) {
  const ticketData = {
    title: title,
    group: "Users", // Adjust group as necessary
    article: {
      subject: title,
      body: message,
      type: "note"
    },
    customer: {
      email: email
    },
    priority_id: 2 // Adjust priority as necessary
  };

  try {
    const response = await axios.post(`${zammadBaseUrl}/tickets`, ticketData, {
      headers: {
        'Authorization': `Token token=${zammadApiToken}`,
        'Content-Type': 'application/json'
      }
    });

    console.log('Ticket created successfully:', response.data);
    return response.data;
  } catch (error) {
    console.error('Error creating ticket:', error.response.data);
    throw error;
  }
}

// Example usage:
const title = 'Support Request';
const email = 'example@example.com';
const message = 'This is a test message for ticket creation.';

createTicket(title, email, message)
  .then(() => {
    console.log('Ticket creation request sent successfully.');
  })
  .catch((error) => {
    console.error('Failed to create ticket:', error);
  });
