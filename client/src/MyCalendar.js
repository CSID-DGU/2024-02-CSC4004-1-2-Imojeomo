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

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const response = await axios.get('http://localhost:5000/api/events');
        const formattedEvents = response.data.map(event => ({
          _id: event._id,
          title: event.title,
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
    if (!newEventTitle) return;

    const newEvent = {
      title: newEventTitle,
      start: selectedSlot.start,
      end: selectedSlot.end,
    };

    try {
      const response = await axios.post('http://localhost:5000/api/events', newEvent);
      setEvents([...events, { ...newEvent, _id: response.data._id }]);
    } catch (error) {
      console.error('Error saving new event:', error);
    }

    setNewEventTitle('');
    setModalIsOpen(false);
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

  return (
    <div>
      <Calendar
        localizer={localizer}
        events={events}
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

/*해야될거
1. 스케줄 겹치게 저장
2. 고정 주간 스케줄 (수업시간표)
나머진 팀 생성 기능 만들고 ㅇㅇ */
