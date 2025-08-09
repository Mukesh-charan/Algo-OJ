import User from "../Models/Users.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import dotenv from 'dotenv';
dotenv.config();

// Register a new user
export const createUser = async (req, res) => {
  const { username, email, password } = req.body;

  try {
    // Basic input validation (optional, but recommended)
    if (!username || !email || !password) {
      return res.status(400).json({ message: "All fields are required" });
    }

    // Check if the user already exists (by username or email)
    const userExists = await User.findOne({ $or: [{ username }, { email }] });

    if (userExists) {
      return res.status(400).json({ message: "User already exists" });
    }


    const hashedPassword = await bcrypt.hash(password, process.env.JWT_SECRET);

    // Create a new user object
    const newUser = new User({ username, email, password: hashedPassword });

    // Save the new user to the database
    await newUser.save();

    // Generate JWT token for authentication
    const token = jwt.sign({ id: newUser._id }, process.env.JWT_SECRET, { expiresIn: '1h' });

    // Respond with success message and the token
    res.status(201).json({
      message: "User registered successfully",
      token, // Send the JWT token to the client
    });
  } catch (err) {
    console.error('Error during registration:', err.message);
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




// Get User by ID
export const getUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-password');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json(user);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

// Delete User
export const deleteUser = async (req, res) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json({ message: 'User deleted successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

// Update User
export const updateUser = async (req, res) => {
  const { username, email, password } = req.body;

  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Update user fields
    user.username = username || user.username;
    user.email = email || user.email;
    user.password = password ? await bcrypt.hash(password, 10) : user.password;

    await user.save();

    res.json({ message: 'User updated successfully', user });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};
export const getUsers = async (req, res) => {
  try {
    const users = await User.find();
    res.json(users);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const updateUserRole = async (req, res) => {
  const { id } = req.params;               // user ID from the route
  const { type } = req.body;               // 'type' is the new role sent from client

  try {
    const updatedUser = await User.findByIdAndUpdate(
      id,
      { type },                            // update 'type' field (role)
      { new: true }                        // return the updated user
    );
    if (!updatedUser) {
      return res.status(404).json({ message: "User not found" });
    }
    res.json(updatedUser);                 // send updated user to frontend
  } catch (err) {
    console.error("Failed to update user role:", err);
    res.status(500).json({ message: "Failed to update user role" });
  }
};




export default { loginUser, createUser, getUser, deleteUser, updateUser, getUsers, updateUserRole };