// team.js
import React from "react";
import "./team.css";
import { Link } from 'react-router-dom';
import MyCalendar from './MyCalendar';



function Team() {
    return (
        <div className="team-container">
            <aside className="sidebar">
                <Link to="/">
                    <img src="/imo_logo_small.png" alt="IMO 로고" />
                </Link>
                <div className="profile-section">
                    <div className="profile-icon">👤</div>
                    <div className="user_name">유저이름</div>
                    <div className="settings-icon">⚙️</div>
                </div>
                <button className="invite-button">초대</button>
                <button className="recommend-button">장소 추천</button>
            </aside>

            <main className="main-content">
                <div className="header">
                    <button className="tab active">팀2</button>
                    <button className="tab">가장 가까운 일정 안내</button>
                </div>

                <div className="calendar">
                    <MyCalendar />
                </div>
            </main>

            <aside className="notifications">
                <h2>공지사항</h2>
                <div className="board">
                    <ul>
                        <li>
                            <span>24일 모임 시간 투표</span>
                        </li>
                        <li>Lorem ipsum</li>
                        <li>Lorem ipsum</li>
                        <li>Lorem ipsum</li>
                        <li>Lorem ipsum</li>
                        <li>Lorem ipsum</li>
                    </ul>
                </div>
            </aside>
        </div>
    );
}

export default Team;
