import  express from 'express';
import { register, verifyEmail, completeRegistration } from '../controller/user/register';
import { login } from '../controller/user/login';
import { fetchUser } from '../controller/user/fetchUser';
import { Update } from '../controller/user/UpadateInfo';
import { changePassword } from '../controller/user/Change';
import { verifyOtp } from '../controller/user/verifyOtp';

const router = express.Router();
router.post('/register', register);
// Backwards-compatible alias: register email links use `/verify`
router.get('/verify', verifyEmail);
router.get('/verify-email', verifyEmail);
router.post('/complete-registration', completeRegistration);
router.post('/login', login);
router.get('/fetchUser/:id', fetchUser);
router.put('/update/:id', Update);
router.put('/change-password/:id', changePassword);
router.post('/verify-otp', verifyOtp);

export default router;