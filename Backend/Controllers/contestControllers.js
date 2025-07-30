import Contest from "../Models/Contest.js";
import mongoose from "mongoose";

export const getContests = async (req, res) => {
    try {
        const contests = await Contest.find();
        res.json(contests);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};
export const getContestById = async (req, res) => {
    try {
        const contest = await Contest.findById(req.params.id);
        if (!contest) {
            return res.status(404).json({ message: "Contest not found" });
        }
        res.json(contest);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};
export const createContest = async (req, res) => {
    const { name, startDate, startTime, endDate, endTime, problems,type} = req.body;  // <-- get problems array here

    try {
        const newContest = new Contest({ name, startDate, startTime, endDate, endTime, problems,type });  // save problems properly
        await newContest.save();
        res.status(201).json(newContest);
    } catch (err) {
        console.error("Validation Error:", err);
        res.status(400).json({ message: err.message, errors: err.errors });
    }
};
export const registerUserToContest = async (req, res) => {
    try {
        const contestId = req.params.id;
      const { userId, username } = req.body;
  
      // Validate ids
      if (!mongoose.Types.ObjectId.isValid(contestId)) {
        return res.status(400).json({ message: "Invalid contest ID" });
      }
      if (!mongoose.Types.ObjectId.isValid(userId)) {
        return res.status(400).json({ message: "Invalid user ID" });
      }
      if (!username) {
        return res.status(400).json({ message: "Username is required" });
      }
  
      const contest = await Contest.findById(contestId);
      if (!contest) {
        return res.status(404).json({ message: "Contest not found" });
      }
      contest.users.push({ id: userId, username });
      await contest.save();
  
      res.status(200).json({ message: "User registered successfully", contest });
    } catch (error) {
      console.error("Error registering user to contest:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  };
  export const removeUserFromContest = async (req, res) => {
    try {
      const contestId = req.params.id;
      const { userId } = req.body;
  
      // Validate MongoDB ObjectId formats
      if (!mongoose.Types.ObjectId.isValid(contestId)) {
        return res.status(400).json({ message: "Invalid contest ID" });
      }
      if (!mongoose.Types.ObjectId.isValid(userId)) {
        return res.status(400).json({ message: "Invalid user ID" });
      }
  
      // Find contest
      const contest = await Contest.findById(contestId);
      if (!contest) {
        return res.status(404).json({ message: "Contest not found" });
      }
  
      // Filter out the user from the users array
      const usersBefore = contest.users.length;
  
      contest.users = contest.users.filter(
        (user) => !(user && user.id === userId)
      );
  
      const usersAfter = contest.users.length;
  
      if (usersBefore === usersAfter) {
        return res.status(404).json({ message: "User not found in contest" });
      }
  
      // Save the updated contest
      await contest.save();
  
      res.status(200).json({ message: "User removed from contest successfully", contest });
    } catch (error) {
      console.error("Error removing user from contest:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  };
export const updateContest = async (req, res) => {
    try {
        const updatedContest = await Contest.findByIdAndUpdate(
            req.params.id,
            { $set: req.body },
            { new: true }
        );
        res.json(updatedContest);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
};

export const deleteContest = async (req, res) => {
    try {
        await Contest.findByIdAndDelete(req.params.id);
        res.json({ message: 'Contest deleted' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};