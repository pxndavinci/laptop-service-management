import express, { Router } from 'express';
import UserController from '../controllers/user.controller';

const router: Router = express.Router();

router.get('/', UserController.getUsers);
router.post('/', UserController.createUser);
router.get('/:userId', UserController.getUserById);
router.patch('/:userId', UserController.updateUser);
router.delete('/:userId', UserController.deleteUser);

export default router;
