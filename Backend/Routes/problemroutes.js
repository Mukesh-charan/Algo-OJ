import express from 'express';
const router = express.Router();
import { getProblems, createProblem, updateProblem, deleteProblem, getProblemById, getProblems_user } from '../Controllers/problemControllers.js';

// GET all problems
router.get('/', getProblems);

// GET all problems with visibility true
router.get('/user', getProblems_user);

// POST a new problem
router.post('/', createProblem);

router.get('/:id', getProblemById);
// PUT update a problem
router.put('/:id', updateProblem);

// DELETE a problem
router.delete('/:id', deleteProblem);

export default router;
