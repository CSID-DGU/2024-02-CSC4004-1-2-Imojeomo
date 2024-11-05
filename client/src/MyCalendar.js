import React from 'react';
import { Calendar, momentLocalizer } from 'react-big-calendar';
import moment from 'moment';
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

  const goToCurrent = () => {
    toolbar.onNavigate('TODAY');
  };

  return (
    <div className="custom-toolbar">
      <button onClick={goToBack}>{messages.previous}</button>
      <button onClick={goToNext}>{messages.next}</button>
      <button onClick={goToCurrent}>{messages.today}</button>
      <span className="custom-date">{moment(toolbar.date).format('YYYY년 MM월')}</span>
      <button onClick={() => toolbar.onView('month')}>{messages.month}</button>
      <button onClick={() => toolbar.onView('week')}>{messages.week}</button>
    </div>
  );
};

const events = [
  {
    title: '회의',
    start: new Date(2024, 10, 4, 10, 0),
    end: new Date(2024, 10, 4, 12, 0),
  },
  {
    title: '점심',
    start: new Date(2024, 10, 5, 12, 0),
    end: new Date(2024, 10, 5, 13, 0),
  },
];

const MyCalendar = () => {
  return (
    <div>
      <Calendar
        localizer={localizer}
        events={events}
        startAccessor="start"
        endAccessor="end"
        messages={messages}
        components={{
          toolbar: CustomToolbar, // 커스텀 툴바 사용
        }}
        style={{ height: 450, margin: '50px' }}
      />
    </div>
  );
};

export default MyCalendar;
