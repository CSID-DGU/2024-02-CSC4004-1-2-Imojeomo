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
    teamId: { type: mongoose.Schema.Types.ObjectId, ref: 'Team', default: null },
    backgroundColor: { type: String, default: '#ababab' },
});
const Event = mongoose.model('Event', eventSchema);

/* 스케줄 가져오기 */
app.get('/api/events', async (req, res) => {
    const { teamId, userId } = req.query;

    try {
        let events;





        if (teamId) {
            const team = await Team.findById(teamId).populate('members');
            if (!team) {
                return res.status(404).json({ message: '팀을 찾을 수 없습니다.' });
            }
            events = await Event.find({ userId: { $in: team.members.map(member => member._id) } });
            return res.json(events);
        } else if (userId) {
            events = await Event.find({ userId });
        } else {
            return res.status(400).json({ message: '팀 Id나 사용자 Id가 필요합니다.' });
        }

        res.json(events);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: '일정 가져오기 실패' });
    }
});

/* 스케줄 입력하기 */
app.post('/api/events', async (req, res) => {
    const { title, start, end, isRecurring, userId, teamId, backgroundColor } = req.body;

    if (!title || !start || !end || !userId) {
        return res.status(400).json({ message: '필수 필드가 누락되었습니다.' });
    }

    try {
        if (teamId) {
            const team = await Team.findById(teamId).populate('members');
            if (!team) {
                return res.status(404).json({ message: '팀을 찾을 수 없습니다.' });
            }

            const events = await Promise.all(
                team.members.map(async (member) => {
                    const newEvent = new Event({
                        title,
                        start,
                        end,
                        isRecurring,
                        userId: member._id,
                        teamId,
                        backgroundColor,
                    });
                    return newEvent.save();
                })
            );

            return res.status(201).json({
                message: '팀 일정이 저장되었습니다.',
                events,
            });
        } else {
            const newEvent = new Event({
                title,
                start,
                end,
                isRecurring,
                userId,
                teamId: null,
                backgroundColor,
            });

            await newEvent.save();
            return res.status(201).json(newEvent);
        }

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


/* 팀 스케마 */
const teamSchema = new mongoose.Schema({
    name: { type: String, required: true, unique: true },
    creatorId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    members: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    inviteCode: { type: String },
    createdAt: { type: Date, default: Date.now },
});
const Team = mongoose.model('Team', teamSchema);

/* 팀 생성하기 */
app.post('/api/teams', async (req, res) => {
    const { name, creatorId } = req.body;

    if (!name || !creatorId) {
        return res.status(400).json({ message: '팀 이름과 생성자가 필요합니다.' });
    }

    try {
        const newTeam = new Team({ name, creatorId, members: [creatorId] });
        await newTeam.save();
        res.status(201).json(newTeam);
    } catch (error) {
        console.error('팀 생성 오류:', error);
        res.status(500).json({ message: '팀 생성에 실패했습니다.' });
    }
});

/* 팀 가져오기 */
app.get('/api/teams', async (req, res) => {
    const { userId } = req.query;

    if (!userId) {
        return res.status(400).json({ message: 'userId가 필요합니다.' });
    }

    try {
        const teams = await Team.find({ members: userId });
        res.json(teams);
    } catch (err) {
        console.error('팀 목록 가져오기 오류:', err);
        res.status(500).json({ message: '팀 목록 가져오기 실패' });
    }
});

/* 참여자 목록 가져오기 */
app.get('/api/teams/:teamId/members', async (req, res) => {
    const { teamId } = req.params;

    try {
        const team = await Team.findById(teamId).populate('members', 'name _id'); // 필드명 수정
        if (!team) {
            return res.status(404).json({ message: '팀을 찾을 수 없습니다.' });
        }
        res.json(team.members); // 참여자 목록 반환
    } catch (err) {
        console.error('멤버 목록 가져오기 오류:', err);
        res.status(500).json({ message: '멤버 목록 가져오기 실패' });
    }
});

/* 초대 */
const crypto = require('crypto');

/* 초대 코드 생성 */
app.post('/api/teams/:teamId/invite-code', async (req, res) => {
    const { teamId } = req.params;

    try {
        const team = await Team.findById(teamId);
        if (!team) {
            return res.status(404).json({ message: '팀을 찾을 수 없습니다.' });
        }

        const inviteCode = crypto.randomBytes(3).toString('hex').toUpperCase();

        team.inviteCode = inviteCode;
        await team.save();

        res.json({ inviteCode });
    } catch (err) {
        console.error('초대 코드 생성 오류:', err);
        res.status(500).json({ message: '초대 코드 생성 실패' });
    }
});

/* 참가 */
app.post('/api/teams/join', async (req, res) => {
    const { inviteCode, userId } = req.body;

    try {
        const team = await Team.findOne({ inviteCode });
        if (!team) {
            return res.status(404).json({ message: '유효하지 않은 초대 코드입니다' });
        }

        if (!team.members.includes(userId)) {
            team.members.push(userId);
            await team.save();
        }

        res.status(200).json({ message: '팀 참가 성공', teamId: team._id });
    } catch (err) {
        console.error('팀 참가 오류:', err);
        res.status(500).json({ message: '팀 참가 실패' });
    }
});



/* 서버 시작 */
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
})