import express from 'express';
const router = express.Router();
import { getContests, createContest, updateContest, deleteContest, getContestById, registerUserToContest, removeUserFromContest } from '../Controllers/contestControllers.js';

// GET all problems
router.get('/', getContests);

// POST a new problem
router.post('/', createContest);

router.get('/:id', getContestById);
// PUT update a problem
router.put('/:id', updateContest);

// DELETE a problem
router.delete('/:id', deleteContest);

router.post('/:id/register',registerUserToContest);

router.post('/:id/removeUser', removeUserFromContest);

export default router;
