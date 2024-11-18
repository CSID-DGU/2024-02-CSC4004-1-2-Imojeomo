import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

function Signup() {
    const [formData, setFormData] = useState({
        name: '',
        username: '',
        password: '',
        email: '',
        residence: '',
    });

    const navigate = useNavigate();

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const response = await axios.post('http://localhost:5000/api/register', formData);
            console.log(response.data); // 회원가입 성공 메시지 처리
            navigate('/login');
        } catch (error) {
            console.error('회원가입 실패:', error.response?.data.message || error.message);
        }
    };

    const handleLoginRedirect = () => {
        navigate('/login');
    };

    return (
        <div>
            <h2>회원가입</h2>
            <form onSubmit={handleSubmit}>
                <div>
                    <label>이름:</label>
                    <input
                        type="text"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        required
                    />
                </div>
                <div>
                    <label>아이디:</label>
                    <input
                        type="text"
                        name="username"
                        value={formData.username}
                        onChange={handleChange}
                        required
                    />
                </div>
                <div>
                    <label>비밀번호:</label>
                    <input
                        type="password"
                        name="password"
                        value={formData.password}
                        onChange={handleChange}
                        required
                    />
                </div>
                <div>
                    <label>이메일:</label>
                    <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        required
                    />
                </div>
                <div>
                    <label>거주지:</label>
                    <input
                        type="text"
                        name="residence"
                        value={formData.residence}
                        onChange={handleChange}
                        required
                    />
                </div>
                <button type="submit">회원가입</button>
                <button type="button" onClick={handleLoginRedirect}>로그인 페이지로</button>
            </form>
        </div>
    );
};

export default Signup;
