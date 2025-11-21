import React, { useState, useEffect } from 'react';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
import { 
  ChevronLeftIcon, 
  ChevronRightIcon,
  CalendarIcon
} from '@heroicons/react/24/outline';

const AppointmentCalendar = ({ appointments = [], onDateSelect, selectedDate }) => {
  const [value, setValue] = useState(selectedDate || new Date());

  useEffect(() => {
    if (selectedDate) {
      setValue(selectedDate);
    }
  }, [selectedDate]);

  const handleDateChange = (date) => {
    setValue(date);
    if (onDateSelect) {
      onDateSelect(date);
    }
  };

  // Get appointments for a specific date
  const getAppointmentsForDate = (date) => {
    const dateStr = date.toISOString().split('T')[0];
    return appointments.filter(apt => {
      const aptDate = new Date(apt.appointmentDate).toISOString().split('T')[0];
      return aptDate === dateStr;
    });
  };

  // Custom tile content to show appointment indicators
  const tileContent = ({ date, view }) => {
    if (view === 'month') {
      const dayAppointments = getAppointmentsForDate(date);
      if (dayAppointments.length > 0) {
        return (
          <div className="flex justify-center">
            <div className="w-2 h-2 bg-primary-500 rounded-full"></div>
          </div>
        );
      }
    }
    return null;
  };

  // Custom tile class to highlight dates with appointments
  const tileClassName = ({ date, view }) => {
    if (view === 'month') {
      const dayAppointments = getAppointmentsForDate(date);
      if (dayAppointments.length > 0) {
        return 'has-appointments';
      }
    }
    return null;
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900 flex items-center">
          <CalendarIcon className="h-5 w-5 mr-2" />
          Calendar View
        </h3>
      </div>
      
      <Calendar
        onChange={handleDateChange}
        value={value}
        tileContent={tileContent}
        tileClassName={tileClassName}
        className="w-full"
        calendarType="US"
        formatShortWeekday={(locale, date) => {
          const weekdays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
          return weekdays[date.getDay()];
        }}
      />
      
      <style jsx>{`
        .react-calendar {
          width: 100%;
          border: none;
          font-family: inherit;
        }
        
        .react-calendar__navigation {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 1rem;
        }
        
        .react-calendar__navigation button {
          background: none;
          border: none;
          font-size: 1.125rem;
          font-weight: 600;
          color: #374151;
          cursor: pointer;
          padding: 0.5rem;
          border-radius: 0.375rem;
          transition: background-color 0.2s;
        }
        
        .react-calendar__navigation button:hover {
          background-color: #f3f4f6;
        }
        
        .react-calendar__navigation button:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }
        
        .react-calendar__month-view__weekdays {
          display: grid;
          grid-template-columns: repeat(7, 1fr);
          gap: 0.25rem;
          margin-bottom: 0.5rem;
        }
        
        .react-calendar__month-view__weekdays__weekday {
          text-align: center;
          font-size: 0.875rem;
          font-weight: 500;
          color: #6b7280;
          padding: 0.5rem 0;
        }
        
        .react-calendar__month-view__days {
          display: grid;
          grid-template-columns: repeat(7, 1fr);
          gap: 0.25rem;
        }
        
        .react-calendar__tile {
          background: none;
          border: none;
          font-size: 0.875rem;
          color: #374151;
          cursor: pointer;
          padding: 0.75rem 0.5rem;
          border-radius: 0.375rem;
          transition: all 0.2s;
          position: relative;
          min-height: 2.5rem;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
        }
        
        .react-calendar__tile:hover {
          background-color: #f3f4f6;
        }
        
        .react-calendar__tile--active {
          background-color: #3b82f6;
          color: white;
        }
        
        .react-calendar__tile--active:hover {
          background-color: #2563eb;
        }
        
        .react-calendar__tile--now {
          background-color: #dbeafe;
          color: #1e40af;
        }
        
        .react-calendar__tile--now:hover {
          background-color: #bfdbfe;
        }
        
        .react-calendar__tile--neighboringMonth {
          color: #9ca3af;
        }
        
        .has-appointments {
          background-color: #fef3c7;
        }
        
        .has-appointments:hover {
          background-color: #fde68a;
        }
        
        .has-appointments.react-calendar__tile--active {
          background-color: #3b82f6;
        }
      `}</style>
    </div>
  );
};

export default AppointmentCalendar;
