import User from '../Models/Users.js';

export const authenticateJWT = async (req, res, next) => {
    const token = req.body.token;
    const user_id = req.body.userId;
    console.log('Received token:', token,user_id);
    if (!token) {
      console.log('No token provided');
      return res.status(401).json({ message: "Missing token" });
    }
    try {
      console.log('Verifying token...');
  
      const user = await User.findById(user_id);
      console.log('User found:', user);
  
      if (!user || user.currentSessionToken !== token) {
        console.log('Session expired or invalid.');
        return res.status(401).json({ message: 'Session expired or invalid.' });
      }
  
      req.user = user;
      console.log('User authenticated successfully');
      next();
    } catch (err) {
      console.error('Token verification failed:', err);
      res.status(401).json({ message: 'Token invalid or expired.', error: err.message });
    }
  };
  

