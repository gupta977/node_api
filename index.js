const express = require('express');
const app = express();

// Define routes
app.get('/', (req, res) => {
  const { parameter } = req.query;
  let output = 'Default output';
  
  // Check if parameter is passed and handle accordingly
  if (parameter === 'value1') {
    output = 'Output for value1';
  } else if (parameter === 'value2') {
    output = 'Output for value2';
  } // Add more conditions as needed
  
  res.send(output);
});

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
