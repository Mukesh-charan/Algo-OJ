import User from "../Models/Users.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import dotenv from 'dotenv';
dotenv.config();


// Register a new user
export const createUser = async (req, res) => {
  const { username, email, password } = req.body;

  try {
    if (!username || !email || !password) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const userExists = await User.findOne({ $or: [{ username }, { email }] });
    if (userExists) {
      return res.status(400).json({ message: "User already exists" });
    }

    const saltRounds = parseInt(process.env.BCRYPT_SALT_ROUNDS) || 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);
    const newUser = new User({ username, email, password: hashedPassword });
    await newUser.save();

    const token = jwt.sign({ id: newUser._id }, process.env.JWT_SECRET, { expiresIn: '1h' });

    res.status(201).json({
      message: "User registered successfully",
      token,
    });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};


// Login user (check credentials)
export const loginUser = async (req, res) => {
  const { username, email, password } = req.body;

  try {
    // Basic input validation
    if (!username && !email || !password) {
      return res.status(400).json({ message: "Username or Email and Password are required" });
    }

    // Find the user by username or email
    const user = await User.findOne({ $or: [{ username }, { email }] });

    if (!user) {
      return res.status(400).json({ message: 'User not found' });
    }

    // Compare the entered password with the hashed password in the database
    const hashedPassword = await bcrypt.hash(password, process.env.JWT_SECRET);

    if (hashedPassword == user.password) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    // Generate JWT token for the authenticated user
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '1h' });

    // Respond with success message and the token
    res.json({
      user: user,
      message: 'Login successful',
      token,
    });
  } catch (err) {
    console.error('Error during login:', err.message);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};
// Get all users
export const getUsers = async (req, res) => {
  try {
    const users = await User.find().select('-password');
    res.json(users);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};


// Update User Role
export const updateUserRole = async (req, res) => {
  const { id } = req.params;
  const { type } = req.body;

  try {
    const updatedUser = await User.findByIdAndUpdate(
      id,
      { type },
      { new: true }
    );

    if (!updatedUser) {
      return res.status(404).json({ message: "User not found" });
    }
    res.json(updatedUser);
  } catch (err) {
    console.error("Failed to update user role:", err);
    res.status(500).json({ message: "Failed to update user role" });
  }
};


export default { loginUser, createUser, getUser, deleteUser, updateUser, getUsers, updateUserRole };
