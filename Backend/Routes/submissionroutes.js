import express from 'express';
const router = express.Router();
import { createSubmission, getSubmissionById, getSubmissions, deleteSubmission, getSubmissionsByContestId, getSubmissionsByUserID } from "../Controllers/submissionControllers.js";

router.post('/', createSubmission);

router.get('/all',getSubmissions);

router.get('/:id',getSubmissionById);

router.get('/contest/:contestId/submissions',getSubmissionsByContestId);

router.post('/usersubmission',getSubmissionsByUserID);

router.delete('/delete/:id',deleteSubmission);

export default router;