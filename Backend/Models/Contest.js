import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const contestProblemsSchema = new mongoose.Schema({
  id: { type: String, required: true }
});

const contestUsersSchema = new mongoose.Schema({
  id: { type: String },
  username: { type: String }
});

const ContestSchema = new mongoose.Schema({
  name: { type: String, required: true },
  startDate: { type: String, required: true },
  startTime: { type: String, required: true },
  endDate: { type: String, required: true },
  endTime: { type: String, required: true },
  problems: [contestProblemsSchema],
  users: [contestUsersSchema],
  type: { type: String },
  isPasswordProtected: { type: Boolean, default: false },
  password: {
    type: String,
    required: function() { return this.isPasswordProtected; },
  },
});

ContestSchema.pre('save', async function (next) {
  if (!this.isModified('password') || !this.password) return next();

  if (this.password.startsWith('$2b$')) return next();

  const saltRounds = parseInt(process.env.BCRYPT_SALT_ROUNDS, 10) || 10;
  const salt = await bcrypt.genSalt(saltRounds);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

ContestSchema.methods.comparePassword = async function (enteredPassword) {
  if (!this.password) return false;
  return await bcrypt.compare(enteredPassword, this.password);
};

const Contest = mongoose.model('Contest', ContestSchema);

export default Contest;