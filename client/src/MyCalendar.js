import React, { useEffect, useState } from 'react';
import { Calendar, momentLocalizer } from 'react-big-calendar';
import moment from 'moment';
import axios from 'axios';
import 'moment/locale/ko'; // 한국어 로케일 불러오기
import 'react-big-calendar/lib/css/react-big-calendar.css';
import './MyCalendar.css';

const localizer = momentLocalizer(moment);


const messages = {
  allDay: '종일',
  previous: '<',
  next: '>',
  today: '오늘',
  month: '캘린더',
  week: '시간표',
  // 나머지 메시지들은 필요에 따라 추가하거나 비워둘 수 있습니다.
  // day: '일',
  // agenda: '일정',
};

const CustomToolbar = (toolbar) => {
  const goToBack = () => {
    toolbar.onNavigate('PREV');
  };

  const goToNext = () => {
    toolbar.onNavigate('NEXT');
  };

  return (
    <div className="custom-toolbar">
      <button onClick={goToBack}>{messages.previous}</button>
      <span className="custom-date">{moment(toolbar.date).format('YYYY년 MM월')}</span>
      <button onClick={goToNext}>{messages.next}</button>
      <button onClick={() => toolbar.onView('month')}>{messages.month}</button>
      <button onClick={() => toolbar.onView('week')}>{messages.week}</button>
    </div>
  );
};

const CustomEvent = ({ event }) => {
  return (
    <div style={{
      display: 'flex',
      justifyContent: 'center', // 중앙 정렬
      alignItems: 'center', // 수직 중앙 정렬
      height: '100%', // 전체 높이 사용
      textAlign: 'center', // 텍스트 중앙 정렬
      borderRadius: '4px', // 모서리 둥글게
    }}>
      {event.title}
    </div>
  );
};

const formats = {
  dayFormat: 'dddd', // 요일 형식
  timeGutterFormat: (date) => moment(date).format('A hh:mm'), // '오후 01:00' 형식으로 표시
  eventTimeRangeFormat: () => {
  },
};

const MyCalendar = () => {
  const [events, setEvents] = useState([]);

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const response = await axios.get('http://localhost:5000/api/events');
        const formattedEvents = response.data.map(event => ({
          title: event.title,
          start: new Date(event.start),
          end: new Date(event.end)
        }));
        console.log('Formatted Events:', formattedEvents);

        setEvents(formattedEvents);
      } catch (error) {
        console.error('Error fetching events:', error);
      }
    };

    fetchEvents();
  }, []);


  return (
    <div>
      <Calendar
        localizer={localizer}
        events={events}
        startAccessor="start"
        endAccessor="end"
        messages={messages}
        formats={formats}
        components={{
          event: CustomEvent,
          toolbar: CustomToolbar, // 커스텀 툴바 사용
        }}
        style={{ height: 450, margin: '50px' }}
        min={new Date(2024, 10, 4, 8, 0)}
        max={new Date(2024, 10, 4, 21, 0)}
      />
    </div>
  );
};

export default MyCalendar;
