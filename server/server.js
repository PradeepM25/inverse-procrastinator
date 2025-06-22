import express from 'express';
import cors from 'cors';
import 'dotenv/config'; 
import { connectDB } from './config/db.js';

const app = express();
const PORT = process.env.PORT || 4000;

// Middleware to enable CORS
app.use(cors());

// Middleware to parse JSON bodies
app.use(express.json());

// Middleware to parse form data (application/x-www-form-urlencoded)
// extended: true	Allows nested objects using the qs library
app.use(express.urlencoded({ extended: true }));

connectDB();

// Routes
app.get('/', (req, res) => {
    res.send("Welcome to the API");
})

// app.get('/api/user', userRoures)

app.listen(PORT, () => console.log(`Server is running on port ${PORT}`));