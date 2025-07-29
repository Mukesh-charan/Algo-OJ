import Submission from "../Models/Submission.js";

export const createSubmission = async (req, res) => {
  console.log("Received Submission body:", req.body);
  
    const {problemId,contestId,points,status,submissionTime,runTime,userId,userName,problemName,uuid} = req.body;
    try{
        const newSubmit = new Submission({problemId,contestId,points,status,submissionTime,runTime,userId,userName,problemName,uuid});
        await newSubmit.save();
        res.status(201).json(newSubmit);
    }
    catch(err){
        console.error("Validation Error:", err);
        res.status(400).json({ message: err.message, errors: err.errors });
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

  export const deleteSubmission = async (req, res) => {
    try {
      await Submission.findByIdAndDelete(req.params.id);
      res.json({ message: 'Submission deleted' });
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  };