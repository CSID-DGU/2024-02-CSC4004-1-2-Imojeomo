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
      justifyContent: 'center',
      alignItems: 'center',
      height: '100%',
      textAlign: 'center',
      borderRadius: '4px',
    }}>
      {event.title}
    </div>
  );
};

const formats = {
  dayFormat: 'dddd',
  timeGutterFormat: (date) => moment(date).format('A hh:mm'),
  eventTimeRangeFormat: ({ start, end }) => {
    return `${moment(start).format('A hh:mm')} - ${moment(end).format('A hh:mm')}`;
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
          end: new Date(event.end),
        }));
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
          toolbar: CustomToolbar,
        }}
        style={{ height: 450, margin: '50px' }}
        min={new Date(2024, 10, 4, 8, 0)}
        max={new Date(2024, 10, 4, 21, 0)}
      />
    </div>
  );
};

export default MyCalendar;
