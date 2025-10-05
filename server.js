require('dotenv').config();
const express = require('express');
const path = require('path');
const passport = require('passport');

const app = express();

// Passport
app.use(passport.initialize());

// Body parsing middleware
app.use(express.urlencoded({ extended: false }));
app.use(express.json());


// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ 
    status: 'healthy', 
    timestamp: new Date().toISOString(),
    env: process.env.NODE_ENV 
  });
});


// Routes
app.use('/', require('./routes/users'));
// app.use('/files', require('./routes/files'));
// app.use('/folders', require('./routes/folders'));

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));


// Every thrown error in the application or the previous middleware 
// function calling `next` with an error as an argument will 
// eventually go to this middleware function
app.use((err, req, res, next) => {
  console.error(err);
  // We can now specify the `err.statusCode` that exists in our 
  // custom error class and if it does not exist it's probably 
  // an internal server error
  res.status(err.statusCode || 500).send(err.message);
});



const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  // console.log(`Frontend URL: ${process.env.FRONTEND_URL}`);
});