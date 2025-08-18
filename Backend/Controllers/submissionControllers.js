import Submission from "../Models/Submission.js";

export const createSubmission = async (req, res) => {
  const {
      problemId,
      contestId,
      points,
      status,
      submissionTime,
      runTime,
      userId,
      userName,
      problemName,
      uuid
  } = req.body;

  try {

      const newSubmit = new Submission({
          problemId,
          contestId,
          points,
          status,
          submissionTime,
          runTime,
          userId,
          userName,
          problemName
      });

      await newSubmit.save();
      res.status(201).json(newSubmit);
  } catch (err) {
      console.error("❌ Error while creating submission:");
      console.error("Message:", err.message);
      console.error("Full error object:", err);

      if (err.errors) {
          // Mongoose validation errors
          Object.keys(err.errors).forEach(field => {
              console.error(`Validation error on "${field}":`, err.errors[field].message);
          });
      }

      res.status(400).json({
          message: err.message,
          errors: err.errors || null
      });
  }
}



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

