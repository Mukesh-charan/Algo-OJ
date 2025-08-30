import Problem from '../Models/Problem.js';

export const getProblems = async (req, res) => {
  try {
    // Query all problems excluding 'testcases' field
    const problems = await Problem.find().select("-testcases");
    res.json(problems);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const getProblemById = async (req, res) => {
  try {
    const problem = await Problem.findById(req.params.id);
    if (!problem) {
      return res.status(404).json({ message: "Problem not found" });
    }
    res.json(problem);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const createProblem = async (req, res) => {
  const { name, difficulty, points, visibility, problemStatement,random, sampleInput, sampleOutput, testcases } = req.body;
  try {
    const newProblem = new Problem({ name, difficulty, points, visibility, problemStatement,random, sampleInput, sampleOutput, testcases });
    await newProblem.save();
    res.status(201).json(newProblem);
  } catch (err) {
    console.error("Validation Error:", err);
    res.status(400).json({ message: err.message, errors: err.errors });
  }
};


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

export const deleteProblem = async (req, res) => {
  try {
    await Problem.findByIdAndDelete(req.params.id);
    res.json({ message: 'Problem deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
