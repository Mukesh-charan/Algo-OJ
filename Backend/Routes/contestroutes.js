import express from 'express';
const router = express.Router();
import { getContests, getContests_user, createContest, updateContest, deleteContest, getContestById, registerUserToContest,verifyContestPassword, removeUserFromContest } from '../Controllers/contestControllers.js';

router.get('/', getContests);

router.get('/user', getContests_user);

router.post('/', createContest);

router.get('/:id', getContestById);

router.put('/:id', updateContest);

router.delete('/:id', deleteContest);

router.post('/:id/register',registerUserToContest);

router.post('/:id/removeUser', removeUserFromContest);

router.post('/:id/verify-password', verifyContestPassword);

export default router;
