import jwt from 'jsonwebtoken';
import User from '../Models/Users.js';

export const authenticateJWT = async (req, res, next) => {
  const token = req.headers.authorization && req.headers.authorization.split(" ")[1];
  if (!token) return res.status(401).json({ message: "Missing token" });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    // Retrieve user and session token from DB
    const user = await User.findById(decoded.id);
    if (!user || user.currentSessionToken !== decoded.sessionToken) {
      return res.status(401).json({ message: 'Session expired or invalid.' });
    }
    req.user = user;
    next();
  } catch (err) {
    res.status(401).json({ message: 'Token invalid or expired.', error: err.message });
  }
};
