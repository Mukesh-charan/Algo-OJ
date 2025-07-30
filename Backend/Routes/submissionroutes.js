import express from 'express';
const router = express.Router();
import { createSubmission, getSubmissionById, getSubmissions, deleteSubmission, getSubmissionsByContestId } from "../Controllers/submissionControllers.js";

router.post('/', createSubmission);

router.get('/all',getSubmissions);

router.get('/:id',getSubmissionById);

router.get('/contest/:contestId/submissions',getSubmissionsByContestId);

router.delete('/delete/:id',deleteSubmission);

export default router;