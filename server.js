require('dotenv').config();
require('express-async-errors');
const express = require('express');
const path = require('path');
const passport = require('passport');
const prismaErrorHandler = require('./errors/prismaErrorHandler');

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

app.use((err, req, res, next) => {
  err = prismaErrorHandler(err);

  if (!err.statusCode || err.statusCode >= 500) {
    console.log("Status 500 Error")
    return res.status(500).json({
      error: 'InternalServerError',
      message: err.message                          // FOR DEVELOPMENT
      // message: 'An unexpected error occurred'    // FOR DEPLOYMENT
    });
  }

  console.error(err.name, err.statusCode, err.message);
  res.status(err.statusCode).json({
    error: err.name,
    message: err.message
  });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  // console.log(`Frontend URL: ${process.env.FRONTEND_URL}`);
});