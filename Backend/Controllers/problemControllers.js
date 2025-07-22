import Problem from '../Models/Problem.js';
import dotenv from 'dotenv';
dotenv.config();
// Get all problems
export const getProblems = async (req, res) => {
  try {
    const problems = await Problem.find();
    res.json(problems);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Create a new problem
export const createProblem = async (req, res) => {
  const { name, difficulty, problemStatement, sampleInput, sampleOutput, testcases } = req.body;
  try {
    const newProblem = new Problem({ name, difficulty, problemStatement, sampleInput, sampleOutput, testcases });
    await newProblem.save();
    res.status(201).json(newProblem);
  } catch (err) {
    console.error("Validation Error:", err);
    res.status(400).json({ message: err.message, errors: err.errors });
  }
};


// Update an existing problem
export const updateProblem = async (req, res) => {
  try {
    const updatedProblem = await Problem.findByIdAndUpdate(
      req.params.id,
      { $set: req.body },
      { new: true }
    );
    res.json(updatedProblem);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

// Delete a problem
export const deleteProblem = async (req, res) => {
  try {
    await Problem.findByIdAndDelete(req.params.id);
    res.json({ message: 'Problem deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
