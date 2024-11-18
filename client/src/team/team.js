import React from "react";
import "./team.css";
import { Link } from 'react-router-dom';
import MyCalendar from '../MyCalendar/MyCalendar';

function Team() {
    return (
        <div className="team-container">

            <aside className="team-header">
                <Link to="/" className="logo-link">
                    <img src="/imo_logo_small.png" alt="IMO 로고" className="logo" />
                </Link>
                <div className="profile-section">
                    <div className="profile-icon">👤</div>
                    <div className="user-name">유저이름</div>
                    <div className="settings-icon">⚙️</div>
                </div>
            </aside>

            <main className="main-content">
                <div className="calendar">
                    <MyCalendar />
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

        </div>
    );
}

export default Team;
