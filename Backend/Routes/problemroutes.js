import express from 'express';
const router = express.Router();
import { getProblems, createProblem, updateProblem, deleteProblem } from '../Controllers/problemControllers.js';

// GET all problems
router.get('/', getProblems);

// POST a new problem
router.post('/', createProblem);

// PUT update a problem
router.put('/:id', updateProblem);

// DELETE a problem
router.delete('/:id', deleteProblem);

export default router;
