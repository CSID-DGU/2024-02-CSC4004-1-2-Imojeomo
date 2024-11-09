import React, { useState, useEffect } from 'react';
import { Calendar, momentLocalizer } from 'react-big-calendar';
import moment from 'moment';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import { useNavigate } from 'react-router-dom'; // useNavigate 추가
import './main.css';

const localizer = momentLocalizer(moment);

// 커스텀 Toolbar 컴포넌트
const CustomToolbar = (toolbar) => {
  const goToPreviousMonth = () => {
    toolbar.onNavigate('PREV');
  };

  const goToNextMonth = () => {
    toolbar.onNavigate('NEXT');
  };

  return (
    <div className="calendar-toolbar">
      <span className="toolbar-label">
        {moment(toolbar.date).format('YYYY년 M월')}
      </span>
      <div className="arrows">
        <button onClick={goToPreviousMonth} className="arrow left-arrow">&lt;</button>
        <button onClick={goToNextMonth} className="arrow right-arrow">&gt;</button>
      </div>
    </div>
  );
};

const MainPage = () => {
  const [events, setEvents] = useState([]);
  const [currentDate, setCurrentDate] = useState(new Date());
  const navigate = useNavigate(); // useNavigate 훅 사용

  const handleSelectSlot = ({ start, end }) => {
    const title = window.prompt('새로운 일정을 입력하세요');
    if (title) {
      const newEvent = { title, start, end };
      setEvents((prev) => {
        const updatedEvents = [...prev, newEvent];
        updatedEvents.sort((a, b) => a.start - b.start);
        return updatedEvents;
      });
    }
  };

  const handleSelectEvent = (event) => {
    const action = window.prompt(
      `일정: ${event.title}\n\n1. 이름 변경을 원하면 새로운 제목을 입력하세요.\n2. 같은 날짜에 새로운 일정을 추가하려면 '추가'라고 입력하세요.\n3. 삭제를 원하면 '삭제'를 입력하세요.`
    );

    if (action === '삭제') {
      setEvents((prev) => prev.filter((e) => e !== event));
    } else if (action === '추가') {
      const newTitle = window.prompt('새로운 일정 이름을 입력하세요');
      if (newTitle) {
        const newEvent = {
          title: newTitle,
          start: event.start,
          end: event.end,
        };
        setEvents((prev) => {
          const updatedEvents = [...prev, newEvent];
          updatedEvents.sort((a, b) => a.start - b.start);
          return updatedEvents;
        });
      }
    } else if (action) {
      setEvents((prev) => {
        const updatedEvents = prev.map((e) =>
          e === event ? { ...e, title: action } : e
        );
        updatedEvents.sort((a, b) => a.start - b.start);
        return updatedEvents;
      });
    }
  };

  const goToAddTeamPage = () => {
    navigate('/add-team'); // /add-team 경로로 이동
  };

  return (
    <div className="main-page">
      <header className="header">
        <div className="month-navigation">
          <h2>{moment(currentDate).format('M월')}</h2>
        </div>
        <div className="user-profile">
          <div className="profile-icon">👤</div>
          <div className="settings-icon">⚙️</div>
        </div>
      </header>
      <div className="content">
        <aside className="sidebar">
          <div className="label">0</div>
          <div className="label red">1</div>
          <div className="label green">2</div>
          <div className="label blue">3</div>
          <button className="add-btn" onClick={goToAddTeamPage}>+</button>
        </aside>
        <div className="calendar-container">
          <Calendar
            localizer={localizer}
            events={events}
            startAccessor="start"
            endAccessor="end"
            selectable
            onSelectSlot={handleSelectSlot}
            onSelectEvent={handleSelectEvent}
            date={currentDate}
            onNavigate={(date) => setCurrentDate(date)}
            style={{ height: 600 }}
            views={['month']}
            defaultView="month"
            popup
            components={{
              toolbar: CustomToolbar
            }}
          />
        </div>
        <div className="event-details">
          <h3>{moment(currentDate).format('MM.DD')} - TODAY</h3>
          {events.length === 0 ? (
            <p>일정이 없습니다.</p>
          ) : (
            <ul>
              {events.map((event, index) => (
                <li key={index}>
                  {event.start.toLocaleDateString('ko-KR')} - {event.title}
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
};

export default MainPage;
