import React, { useEffect, useState, useMemo } from 'react';
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
    <div
      className="custom-event"
      style={{ backgroundColor: event.backgroundColor || "#ababab" }}
    >
      {event.title}
    </div>
  );
};

const CustomHeader = ({ date }) => {
  return (
    <div className="custom-header">
      <div className="date">{moment(date).format('D일')}</div>
      <div className="day">{moment(date).format('ddd')}</div>
    </div>
  );
};

const formats = {
  dayFormat: 'dddd',
  timeGutterFormat: (date) => moment(date).format('A hh:mm'),
  eventTimeRangeFormat: () => {
  },
};

const generateRandomVividHexColor = () => {
  const hue = Math.floor(Math.random() * 360); // 0 ~ 360
  const saturation = Math.floor(Math.random() * 20) + 80; // 80% ~ 100% 채도
  const lightness = Math.floor(Math.random() * 20) + 40; // 40% ~ 60% 명도

  const hslToRgb = (h, s, l) => {
    s /= 100;
    l /= 100;

    const c = (1 - Math.abs(2 * l - 1)) * s;
    const x = c * (1 - Math.abs((h / 60) % 2 - 1));
    const m = l - c / 2;

    let r = 0, g = 0, b = 0;

    if (h < 60) {
      r = c; g = x; b = 0;
    } else if (h < 120) {
      r = x; g = c; b = 0;
    } else if (h < 180) {
      r = 0; g = c; b = x;
    } else if (h < 240) {
      r = 0; g = x; b = c;
    } else if (h < 300) {
      r = x; g = 0; b = c;
    } else {
      r = c; g = 0; b = x;
    }

    r = Math.round((r + m) * 255);
    g = Math.round((g + m) * 255);
    b = Math.round((b + m) * 255);

    return { r, g, b };
  };

  const { r, g, b } = hslToRgb(hue, saturation, lightness);
  const toHex = (value) => value.toString(16).padStart(2, '0').toUpperCase();
  return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
};



const lightColors = {
  '#63A0CC': '#C0D9EA',
  '#9ACD4C': '#EAF4DB',
  '#D35940': '#EDBCB2',
  '#cecece': '#f2f2f2',
};

