const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const swaggerUi = require('swagger-ui-express');
const swaggerSpec = require('./swagger/swagger');
const connectToDatabase = require('./db/connect');
const authenticateToken = require('./middleware/authMiddleware');

// Routes
const profileRoutes = require('./routes/profile');
const appointmentRoutes = require('./routes/appointments');
const chatbotRoutes = require('./routes/chatbot');
const authRoutes = require('./routes/auth');

// Load environment variables
dotenv.config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Test DB connection
connectToDatabase().catch((err) => console.log('MongoDB connection error:', err));

// API Routes
app.use('/api/profile', authenticateToken, profileRoutes); // Protected
app.use('/api/appointments', appointmentRoutes); // Unprotected
app.use('/api/chatbot', chatbotRoutes); // Unprotected
app.use('/api/auth', authRoutes); // Unprotected
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// Root Route
app.get('/', (req, res) => {
  res.send('Backend is running! Visit /api-docs for API documentation.');
});

// Function to log API routes
const logApiRoutes = () => {
  console.log('\n=== Registered API Endpoints ===');
  const routes = [
    { path: 'GET /', description: 'Root route - Server status' },
    { path: 'GET /api/profile', description: 'Get user profile (Protected)' },
    { path: 'POST /api/profile', description: 'Create/Update user profile (Protected)' },
    { path: 'GET /api/appointments', description: 'Get all appointments' },
    { path: 'POST /api/appointments', description: 'Create a new appointment' },
    { path: 'POST /api/chatbot', description: 'Send message to chatbot' },
    { path: 'POST /api/auth/register', description: 'Register a new user' },
    { path: 'POST /api/auth/login', description: 'Login a user' },
    { path: 'GET /api-docs', description: 'Swagger UI documentation' },
  ];

  routes.forEach((route) => {
    console.log(`${route.path}: ${route.description}`);
  });
  console.log('================================\n');
};

// Start Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Swagger UI available at http://localhost:${PORT}/api-docs`);
  logApiRoutes(); // Call the function to print routes
});