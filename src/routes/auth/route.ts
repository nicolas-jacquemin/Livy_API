import express from 'express'
import rateLimit from 'express-rate-limit'
import login from '../../controllers/auth/login.js'
import register from '../../controllers/auth/register.js'
import renewToken from '../../controllers/auth/renewToken.js'
import logout from '../../controllers/auth/logout.js'
const router = express.Router();

const loginLimiter = rateLimit({
    windowMs: 5 * 60 * 1000,
    max: 20,
    standardHeaders: true,
	legacyHeaders: false,
});

const registerLimiter = rateLimit({
    windowMs: 5 * 60 * 1000,
    max: 10,
    standardHeaders: true,
	legacyHeaders: false,
});

router.post('/login', loginLimiter, login);
router.post('/register', registerLimiter, register);
router.post('/renewToken', renewToken);
router.post('/logout', logout);

export default router;
