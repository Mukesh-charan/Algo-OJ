import express from 'express';
const router = express.Router();
import { getContests, createContest, updateContest, deleteContest, getContestById } from '../Controllers/contestControllers.js';

// GET all problems
router.get('/', getContests);

// POST a new problem
router.post('/', createContest);

router.get('/:id', getContestById);
// PUT update a problem
router.put('/:id', updateContest);

// DELETE a problem
router.delete('/:id', deleteContest);

export default router;
