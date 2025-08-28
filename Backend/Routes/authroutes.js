import express from 'express';
import { loginUser, createUser, getUser, deleteUser, updateUser, getUsers, updateUserRole } from '../Controllers/authControllers.mjs';
import { authenticateJWT } from '../Middleware/authMiddleware.js';

const router = express.Router();

router.post('/register', createUser);
router.post('/login', loginUser);

router.get('/users', authenticateJWT, getUsers);
router.get('/users/:id', authenticateJWT, getUser);
router.delete('/users/:id', authenticateJWT, deleteUser);
router.put('/:id', authenticateJWT, updateUser);
router.put('/users/:id', authenticateJWT, updateUserRole);

export default router;

