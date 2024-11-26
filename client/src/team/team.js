import React, { useEffect, useState } from "react";
import "./team.css";
import { Link } from 'react-router-dom';
import { useNavigate } from "react-router-dom";
import axios from "axios";
import MyCalendar from '../MyCalendar/MyCalendar';

function Team({ user, logout }) {
    const [isModalOpen, setModalOpen] = useState(false);
    const [teamName, setTeamName] = useState("");
    const [error, setError] = useState("");

    const [teams, setTeams] = useState([]);
    const [selectedTeamId, setSelectedTeamId] = useState(null);
    const [selectedTeamName, setSelectedTeamName] = useState("내 일정");
    const [selectedTeamColor, setSelectedTeamColor] = useState("#cecece");

    const [teamMembers, setTeamMembers] = useState([]);
    const [activeTab, setActiveTab] = useState("공지사항");

    const [isJoinMode, setJoinMode] = useState(false);
    const [inviteCode, setInviteCode] = useState("");

    const navigate = useNavigate();


    const openModal = () => setModalOpen(true);
    const closeModal = () => {
        setModalOpen(false);
        setTeamName("");
        setError("");
    };

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    const handleCreateTeam = async () => {
        if (!teamName.trim()) {
            setError("팀 이름을 입력하세요.");
            return;
        }
        try {
            const response = await axios.post("http://localhost:5000/api/teams", {
                name: teamName,
                creatorId: user._id,
            });
            alert(`팀 생성 성공: ${response.data.name}`);
            setTeams([...teams, response.data]);
            closeModal();
        } catch (error) {
            console.error("팀 생성 오류:", error);
            setError("팀 생성에 실패했습니다.");
        }
    };

    const handleTeamClick = async (teamId) => {
        setSelectedTeamId(teamId);

        const team = teams.find(t => t._id === teamId);
        setSelectedTeamName(team ? team.name : "내 일정");

        if (teamId) {
            const teamIndex = teams.findIndex(t => t._id === teamId);
            const color = getButtonColor(teamIndex);
            setSelectedTeamColor(color);

            document.body.style.backgroundColor = backgroundColors[color] || "#f2f2f2";

            try {
                const response = await axios.get(`http://localhost:5000/api/teams/${teamId}/members`);
                setTeamMembers(response.data);
            } catch (error) {
                console.error("멤버 목록 가져오기 실패:", error);
                setTeamMembers([]);
            }
        } else {
            setSelectedTeamColor("#cecece");
            document.body.style.backgroundColor = "#f2f2f2";
            setTeamMembers([]);
        }
    };

    const baseColors = ["#D35940", "#9ACD4C", "#63A0CC"];
    const backgroundColors = {
        "#D35940": "#EDBCB2",
        "#9ACD4C": "#EAF4DB",
        "#63A0CC": "#C0D9EA",
    };

    const getButtonColor = (index) => baseColors[index % baseColors.length];

    const generateInviteCode = async (teamId) => {
        try {
            const response = await axios.post(`http://localhost:5000/api/teams/${teamId}/invite-code`);
            alert(`초대 코드: ${response.data.inviteCode}`);
        } catch (error) {
            console.error('초대 코드 생성 실패:', error);
            alert('초대 코드 생성에 실패했습니다.');
        }
    };

    const joinTeamWithCode = async (code, userId) => {
        try {
            const response = await axios.post('http://localhost:5000/api/teams/join', {
                inviteCode: code,
                userId,
            });
            alert('팀 참가 성공!');
            console.log('참가한 팀 ID: ', response.data.teamId);
        } catch (error) {
            console.error('팀 참가 실패:', error);
            alert('유효하지 않은 코드입니다.');
        }
    };


    useEffect(() => {
        const fetchTeams = async () => {
            if (!user) return;

            try {
                const response = await axios.get("http://localhost:5000/api/teams", {
                    params: { userId: user._id },
                });
                setTeams(response.data);
            } catch (error) {
                console.error("팀 목록 불러오기 실패:", error);
            }
        };
        fetchTeams();
    }, [user]);


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
                        <button
                            className={`team-button ${selectedTeamId === null ? 'active' : ''}`}
                            onClick={() => handleTeamClick(null)}
                        >
                            0
                        </button>

                        {teams.map((team, index) => (
                            <button
                                key={team._id}
                                className={`team-button ${selectedTeamId === team._id ? 'active' : ''}`}
                                onClick={() => handleTeamClick(team._id)}
                                style={{ backgroundColor: getButtonColor(index) }}
                            >
                                {index + 1}
                            </button>
                        ))}
                        <button className="team-button" onClick={openModal}>+</button>
                    </div>

                    <div className="mycalendar">
                        <MyCalendar user={user} teamId={selectedTeamId} teamColor={selectedTeamColor} />
                    </div>
                </div>

                <aside className="notifications">
                    <div className="tab-content">

                        <h2 className="board-title">{selectedTeamName}</h2>

                        {activeTab === "공지사항" && (
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
                        )}

                        {activeTab === "참여자" && (
                            <div className="participants-list">
                                <h3>참여자 명단</h3>
                                <ul>
                                    {teamMembers.length > 0 ? (
                                        teamMembers.map(member => (
                                            <li key={member._id}>{member.name}</li>
                                        ))
                                    ) : (
                                        <li>참여자가 없습니다.</li>
                                    )}
                                </ul>
                                {selectedTeamId && (
                                    <button
                                        onClick={() => generateInviteCode(selectedTeamId)}
                                        className="invite-button"
                                        style={{ backgroundColor: selectedTeamColor }}
                                    >
                                        +
                                    </button>
                                )}
                            </div>
                        )}
                    </div>

                    <div className="tab-button">
                        <button
                            className={activeTab === "공지사항" ? "active-tab" : ""}
                            onClick={() => setActiveTab("공지사항")}
                            style={{ backgroundColor: selectedTeamColor }}
                        >
                            공지사항
                        </button>
                        <button
                            className={activeTab === "참여자" ? "active-tab" : ""}
                            onClick={() => setActiveTab("참여자")}
                            style={{ backgroundColor: selectedTeamColor }}
                        >
                            참여자
                        </button>
                    </div>

                </aside>
            </main>

            {/* Modal */}
            {isModalOpen && (
                <div className="modal-overlay" onClick={closeModal}>
                    <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                        {!isJoinMode ? (
                            <>
                                <h2>팀 추가</h2>
                                <input
                                    type="text"
                                    placeholder="팀 이름을 입력하세요"
                                    value={teamName}
                                    onChange={(e) => setTeamName(e.target.value)}
                                />
                                {error && <p className="error-message">{error}</p>}
                                <button onClick={handleCreateTeam}>팀 생성</button>
                                <button onClick={() => setJoinMode(true)}>팀 참가</button>
                                <button className="cancel" onClick={closeModal}>취소</button>
                            </>
                        ) : (
                            <>
                                <h2>팀 참가</h2>
                                <input
                                    type="text"
                                    placeholder="초대 코드를 입력하세요"
                                    value={inviteCode}
                                    onChange={(e) => setInviteCode(e.target.value)}
                                />
                                <button onClick={() => joinTeamWithCode(inviteCode, user._id)}>참가</button>
                                <button onClick={() => setJoinMode(false)}>뒤로</button>
                                <button className="cancel" onClick={closeModal}>취소</button>
                            </>
                        )}
                    </div>
                </div>
            )}
        </div >
    );
}

export default Team;
