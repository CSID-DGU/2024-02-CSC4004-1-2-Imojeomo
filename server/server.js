const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bodyParser = require('body-parser');
const bcrypt = require('bcrypt');
require('dotenv').config();


const app = express();
const PORT = 5000;

app.use(cors());
app.use(express.json())
app.use(bodyParser.json());

mongoose.connect('mongodb://localhost:27017/calendar', {
    useNewUrlParser: true,
    useUnifiedTopology: true,
}).then(() => console.log('MongoDB connected')).catch(err => console.error(err));

/* 유저 스키마 */
const userSchema = new mongoose.Schema({
    name: { type: String, required: true },
    username: { type: String, required: true, unique: true },
    passwordHash: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    residence: { type: String, required: true },
    createdAt: { type: Date, default: Date.now },
});
const User = mongoose.model('User', userSchema);

/* 회원가입 */
app.post('/api/register', async (req, res) => {
    const { name, username, password, email, residence } = req.body;
    try {
        const passwordHash = await bcrypt.hash(password, 10);
        const newUser = new User({ name, username, passwordHash, email, residence });
        await newUser.save();
        res.status(201).json({ message: '사용자 등록 성공' });
    } catch (error) {
        res.status(500).json({ message: '서버 오류' });
    }
})

/* 로그인 */
app.post('/api/login', async (req, res) => {
    const { username, password } = req.body;
    try {
        const user = await User.findOne({ username });
        if (!user) {
            return res.status(400).json({ message: '사용자를 찾을 수 없습니다.' });
        }
        const isMatch = await bcrypt.compare(password, user.passwordHash);
        if (!isMatch) {
            return res.status(400).json({ message: '비밀번호가 틀렸습니다.' });
        }
        res.json({
            message: '로그인 성공',
            user: { _id: user._id, name: user.name, username: user.username }
        });
    } catch (error) {
        res.status(500).json({ message: '서버 오류' });
    }
})

/* 스케줄 스키마 */
const eventSchema = new mongoose.Schema({
    title: String,
    start: Date,
    end: Date,
    isRecurring: { type: Boolean, default: false },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
});
const Event = mongoose.model('Event', eventSchema);

/* 스케줄 가져오기 */
app.get('/api/events', async (req, res) => {
    const { userId } = req.query;
    try {
        if (!userId) {
            return res.status(400).json({ message: '사용자 Id가 필요합니다.' });
        }
        const events = await Event.find({ userId });
        res.json(events);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

/* 스케줄 입력하기 */
app.post('/api/events', async (req, res) => {
    const { title, start, end, isRecurring, userId } = req.body;

    if (!title || !start || !end || !userId) {
        return res.status(400).json({ message: '필수 필드가 누락되었습니다.' });
    }

    try {
        const newEvent = new Event({ title, start, end, isRecurring, userId });
        await newEvent.save();
        res.status(201).json(newEvent);
    } catch (error) {
        res.status(500).json({ message: '일정 추가 오류' });
    }
});

/* 스케줄 삭제하기 */
app.delete('/api/events/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const result = await Event.findByIdAndDelete(id);
        if (result) {
            res.status(200).json({ message: 'Event deleted successfully' });
        } else {
            res.status(400).json({ message: 'Event not found' });
        }

    } catch (error) {
        console.error('Errir deleting event:', error);
        res.status(500).json({ message: 'Error deleting event' });
    }
});



/* 서버 시작 */
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
})