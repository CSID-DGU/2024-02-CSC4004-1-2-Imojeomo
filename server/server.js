const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bodyParser = require('body-parser');
require('dotenv').config();


const app = express();
const PORT = 5000;

app.use(cors());
app.use(express.json())

mongoose.connect('mongodb://localhost:27017/calendar', {
    useNewUrlParser: true,
    useUnifiedTopology: true,
}).then(() => console.log('MongoDB connected')).catch(err => console.error(err));

const eventSchema = new mongoose.Schema({
    title: String,
    start: Date,
    end: Date,
});

const Event = mongoose.model('Event', eventSchema);

app.get('/api/events', async (req, res) => {
    try {
        const events = await Event.find();
        res.json(events);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
})

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
})