import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom'; // useNavigate 추가
import './profile.css';

const Profile = () => {
  const [selectedBlocks, setSelectedBlocks] = useState([]);
  const [isMouseDown, setIsMouseDown] = useState(false);
  const navigate = useNavigate(); // useNavigate 훅 사용

  const toggleBlockSelection = (day, hour) => {
    if (isSelected(day, hour)) {
      setSelectedBlocks((prevBlocks) =>
        prevBlocks.filter((block) => !(block.day === day && block.hour === hour))
      );
    } else {
      setSelectedBlocks((prevBlocks) => [...prevBlocks, { day, hour }]);
    }
  };

  const handleMouseDown = (day, hour) => {
    setIsMouseDown(true);
    toggleBlockSelection(day, hour);
  };

  const handleMouseEnter = (day, hour) => {
    if (isMouseDown) {
      toggleBlockSelection(day, hour);
    }
  };

  const handleMouseUp = () => {
    setIsMouseDown(false);
  };

  const isSelected = (day, hour) => {
    return selectedBlocks.some((block) => block.day === day && block.hour === hour);
  };

  // main 페이지로 이동하는 함수
  const goToMainPage = () => {
    navigate('/'); // 루트 경로로 이동 (main 페이지)
  };

  return (
    <div className="profile-page">
      <div className="profile-section">
        <div className="profile-picture"></div>
        <button className="edit-profile-btn">프로필 수정</button>
        <div className="profile-info">
          <input type="text" placeholder="이름" className="profile-input" />
          <input type="email" placeholder="이메일" className="profile-input" />
          <input type="text" placeholder="위치" className="profile-input" />
          <input type="tel" placeholder="휴대전화" className="profile-input" />
        </div>
        <button className="edit-info-btn">개인정보 수정</button>
      </div>
      <div className="timetable-section">
        <table className="timetable" onMouseLeave={handleMouseUp}>
          <thead>
            <tr>
              <th>시간</th>
              <th>일</th>
              <th>월</th>
              <th>화</th>
              <th>수</th>
              <th>목</th>
              <th>금</th>
              <th>토</th>
            </tr>
          </thead>
          <tbody>
            {Array.from({ length: 24 }).map((_, hour) => (
              <tr key={hour}>
                <td>{`${String(hour).padStart(2, '0')}:00`}</td>
                {Array.from({ length: 7 }).map((_, day) => (
                  <td
                    key={day}
                    className={`timetable-block ${isSelected(day, hour) ? 'selected' : ''}`}
                    onMouseDown={() => handleMouseDown(day, hour)}
                    onMouseEnter={() => handleMouseEnter(day, hour)}
                    onMouseUp={handleMouseUp}
                  ></td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
        <button className="edit-timetable-btn" onClick={goToMainPage}>수정</button> {/* 버튼 클릭 시 main 페이지로 이동 */}
      </div>
    </div>
  );
};

export default Profile;
