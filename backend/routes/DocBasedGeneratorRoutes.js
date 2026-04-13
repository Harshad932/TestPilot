import express from 'express';

import { generateDocBasedTest } from '../controllers/DocBasedGenerator.js';

const router=express.Router();

router.post('/generate', generateDocBasedTest);

export default router;