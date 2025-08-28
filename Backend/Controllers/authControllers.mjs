import User from "../Models/Users.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import dotenv from 'dotenv';
dotenv.config();
import crypto from "crypto";

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



export const loginUser = async (req, res) => {
  const { username, email, password } = req.body;

  try {
    if ((!username && !email) || !password) {
      return res.status(400).json({ message: "Username or Email and Password are required" });
    }

    const user = await User.findOne({ $or: [{ username }, { email }] });
    if (!user) {
      return res.status(400).json({ message: 'User not found' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    // Generate new session token & save
    const sessionToken = crypto.randomBytes(32).toString("hex");
    user.currentSessionToken = sessionToken;
    await user.save();

    // Create JWT with sessionToken
    const token = jwt.sign({
      id: user._id,
      sessionToken,
    }, process.env.JWT_SECRET, { expiresIn: '1h' });

    res.json({
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        type: user.type,
      },
      message: 'Login successful',
      token,
    });

  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};


export const getUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-password');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

export const deleteUser = async (req, res) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json({ message: 'User deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

export const updateUser = async (req, res) => {
  const { username, email, password } = req.body;

  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    user.username = username || user.username;
    user.email = email || user.email;
    user.password = password ? await bcrypt.hash(password, parseInt(process.env.BCRYPT_SALT_ROUNDS) || 10) : user.password;

    await user.save();

    res.json({ message: 'User updated successfully', user });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

export const getUsers = async (req, res) => {
  try {
    const users = await User.find().select('-password');
    res.json(users);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

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
    res.status(500).json({ message: "Failed to update user role" });
  }
};

export default { loginUser, createUser, getUser, deleteUser, updateUser, getUsers, updateUserRole };
