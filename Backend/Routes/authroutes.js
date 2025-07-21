import express from 'express';
import{ loginUser, createUser, getUser, deleteUser, updateUser } from '../Controllers/authControllers.mjs';


const router = express.Router();

// Register Route
router.post('/register', createUser);

// Get User by ID
router.get('/:id', getUser);

// Delete User by ID
router.delete('/:id', deleteUser);

// Update User by ID
router.put('/:id', updateUser);

router.post('/login', loginUser);

export default router;

