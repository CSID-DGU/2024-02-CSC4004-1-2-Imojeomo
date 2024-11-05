import React from "react";
import "./sidebar.css";

function Sidebar() {
    return (
        <div className="sidebar-container">
            <img src="/imo_logo_small.png" alt="IMO 로고" />
            <div className="profile-section">
                <div className="profile-icon">👤</div>
                <div className="user_name">유저이름</div>
                <div className="settings-icon">⚙️</div>
            </div>
        </div>
    );
}

export default Sidebar;