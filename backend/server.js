const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const swaggerUi = require('swagger-ui-express');
const swaggerSpec = require('./swagger/swagger');
const connectToDatabase = require('./db/connect');
const authenticateToken = require('./middleware/authMiddleware');

const profileRoutes = require('./routes/profile');
const appointmentRoutes = require('./routes/appointments');
const chatbotRoutes = require('./routes/chatbot');
const authRoutes = require('./routes/auth');
const hospitalRoutes = require('./routes/hospitals');
const doctorRoutes = require('./routes/doctors');
const medicalReportRoutes = require('./routes/medical-reports');
const medicalConditionsRoutes = require('./routes/medical-conditions'); // Added

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

connectToDatabase().catch((err) => console.log('MongoDB connection error:', err));

app.use('/api/profile', authenticateToken, profileRoutes);
app.use('/api/appointments', authenticateToken, appointmentRoutes);
app.use('/api/chatbot', authenticateToken, chatbotRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/hospitals', authenticateToken, hospitalRoutes);
app.use('/api/doctors', authenticateToken, doctorRoutes);
app.use('/api/medical-reports', authenticateToken, medicalReportRoutes);
app.use('/api/medical-conditions', authenticateToken, medicalConditionsRoutes); // Added
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

app.get('/', (req, res) => {
  res.send('Backend is running! Visit /api-docs for API documentation.');
});

const PORT = process.env.PORT || 5002;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Swagger UI available at http://localhost:${PORT}/api-docs`);
});