const MyCalendar = ({ user, teamId, teamColor }) => {
  const [events, setEvents] = useState([]);
  const [modalIsOpen, setModalIsOpen] = useState(false);
  const [deleteModalIsOpen, setDeleteModalIsOpen] = useState(false);
  const [newEventTitle, setNewEventTitle] = useState('');
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [selectedEvent, setSelectedEvent] = useState(null);

  const [view, setView] = useState('month');
  const [isRecurring, setIsRecurring] = useState(false);


  const expandRecurringEvents = (events, rangeInWeeks = 16) => {
    const oneWeek = 7 * 24 * 60 * 60 * 1000;
    const today = new Date();
    const startRange = new Date(today.getTime() - (rangeInWeeks / 2) * oneWeek);
    const endRange = new Date(today.getTime() + (rangeInWeeks / 2) * oneWeek);

    return events.flatMap(event => {
      if (event.isRecurring) {
        const occurrences = [];
        let currentStart = new Date(event.start);
        let currentEnd = new Date(event.end);

        while (currentStart <= endRange) {
          if (currentStart >= startRange) {
            occurrences.push({
              ...event,
              start: new Date(currentStart),
              end: new Date(currentEnd),
            });
          }
          currentStart = new Date(currentStart.getTime() + oneWeek);
          currentEnd = new Date(currentEnd.getTime() + oneWeek);
        }

        return occurrences;
      }

      return {
        ...event,
        start: new Date(event.start),
        end: new Date(event.end),
      };
    });
  };





  useEffect(() => {

    const fetchEvents = async () => {
      if (!user) {
        return;
      }


      try {
        const response = await axios.get('http://localhost:5000/api/events', {
          params: teamId ? { teamId } : { userId: user._id },
        });

        const expandedEvents = expandRecurringEvents(response.data);


        setEvents(expandedEvents);
      } catch (error) {
        console.error('Error fetching events:', error);
      }
    };

    fetchEvents();
  }, [user, teamId]);

  const dayPropGetter = (date) => {
    const isToday = moment(date).isSame(new Date(), 'day');
    if (isToday) {
      const lightColor = lightColors[teamColor] || '#f2f2f2';
      return {
        style: {
          backgroundColor: lightColor,
        },
      };
    }
    return {};
  };


  const handleSelectSlot = (slotInfo) => {
    setSelectedSlot(slotInfo);
    setModalIsOpen(true);
  };

  const handleSaveEvent = async () => {
    if (!newEventTitle || !selectedSlot || !selectedSlot.start || !selectedSlot.end || !user) {
      console.error('이벤트 데이터가 올바르지 않습니다.');
      return;
    }


    const backgroundColor = teamId
      ? teamColor // 팀 일정은 항상 팀 색상
      : isRecurring
        ? generateRandomVividHexColor() // 개인 정기적 일정은 무작위 색상
        : "#ababab"; // 개인 비정기적 일정은 회색


    const newEvent = {
      title: newEventTitle,
      start: selectedSlot.start.toISOString(),
      end: selectedSlot.end.toISOString(),
      isRecurring,
      userId: user._id,
      teamId: teamId || null,
      backgroundColor,
    };

    try {
      const response = await axios.post('http://localhost:5000/api/events', newEvent);

      setEvents([...events, {
        ...newEvent,
        _id: response.data._id,
        start: selectedSlot.start,
        end: selectedSlot.end
      }]);

      setNewEventTitle('');
      setIsRecurring(false);
      setModalIsOpen(false);

    } catch (error) {
      console.error('Error saving new event:', error);
    }
  };

  const handleSelectEvent = (event) => {
    if (teamId) {
      return;
    }

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




  const filteredEvents = useMemo(() => {
    const uniqueEvents = new Set();

    return events.filter((event) => {
      const eventKey = `${event.teamId || ''}-${event.start}-${event.end}-${event.title}`;

      if (uniqueEvents.has(eventKey)) {
        return false;
      }
      uniqueEvents.add(eventKey);

      if (event.teamId) {
        if (view === 'month') {
          return teamId === null || teamId === event.teamId;
        }
        if (view === 'week') {
          return true;
        }
      }

      if (!event.teamId && event.isRecurring && event.userId === user._id) {
        return view === 'week';
      }

      if (!event.teamId && !event.isRecurring && event.userId === user._id) {
        if (view === 'month') {
          return true;
        }
        if (view === 'week') {
          return true;
        }
      }

      if (!event.teamId && event.userId !== user._id) {
        return view === 'week' && teamId !== null;
      }

      return false;
    });
  }, [events, view, teamId, user._id]);





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
          event: (props) => <CustomEvent {...props} teamColor={teamColor} />,
          toolbar: CustomToolbar,
          header: CustomHeader,
        }}

        dayLayoutAlgorithm='overlap'
        style={{ height: 'calc(100vh - 190px)', margin: '50px' }}
        min={new Date(2024, 10, 4, 7, 0)}
        max={new Date(2024, 10, 4, 23, 0)}
        onSelectSlot={handleSelectSlot}
        onSelectEvent={handleSelectEvent}
        onView={(newView) => {
          setView(newView)
        }}
        dayPropGetter={dayPropGetter}
        eventPropGetter={(event) => {
          if (view === 'month') {
            return {
              style: {
                backgroundColor: event.backgroundColor || "#ababab", // 팀 색상 동기화
                color: "#fff",
                borderRadius: "4px",
                border: "none",
                borderTopRightRadius: "0",
                borderBottomRightRadius: "0",
              },
            };
          }
          return {};
        }}
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
        <label>
          <input
            className="recurring_check"
            type="checkbox"
            checked={isRecurring}
            onChange={(e) => setIsRecurring(e.target.checked)}
          />
          정기적 일정
        </label>
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