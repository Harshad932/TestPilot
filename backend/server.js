import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import testCaseGeneratorRoutes from './routes/TestCaseGeneratorRoutes.js';

dotenv.config();
const app=express();

const PORT=process.env.PORT || 5000;

app.use(cors());

app.use(express.json());

app.use('/api/testcase', testCaseGeneratorRoutes);

app.get('/', (req, res) => {
    res.send('Welcome to TestPilot API! 🚀');
});

app.listen(PORT,()=>{
    console.log(`Server is running on port ${PORT}`);
    console.log(`🔍 Health check: http://localhost:${PORT}`);
})