import express from 'express';
import { loginUser, createUser, getUser, deleteUser, updateUser, getUsers, updateUserRole } from '../Controllers/authControllers.mjs';


const router = express.Router();

router.post('/register', createUser);

router.put('/:id', updateUser);

router.post('/login', loginUser);

router.get('/users', getUsers);
router.get('/users/:id', getUser);
router.delete('/users/:id', deleteUser);
router.put('/users/:id', updateUserRole);

export default router;

