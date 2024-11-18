import React, { useEffect, useState } from 'react';
import { Calendar, momentLocalizer } from 'react-big-calendar';
import moment from 'moment';
import axios from 'axios';
import Modal from 'react-modal';
import 'moment/locale/ko';
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
      <button onClick={goToBack} className='leftButton'>
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24">
          <path
            d="M20.494,7.968l-9.54-7A5,5,0,0,0,3,5V19a5,5,0,0,0,7.957,4.031l9.54-7a5,5,0,0,0,0-8.064Zm-1.184,6.45-9.54,7A3,3,0,0,1,5,19V5A2.948,2.948,0,0,1,6.641,2.328,3.018,3.018,0,0,1,8.006,2a2.97,2.97,0,0,1,1.764.589l9.54,7a3,3,0,0,1,0,4.836Z"
            transform="scale(-1, 1) translate(-24, 0)"
          />
        </svg>
      </button>
      <span className="custom-date">{moment(toolbar.date).format('MM월')}</span>
      <button onClick={goToNext} className='rightButton'>
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24">
          <path d="M20.494,7.968l-9.54-7A5,5,0,0,0,3,5V19a5,5,0,0,0,7.957,4.031l9.54-7a5,5,0,0,0,0-8.064Zm-1.184,6.45-9.54,7A3,3,0,0,1,5,19V5A2.948,2.948,0,0,1,6.641,2.328,3.018,3.018,0,0,1,8.006,2a2.97,2.97,0,0,1,1.764.589l9.54,7a3,3,0,0,1,0,4.836Z" />
        </svg>
      </ button>
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
      borderRadius: '4px',
      textAlign: 'center',
    }}>
      {event.title}
    </div>
  );
};

const formats = {
  dayFormat: 'dddd', // 요일 형식
  timeGutterFormat: (date) => moment(date).format('A hh:mm'),
  eventTimeRangeFormat: () => {
  },
};

const MyCalendar = () => {
  const [events, setEvents] = useState([]);
  const [modalIsOpen, setModalIsOpen] = useState(false);
  const [deleteModalIsOpen, setDeleteModalIsOpen] = useState(false);
  const [newEventTitle, setNewEventTitle] = useState('');
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [selectedEvent, setSelectedEvent] = useState(null);

  const [view, setView] = useState('month'); // 현재 보기를 추적

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const response = await axios.get('http://localhost:5000/api/events');
        const formattedEvents = response.data.map(event => ({
          ...event,
          start: new Date(event.start),
          end: new Date(event.end)
        }));
        setEvents(formattedEvents);
      } catch (error) {
        console.error('Error fetching events:', error);
      }
    };

    fetchEvents();
  }, []);

  const handleSelectSlot = (slotInfo) => {
    setSelectedSlot(slotInfo);
    setModalIsOpen(true);
  };

  const handleSaveEvent = async () => {
    if (!newEventTitle || !selectedSlot || !selectedSlot.start || !selectedSlot.end) {
      console.error('이벤트 데이터가 올바르지 않습니다.');
      return;
    }

    const newEvent = {
      title: newEventTitle,
      start: selectedSlot.start.toISOString(),
      end: selectedSlot.end.toISOString(),
    };

    try {
      const response = await axios.post('http://localhost:5000/api/events', newEvent);
      setEvents([...events, { ...newEvent, _id: response.data._id, start: selectedSlot.start, end: selectedSlot.end }]);
      setNewEventTitle('');
      setModalIsOpen(false);

    } catch (error) {
      console.error('Error saving new event:', error);
    }
  };

  const handleSelectEvent = (event) => {
    setSelectedEvent(event);
    setDeleteModalIsOpen(true);
  };

  const handleDeleteEvent = async () => {
    try {
      if (selectedEvent && selectedEvent._id) {
        await axios.delete(`http://localhost:5000/api/events/${selectedEvent._id}`);
        setEvents(events.filter(event => event._id !== selectedEvent._id));
      } else {
        console.error('Selected event ID is missing');
      }

    } catch (error) {
      console.error('Error deleting event:', error);
    }

    setDeleteModalIsOpen(false);
  }

  // 월간 보기에서 제외할 조건 설정
  const filteredEvents = events.filter(event => {
    if (view === 'month') {
      // 특정 조건을 설정 (예: 제목에 "회의"가 포함된 일정 제외)
      return !event.title.includes('회의');
    }
    return true; // 월간 뷰가 아닌 경우 모든 이벤트를 포함
  });

  return (
    <div>
      <Calendar
        localizer={localizer}
        events={filteredEvents}
        startAccessor="start"
        endAccessor="end"
        selectable
        messages={messages}
        formats={formats}
        components={{
          event: CustomEvent,
          toolbar: CustomToolbar,
        }}

        dayLayoutAlgorithm="no-overlap"
        style={{ height: '66vh', margin: '50px' }}
        min={new Date(2024, 10, 4, 9, 0)}
        max={new Date(2024, 10, 4, 19, 0)}
        onSelectSlot={handleSelectSlot}
        onSelectEvent={handleSelectEvent}
        onView={(newView) => setView(newView)}
      />

      <Modal
        isOpen={modalIsOpen}
        onRequestClose={() => setModalIsOpen(false)}
        ariaHideApp={false}
        contentLabel="Add New Event"
        className="event-modal"
      >
        <h2> 새 일정 추가</h2>
        <input
          type="text"
          placeholder="일정 제목 입력"
          value={newEventTitle}
          onChange={(e) => setNewEventTitle(e.target.value)} />
        <button onClick={handleSaveEvent} className="save-button">저장</button>
        <button onClick={() => setModalIsOpen(false)} className="cancel-button">취소</button>
      </Modal>

      <Modal
        isOpen={deleteModalIsOpen}
        onRequestClose={() => setDeleteModalIsOpen(false)}
        ariaHideApp={false}
        contentLabel="Delete Event"
        className="event-modal"
      >
        <h2>일정을 삭제하시겠습니까?</h2>
        <p>{selectedEvent && selectedEvent.title}</p>
        <button onClick={handleDeleteEvent} className="delete-button">삭제</button>
        <button onClick={() => setDeleteModalIsOpen(false)}>취소</button>
      </Modal>

    </div>
  );
};


export default MyCalendar;