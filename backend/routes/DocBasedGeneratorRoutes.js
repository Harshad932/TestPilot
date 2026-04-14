import express from 'express';

import {upload, generateDocBasedTest } from '../controllers/DocBasedGenerator.js';

const router=express.Router();

router.post('/generate',upload.single("file"), generateDocBasedTest);

export default router;