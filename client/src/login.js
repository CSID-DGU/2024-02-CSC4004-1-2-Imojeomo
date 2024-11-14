import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import './login.css';

function Login() {
    const [isSignUpMode, setIsSignUpMode] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        username: '',
        password: '',
        email: '',
        residence: '',
    });

    const navigate = useNavigate();

    const handleSignUpClick = () => {
        setIsSignUpMode(true);
    };

    const handleSignInClick = () => {
        setIsSignUpMode(false);
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!isSignUpMode) {
            // 로그인 처리
            try {
                const response = await axios.post('http://localhost:5000/api/login', {
                    username: formData.username,
                    password: formData.password,
                });
                console.log(response.data);
                navigate('/');
            } catch (error) {
                console.error('로그인 실패:', error.response?.data.message || error.message);
            }
        } else {
            // 회원가입 처리
            try {
                const response = await axios.post('http://localhost:5000/api/register', formData);
                console.log(response.data);
                alert('회원가입 성공!');
                setIsSignUpMode(false);  // 로그인 모드로 돌아가기
            } catch (error) {
                console.error('회원가입 실패:', error.response?.data.message || error.message);
            }
        }
    };

    return (
        <div className={`container ${isSignUpMode ? 'sign-up-mode' : ''}`}>
            <div className="logo-container">
                <img src={`${process.env.PUBLIC_URL}/imo_logo_small.png`} alt="Logo" className="logo" />
            </div>
            <div className="forms-container">
                <div className="signin-signup">
                    {/* 로그인 폼 */}
                    <form onSubmit={handleSubmit} className="sign-in-form">
                        <h2 className="title">로그인</h2>
                        <div className="input-field">
                            <input
                                type="text"
                                placeholder="아이디"
                                name="username"
                                value={formData.username}
                                onChange={handleChange}
                                required
                            />
                        </div>
                        <div className="input-field">
                            <input
                                type="password"
                                placeholder="비밀번호"
                                name="password"
                                value={formData.password}
                                onChange={handleChange}
                                required
                            />
                        </div>
                        <input type="submit" value="로그인" className="btn solid" />
                    </form>

                    {/* 회원가입 폼 */}
                    <form onSubmit={handleSubmit} className="sign-up-form">
                        <h2 className="title">회원가입</h2>
                        <div className="input-field">
                            <input
                                type="text"
                                placeholder="아이디"
                                name="username"
                                value={formData.username}
                                onChange={handleChange}
                                required
                            />
                        </div>
                        <div className="input-field">
                            <input
                                type="text"
                                placeholder="이름"
                                name="name"
                                value={formData.name}
                                onChange={handleChange}
                                required
                            />
                        </div>
                        <div className="input-field">
                            <input
                                type="email"
                                placeholder="이메일"
                                name="email"
                                value={formData.email}
                                onChange={handleChange}
                                required
                            />
                        </div>
                        <div className="input-field">
                            <input
                                type="password"
                                placeholder="비밀번호"
                                name="password"
                                value={formData.password}
                                onChange={handleChange}
                                required
                            />
                        </div>
                        <div className="input-field">
                            <input
                                type="text"
                                placeholder="거주지"
                                name="residence"
                                value={formData.residence}
                                onChange={handleChange}
                                required
                            />
                        </div>
                        <input type="submit" className="btn" value="회원가입" />
                    </form>
                </div>
            </div>

            <div className="panels-container">
                <div className="panel left-panel">
                    <div className="content">
                        <h3>처음이신가요?</h3>
                        <button type="button" className="btn transparent" onClick={handleSignUpClick}>
                            회원가입
                        </button>
                    </div>
                </div>
                <div className="panel right-panel">
                    <div className="content">
                        <h3>이미 회원이신가요?</h3>
                        <button type="button" className="btn transparent" onClick={handleSignInClick}>
                            로그인
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Login;
