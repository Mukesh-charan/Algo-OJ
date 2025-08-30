import User from '../Models/Users.js';

export const authenticateJWT = async (req, res, next) => {
    const token = req.body.token;
    const user_id = req.body.userId;
    if (!token) {
      return res.status(401).json({ message: "Missing token" });
    }
    try {
  
      const user = await User.findById(user_id);
  
      if (!user || user.currentSessionToken !== token) {
        return res.status(401).json({ message: 'Session expired or invalid.' });
      }
  
      req.user = user;
      next();
    } catch (err) {
      console.error('Token verification failed:', err);
      res.status(401).json({ message: 'Token invalid or expired.', error: err.message });
    }
  };
  

