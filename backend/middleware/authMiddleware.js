const jwt = require('jsonwebtoken');

const authenticateToken = (req, res, next) => {
  // Get token from the Authorization header (format: "Bearer <token>")
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Extract token after "Bearer"

  if (!token) {
    return res.status(401).json({ message: 'No token provided' });
  }

  // Verify the token
  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ message: 'Invalid or expired token' });
    }

    // Attach user info to the request object
    req.user = user; // This contains { email: "user@example.com" }
    next(); // Proceed to the route handler
  });
};

module.exports = authenticateToken;