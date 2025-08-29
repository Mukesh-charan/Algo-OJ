import User from '../Models/Users.js';

export const authenticateJWT = async (req, res, next) => {
    const token = req.body.token;
    const user_id = req.body.userId;
    console.log('Received token:', token,user_id);
  
    if (!token) {
      console.log('No token provided'); // Debugging: Log when no token is provided
      return res.status(401).json({ message: "Missing token" });
    }
  
    try {
      console.log('Verifying token...');
  
      const user = await User.findById(user_id);
      console.log('User found:', user); // Debugging: Log the user fetched from the database
  
      if (!user || user.currentSessionToken !== token) {
        console.log('Session expired or invalid.'); // Debugging: Log session error
        return res.status(401).json({ message: 'Session expired or invalid.' });
      }
  
      req.user = user;
      console.log('User authenticated successfully'); // Debugging: Log successful authentication
      next();
    } catch (err) {
      console.error('Token verification failed:', err); // Debugging: Log token verification errors
      res.status(401).json({ message: 'Token invalid or expired.', error: err.message });
    }
  };
  

