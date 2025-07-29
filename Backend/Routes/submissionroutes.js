import express from 'express';
const router = express.Router();
import { createSubmission, getSubmissionById, getSubmissions, deleteSubmission } from "../Controllers/submissionControllers.js";

router.post('/', createSubmission);

router.get('/all',getSubmissions);

router.get('/:id',getSubmissionById);

router.delete('/delete:id',deleteSubmission);

export default router;