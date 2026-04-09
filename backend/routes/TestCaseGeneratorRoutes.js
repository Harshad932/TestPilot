import express from 'express';

import { generateTestCases } from '../controllers/TestCaseGenerator.js';

const router=express.Router();

router.post('/generate', generateTestCases);

export default router;