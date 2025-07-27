import mongoose from 'mongoose';

const contestProblemsSchema = new mongoose.Schema({
  id: { type: String, required: true }
});


const ContestSchema = new mongoose.Schema({
  name: { type: String, required: true },
  problems: [contestProblemsSchema]
});


const Contest = mongoose.model('Contest', ContestSchema);

export default Contest;