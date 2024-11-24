// src/AddTeam.js

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './add-team.css';

const AddTeam = () => {
  const [teamName, setTeamName] = useState('');
  const [teamDescription, setTeamDescription] = useState('');
  const navigate = useNavigate();

  const handleCreateTeam = () => {
    if (!teamName) {
      alert('팀 이름을 입력해주세요.');
      return;
    }
    // 팀 생성 로직 작성 - 실제로는 API 호출로 팀 생성
    alert(`팀 "${teamName}"이(가) 생성되었습니다!`);
    // 이후 메인 페이지로 이동
    navigate('/');
  };

  return (
    <div className="add-team-page">
      <h1 className="title">팀 생성</h1>
      <form className="team-form" onSubmit={(e) => e.preventDefault()}>
        <label htmlFor="teamName" className="team-label">팀 이름</label>
        <input
          type="text"
          id="teamName"
          value={teamName}
          onChange={(e) => setTeamName(e.target.value)}
          className="team-input"
          placeholder="팀 이름을 입력하세요"
          required
        />
        
        <label htmlFor="teamDescription" className="team-label">팀 설명</label>
        <textarea
          id="teamDescription"
          value={teamDescription}
          onChange={(e) => setTeamDescription(e.target.value)}
          className="team-textarea"
          placeholder="팀에 대해 설명해주세요"
        />

        <button
          type="button"
          onClick={handleCreateTeam}
          className="create-team-button"
        >
          팀 생성
        </button>
      </form>
    </div>
  );
};

export default AddTeam;
