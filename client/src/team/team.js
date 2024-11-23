import React, { useState } from "react";
import "./team.css";
import { Link } from 'react-router-dom';
import { useNavigate } from "react-router-dom";
import MyCalendar from '../MyCalendar/MyCalendar';

function Team({ user, logout }) {
    const [isModalOpen, setModalOpen] = useState(false);

    const openModal = () => setModalOpen(true);
    const closeModal = () => setModalOpen(false);

    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    return (
        <div className="team-container">

            <aside className="team-header">
                <Link to="/" className="logo-link">
                    <img src="/imo_logo_small.png" alt="IMO 로고" className="logo" />
                </Link>
                <div className="profile-section">
                    <img src="/profile.png" alt="프로필" className="profile-icon" />
                    <div className="user-info">
                        <div className="user-name">{user ? user.name : '로그인하세요'}</div>
                        <div className="edit-info">
                            <button className="my-info">내 정보</button>
                            <button className="logout" onClick={handleLogout}>로그아웃</button>
                        </div>
                    </div>
                </div>
            </aside>

            <main className="main-content">
                <div className="calendar">
                    <div className="team-buttons">
                        <button className="team-button">0</button>
                        <button className="team-button" onClick={openModal}>+</button>
                    </div>

                    <div className="mycalendar">
                        <MyCalendar user={user} />
                    </div>
                </div>

                <aside className="notifications">
                    <h2 className="board-title">공지사항</h2>
                    <div className="board">
                        <ul>
                            <li><span>24일 모임 시간 투표</span></li>
                            <li>Lorem ipsum</li>
                            <li>Lorem ipsum</li>
                            <li>Lorem ipsum</li>
                            <li>Lorem ipsum</li>
                            <li>Lorem ipsum</li>
                        </ul>
                    </div>
                </aside>
            </main>

            {/* Modal */}
            {isModalOpen && (
                <div className="modal-overlay" onClick={closeModal}>
                    <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                        <h2>팀 추가</h2>
                        <button onClick={() => alert("팀 생성")}>팀 생성</button>
                        <button onClick={() => alert("팀 참가")}>팀 참가</button>
                        <button className="cancel" onClick={closeModal}>취소</button>
                    </div>
                </div>
            )}

        </div >
    );
}

export default Team;
