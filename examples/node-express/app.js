const express = require('express');
const app = express();

// Application config
const PORT = process.env.PORT || 3000;
const NODE_ENV = process.env.NODE_ENV || 'development';

// Database
const DATABASE_URL = process.env.DATABASE_URL;
const REDIS_HOST = process.env.REDIS_HOST;
const REDIS_PORT = process.env.REDIS_PORT;

// Authentication
const JWT_SECRET = process.env['JWT_SECRET'];
const SESSION_SECRET = process.env['SESSION_SECRET'];

// External APIs
const STRIPE_API_KEY = process.env.STRIPE_API_KEY;
const SENDGRID_API_KEY = process.env.SENDGRID_API_KEY;

// AWS
const AWS_REGION = process.env.AWS_REGION;
const S3_BUCKET = process.env.S3_BUCKET;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT} in ${NODE_ENV} mode`);
});
