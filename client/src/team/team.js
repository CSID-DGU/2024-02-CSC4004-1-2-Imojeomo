import React, { useEffect, useState } from "react";
import "./team.css";
import { Link } from 'react-router-dom';
import { useNavigate } from "react-router-dom";
import axios from "axios";
import MyCalendar from '../MyCalendar/MyCalendar';
import { io } from 'socket.io-client';

const socket = io('http://localhost:5000');



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

    const [filteredEvents, setFilteredEvents] = useState([]);

    const [chatMessages, setChatMessages] = useState([]);
    const [newMessage, setNewMessage] = useState("");

    const navigate = useNavigate();

    useEffect(() => {
        socket.on('connect', () => {
            console.log("WebSocket 연결됨:", socket.id);
        });

        socket.on('disconnect', () => {
            console.log("WebSocket 연결 끊김.");
        });

        return () => {
            socket.off('connect');
            socket.off('disconnect');
        };
    }, []);


    useEffect(() => {
        const fetchMessages = async () => {
            try {
                if (!selectedTeamId) {
                    console.warn('선택된 팀 ID가 없습니다.');
                    setChatMessages([]);
                    return;
                }

                console.log('요청 경로:', `http://localhost:5000/api/chat/${selectedTeamId}`);

                const response = await axios.get(`http://localhost:5000/api/chat/${selectedTeamId}`);
                const messages = response.data;

                console.log('서버로부터 받은 메시지:', messages);
                setChatMessages(messages);
            } catch (error) {
                console.error('채팅 메시지 로드 실패:', error);
            }
        };

        fetchMessages();
    }, [selectedTeamId]);



    useEffect(() => {
        const handleNewMessage = (message) => {
            console.log("새 메시지 수신:", message);

            // 중복 메시지 추가 방지
            setChatMessages((prevMessages) => {
                const isDuplicate = prevMessages.some((msg) => msg._id === message._id);
                if (isDuplicate) return prevMessages;
                return [...prevMessages, message];
            });
        };

        socket.on('newMessage', handleNewMessage);

        return () => {
            socket.off('newMessage', handleNewMessage);
        };
    }, []);



    const sendMessage = () => {
        if (newMessage.trim()) {
            const message = {
                _id: Date.now(), // 임시 ID
                teamId: selectedTeamId,
                userId: user._id,
                userName: user.name, // 본인의 이름 (필요 시 사용)
                message: newMessage,
                timestamp: new Date(), // 현재 시간
                isTemporary: true, // 임시 메시지 플래그
            };

            // 상태를 즉시 업데이트
            setChatMessages((prevMessages) => [...prevMessages, message]);

            // 서버로 메시지 전송
            socket.emit('chatMessage', message);

            // 입력 필드 초기화
            setNewMessage("");
        }
    };













    useEffect(() => {
        const fetchFilteredEvents = async () => {
            if (!user) return;

            try {
                const response = await axios.get("http://localhost:5000/api/filtered-events", {
                    params: {
                        userId: user._id,
                        view: selectedTeamId ? "team" : "personal", // view 상태 전달
                        teamId: selectedTeamId || null,            // teamId 전달
                    },
                });
                setFilteredEvents(response.data);
            } catch (err) {
                console.error("필터링된 일정 로드 실패:", err);
                setError("일정을 가져오는 중 오류가 발생했습니다.");
            }
        };

        fetchFilteredEvents();
    }, [user, selectedTeamId]);




    const openModal = () => setModalOpen(true);
    const closeModal = () => {
        setModalOpen(false);
        setTeamName("");
        setError("");
    };

    const handleLogout = () => {
        logout();
        navigate('/');
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
        "#D35940": "#FFE1E5",
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
                <Link to="/team" className="logo-link">
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
                        {/* 제목 동적 변경 */}
                        <h2 className="board-title">
                            {selectedTeamId ? selectedTeamName : "공지사항"}
                        </h2>

                        {activeTab === "공지사항" && (
                            <div className="board">
                                {selectedTeamId ? (
                                    // 채팅 UI
                                    <>
                                        <div className="chat-messages">
                                            <ul>
                                                {chatMessages.map((msg) => {
                                                    const isMyMessage = String(msg.userId) === String(user._id);
                                                    const time = new Date(msg.timestamp).toLocaleString("ko-KR", {
                                                        hour: "2-digit",
                                                        minute: "2-digit",
                                                        hour12: false, // 24시간 형식
                                                    });

                                                    return isMyMessage ? (
                                                        <div className="myChat">
                                                            <li key={msg._id} style={{ textAlign: "right" }}>
                                                                <span style={{ color: "gray", marginRight: "8px" }}>{time}</span>
                                                                <strong>{msg.message}</strong>
                                                            </li>
                                                        </div>
                                                    ) : (
                                                        <div className="notMyChat">
                                                            <li key={msg._id}>
                                                                <strong>{msg.userName}</strong> : {msg.message}
                                                                <span style={{ marginLeft: "8px", color: "gray" }}>{time}</span>
                                                            </li>
                                                        </div>
                                                    );
                                                })}
                                            </ul>
                                        </div>

                                        <div className="chat-input">
                                            <input
                                                type="text"
                                                value={newMessage}
                                                onChange={(e) => setNewMessage(e.target.value)}
                                                placeholder="메시지를 입력하세요..."
                                            />
                                            <button onClick={sendMessage}>전송</button>
                                        </div>
                                    </>
                                ) : (
                                    // 기존 공지사항 UI
                                    error ? (
                                        <p>{error}</p>
                                    ) : filteredEvents.length > 0 ? (
                                        <ul>
                                            {filteredEvents.flatMap((event) => {
                                                if (event.isRecurring) {
                                                    const recurrenceEvents = [];
                                                    const startDate = new Date(event.start);
                                                    for (let i = 0; i < 10; i++) {
                                                        const recurringStart = new Date(startDate);
                                                        recurringStart.setDate(startDate.getDate() + i * 7);
                                                        recurrenceEvents.push({
                                                            ...event,
                                                            start: recurringStart,
                                                        });
                                                    }
                                                    return recurrenceEvents;
                                                }
                                                return [event];
                                            }).map((event) => {
                                                const teamColor = event.teamId
                                                    ? (() => {
                                                        const teamIndex = teams.findIndex(
                                                            (team) => team._id === event.teamId
                                                        );
                                                        return teamIndex !== -1 ? getButtonColor(teamIndex) : "#cecece";
                                                    })()
                                                    : "#cecece";

                                                return (
                                                    <li
                                                        key={`${event._id}-${event.start}`}
                                                        style={{
                                                            backgroundColor: teamColor,
                                                            padding: "10px",
                                                            borderRadius: "8px",
                                                            marginBottom: "8px",
                                                            listStyle: "none",
                                                        }}
                                                    >
                                                        <strong>{event.title}</strong> :{" "}
                                                        {new Date(event.start).toLocaleString("ko-KR", {
                                                            month: "long",
                                                            day: "numeric",
                                                            hour: "numeric",
                                                            minute: "numeric",
                                                            hour12: true,
                                                        })}
                                                        {event.place && (
                                                            <div
                                                                style={{
                                                                    marginTop: "4px",
                                                                    fontSize: "0.9em",
                                                                    color: "black",
                                                                }}
                                                            >
                                                                장소: {event.place}
                                                            </div>
                                                        )}
                                                    </li>
                                                );
                                            })}
                                        </ul>
                                    ) : (
                                        <p>표시할 일정이 없습니다.</p>
                                    )
                                )}
                            </div>
                        )}

                        {activeTab === "참여자" && (
                            <div className="participants-list">
                                <h3>참여자 명단</h3>
                                <ul>
                                    {teamMembers.length > 0 ? (
                                        teamMembers.map((member) => <li key={member._id}>{member.name}</li>)
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
                            {selectedTeamId ? "채팅" : "공지사항"}
                        </button>
                        <button
                            className={activeTab === "참여자" ? "active-tab" : ""}
                            onClick={() => setActiveTab("참여자")}
                            style={{ backgroundColor: selectedTeamColor }}
                        >
                            참여인원
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
