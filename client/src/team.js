// team.js
import React from "react";
import "./team.css";

function Team() {
    return (
        <div className="team-container">
            <aside className="sidebar">
                <img src="imo_logo_small.png" alt="IMO 로고" />
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
                    <div className="month">10</div>
                    <div className="days">
                        <div className="day">일</div>
                        <div className="day">월</div>
                        <div className="day">화</div>
                        <div className="day">수</div>
                        <div className="day">목</div>
                        <div className="day">금</div>
                        <div className="day">토</div>
                    </div>
                    <div className="dates">
                        {[...Array(31).keys()].map((day) => (
                            <div className={`date ${day === 17 ? 'highlight' : ''}`} key={day}>
                                {day + 1}
                            </div>
                        ))}
                    </div>
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
