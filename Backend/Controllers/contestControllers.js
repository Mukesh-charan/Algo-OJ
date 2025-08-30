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
  try {
    const {
      name,
      startDate,
      startTime,
      endDate,
      endTime,
      problems,
      type,
      isPasswordProtected,
      password,
    } = req.body;

    if (isPasswordProtected && (!password || password.length < 6)) {
      return res.status(400).json({ message: 'Password must be at least 6 characters' });
    }

    const contest = new Contest({
      name,
      startDate,
      startTime,
      endDate,
      endTime,
      problems,
      type,
      isPasswordProtected,
      password,
    });

    await contest.save();

    res.status(201).json({ message: 'Contest created successfully', contest });
  } catch (error) {
    console.error('Error creating contest:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

export const registerUserToContest = async (req, res) => {
  try {
    const contestId = req.params.id;
    const { userId, username } = req.body;

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
    const { id } = req.params;
    const {
      name,
      startDate,
      startTime,
      endDate,
      endTime,
      problems,
      type,
      isPasswordProtected,
      password,
    } = req.body;

    // Find the contest by ID
    const contest = await Contest.findById(id);
    if (!contest) {
      return res.status(404).json({ message: 'Contest not found' });
    }

    // Update fields
    contest.name = name;
    contest.startDate = startDate;
    contest.startTime = startTime;
    contest.endDate = endDate;
    contest.endTime = endTime;
    contest.problems = problems;
    contest.type = type;
    contest.isPasswordProtected = !!isPasswordProtected;

    // Handle password changes
    if (contest.isPasswordProtected) {
      if (!password || password.length < 6) {
        return res.status(400).json({ message: 'Password must be at least 6 characters' });
      }

      // Only update password if it changed
      if (password !== contest.password) {
        contest.password = password; // plaintext for now, will be hashed in pre-save
      }
    } else {
      // Remove password if protection disabled
      contest.password = undefined;
    }

    await contest.save(); // hash password in pre-save hook if modified

    res.json({ message: 'Contest updated successfully', contest });
  } catch (error) {
    console.error('Error updating contest:', error);
    res.status(500).json({ message: 'Server error' });
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