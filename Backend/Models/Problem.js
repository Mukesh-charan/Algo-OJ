import mongoose from 'mongoose';

const TestCaseSchema = new mongoose.Schema({
  input: { type: String, required: true },
  output: { type: String, required: true }
});

const ProblemSchema = new mongoose.Schema({
  name: { type: String, required: true },
  difficulty: { type: String, required: true },
  problemStatement: { type: String, required: true },
  sampleInput: [{ type: String, required: true }],  
  sampleOutput: [{ type: String, required: true }],  
  testcases: [TestCaseSchema]
});


const Problem = mongoose.model('Problem', ProblemSchema);

export default Problem;
