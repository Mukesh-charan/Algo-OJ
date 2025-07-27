import Contest from "../Models/Contest.js";

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
    const { name, problems } = req.body;  // <-- get problems array here

    try {
        const newContest = new Contest({ name, problems });  // save problems properly
        await newContest.save();
        res.status(201).json(newContest);
    } catch (err) {
        console.error("Validation Error:", err);
        res.status(400).json({ message: err.message, errors: err.errors });
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