import React, { useState } from 'react';
import './login.css';

function Login() {
    const [isSignUpMode, setIsSignUpMode] = useState(false);

    const handleSignUpClick = () => {
        setIsSignUpMode(true);
    };

    const handleSignInClick = () => {
        setIsSignUpMode(false);
    };

    return (
        <div className={`container ${isSignUpMode ? 'sign-up-mode' : ''}`}>
            <div className="logo-container">
                <img src={`${process.env.PUBLIC_URL}/imo_logo_small.png`} alt="Logo" className="logo" />            </div>
            <div className="forms-container">
                <div className="signin-signup">
                    <form action="#" className="sign-in-form">
                        <h2 className="title">로그인</h2>
                        <div className="input-field">
                            <input type="text" placeholder="아이디" />
                        </div>
                        <div className="input-field">
                            <input type="password" placeholder="비밀번호" />
                        </div>
                        <input type="submit" value="로그인" className="btn solid" />
                    </form>

                    <form action="#" className="sign-up-form">
                        <h2 className="title">회원가입</h2>
                        <div className="input-field">
                            <input type="text" placeholder="아이디" />
                        </div>
                        <div className="input-field">
                            <input type="text" placeholder="이름" />
                        </div>
                        <div className="input-field">
                            <input type="email" placeholder="이메일" />
                        </div>
                        <div className="input-field">
                            <input type="password" placeholder="비밀번호" />
                        </div>
                        <input type="submit" className="btn" value="회원가입" />
                    </form>
                </div>
            </div>

            <div className="panels-container">
                <div className="panel left-panel">
                    <div className="content">
                        <h3>처음이신가요?</h3>
                        <button className="btn transparent" onClick={handleSignUpClick}>
                            회원가입
                        </button>
                    </div>
                </div>
                <div className="panel right-panel">
                    <div className="content">
                        <h3>이미 회원이신가요?</h3>
                        <button className="btn transparent" onClick={handleSignInClick}>
                            로그인
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Login;

export default Login;