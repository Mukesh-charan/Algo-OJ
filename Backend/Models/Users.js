import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

// User Schema
const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    match: [/\S+@\S+\.\S+/, 'Please enter a valid email'],
  },
  password: {
    type: String,
    required: true,
    minlength: 6,
  },
  type: {
    type: String,
    enum: ['admin', 'user'],
    default: 'user',
  },
  currentSessionToken: { type: String }

});

userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) {
    return next();
  }

  if (this.password.startsWith('$2b$')) {
    return next();
  }

  const saltRounds = parseInt(process.env.BCRYPT_SALT_ROUNDS, 10) || 10;
  const salt = await bcrypt.genSalt(saltRounds);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

userSchema.methods.comparePassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

const User = mongoose.model('User', userSchema);
export default User;
