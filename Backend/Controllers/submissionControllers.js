import Submission from "../Models/Submission.js";
import Problem from "../Models/Problem.js";
import axios from "axios";
import dotenv from 'dotenv';
dotenv.config();
const COMPILER_API_URL = process.env.COMPILER_API_URL

export const createSubmission = async (req, res) => {
  const {
    problemId,
    contestId,
    language,
    code,
    userId,
    userName,
    problemName,
    uuid,
  } = req.body;

  if (!problemId || !language || !code) {
    return res.status(400).json({ message: "Missing required fields" });
  }

  try {
    // Fetch problem and testcases
    const problem = await Problem.findById(problemId);
    if (!problem) {
      return res.status(404).json({ message: "Problem not found" });
    }

    const testcases = problem.testcases || [];
    if (testcases.length === 0) {
      return res.status(400).json({ message: "No testcases found for this problem" });
    }

    let status = "Accepted";
    let passedCount = 0;
    const points = problem.points || 0;

    const startTime = Date.now();

    for (const tc of testcases) {
      const payload = { language, code, input: tc.input };
      const response = await axios.post(`${COMPILER_API_URL}run`, payload);
      const result = response.data;

      if (result.status === "TLE") {
        status = "TLE";
        break;
      }

      let yourOutput = "";
      if (typeof result.output === "string") {
        yourOutput = result.output;
      } else if (result.stdout) {
        yourOutput = result.stdout;
      } else {
        yourOutput = JSON.stringify(result);
      }

      if (yourOutput.trim() === tc.output.trim()) {
        passedCount++;
      } else if (status !== "TLE") {
        status = "Wrong Answer";
      }
    }

    const runTimeMs = Date.now() - startTime;
    const achievedPoints = status === "TLE" ? 0 : Math.round((passedCount / testcases.length) * points);

    const newSubmit = new Submission({
      problemId,
      contestId,
      points: achievedPoints,
      status,
      submissionTime: new Date(),
      runTime: runTimeMs.toString(),
      userId,
      userName,
      problemName,
      uuid,
    });

    await newSubmit.save();

    return res.status(201).json({
      submission: newSubmit,
      verdict: status,
      passedCount,
      totalTests: testcases.length,
      achievedPoints,
    });
  } catch (err) {
    console.error("❌ Error while creating submission:", err);
    if (err.errors) {
      Object.keys(err.errors).forEach(field => {
        console.error(`Validation error on "${field}":`, err.errors[field].message);
      });
    }
    return res.status(400).json({ message: err.message, errors: err.errors || null });
  }
};



export const getSubmissions = async (req, res) => {
    try {
      const submissions = await Problem.find();
      res.json(submissions);
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  };
  
  export const getSubmissionById = async (req, res) => {
    try {
      const submission = await Submission.findById(req.params.id);
      if (!submission) {
        return res.status(404).json({ message: "submission not found" });
      }
      res.json(submission);
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  };

  export const getSubmissionsByContestId = async (req, res) => {
    try {
      const { contestId } = req.params;
      // Find all submissions with this contestId (as string)
      const submissions = await Submission.find({ contestId: contestId });
      res.status(200).json(submissions);
    } catch (err) {
      console.error("Error fetching submissions by contestId:", err);
      res.status(500).json({ error: err.message || "Internal server error" });
    }
  };

  export const getSubmissionsByUserID = async (req, res) => {
    try {  
      const { userId, problemId } = req.body;
  
      if (!userId || !problemId) {
        console.warn("Missing userId or problemId in request body.");
        return res.status(400).json({ error: "userId and problemId are required" });
      }
      const submissions = await Submission.find({ userId: userId, problemId: problemId });
  
      res.status(200).json(submissions);
    } catch (err) {
      console.error("Error fetching submissions by userId and problemId:", err);
      res.status(500).json({ error: err.message || "Internal server error" });
    }
  };
  
  

  export const deleteSubmission = async (req, res) => {
    try {
      await Submission.findByIdAndDelete(req.params.id);
      res.json({ message: 'Submission deleted' });
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  };

