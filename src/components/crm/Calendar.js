'use client';

import React, { useState } from 'react';
import { useCRM } from '@/context/CRMState';

export default function Calendar() {
  const { appointments, leads, updateAppointmentDate, setIsBookingModalOpen } = useCRM();
  const [currentDate, setCurrentDate] = useState(new Date());

  const getLocalDateString = (d = new Date()) => {
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${y}-${m}-${day}`;
  };

  // Default selected date to today's local date string
  const [selectedDateStr, setSelectedDateStr] = useState(() => {
    return getLocalDateString();
  });

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const handlePrevMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
  };

  // Generate calendar days grid
  const getCalendarCells = () => {
    const firstDayIndex = new Date(year, month, 1).getDay();
    const totalDays = new Date(year, month + 1, 0).getDate();
    const prevMonthTotalDays = new Date(year, month, 0).getDate();
    
    const cells = [];

    // Prev month padding
    for (let i = firstDayIndex - 1; i >= 0; i--) {
      const dayNum = prevMonthTotalDays - i;
      const date = new Date(year, month - 1, dayNum);
      cells.push({ dayNum, date, isOtherMonth: true });
    }

    // Current month days
    for (let dayNum = 1; dayNum <= totalDays; dayNum++) {
      const date = new Date(year, month, dayNum);
      cells.push({ dayNum, date, isOtherMonth: false });
    }

    // Next month padding to fill grid
    const totalCells = cells.length;
    const nextMonthPadding = (7 - (totalCells % 7)) % 7;
    for (let dayNum = 1; dayNum <= nextMonthPadding; dayNum++) {
      const date = new Date(year, month + 1, dayNum);
      cells.push({ dayNum, date, isOtherMonth: true });
    }

    return cells;
  };

  const cells = getCalendarCells();

  const handleDragStart = (e, aptId) => {
    e.stopPropagation();
    e.dataTransfer.setData('text/plain', aptId);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const handleDrop = (e, targetDateStr) => {
    e.preventDefault();
    const aptId = e.dataTransfer.getData('text/plain');
    if (aptId) {
      updateAppointmentDate(aptId, targetDateStr);
    }
  };

  const selectedDateAppointments = selectedDateStr 
    ? appointments.filter(apt => apt.date === selectedDateStr)
    : [];

  return (
    <div style={{ display: 'flex', gap: '24px', flexWrap: 'wrap', alignItems: 'flex-start' }}>
      
      {/* Left Panel: Compact Calendar Month View */}
      <div 
        style={{
          flex: '1 1 450px',
          minWidth: '320px',
          backgroundColor: '#ffffff',
          borderRadius: '20px',
          border: '1px solid var(--border)',
          boxShadow: '0 4px 20px rgba(0,0,0,0.015)',
          padding: '24px',
          display: 'flex',
          flexDirection: 'column'
        }}
      >
        {/* Header Controls */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <h3 style={{ fontSize: '17px', fontWeight: '850', color: 'var(--text-dark)' }}>
            {monthNames[month]} {year}
          </h3>
          <div style={{ display: 'flex', gap: '8px' }}>
            <button 
              onClick={handlePrevMonth} 
              style={{
                width: '32px',
                height: '32px',
                borderRadius: '8px',
                border: '1px solid var(--border)',
                backgroundColor: 'var(--bg-warm)',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'var(--text-dark)'
              }}
            >
              <i className="fas fa-chevron-left" style={{ fontSize: '11px' }}></i>
            </button>
            <button 
              onClick={handleNextMonth} 
              style={{
                width: '32px',
                height: '32px',
                borderRadius: '8px',
                border: '1px solid var(--border)',
                backgroundColor: 'var(--bg-warm)',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'var(--text-dark)'
              }}
            >
              <i className="fas fa-chevron-right" style={{ fontSize: '11px' }}></i>
            </button>
          </div>
        </div>

        {/* 7 Day Labels */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '6px', marginBottom: '8px', textAlign: 'center' }}>
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(label => (
            <div key={label} style={{ fontSize: '10.5px', fontWeight: '800', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              {label}
            </div>
          ))}
        </div>

        {/* Days Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '6px' }}>
          {cells.map((cell, idx) => {
            const dateStr = cell.date.toISOString().split('T')[0];
            const dayAppointments = appointments.filter(apt => apt.date === dateStr);
            const isSelected = dateStr === selectedDateStr;
            const isToday = getLocalDateString() === dateStr;

            return (
              <div 
                key={idx}
                onClick={() => setSelectedDateStr(dateStr)}
                onDragOver={handleDragOver}
                onDrop={(e) => handleDrop(e, dateStr)}
                style={{
                  height: '46px',
                  backgroundColor: isSelected 
                    ? 'rgba(15, 107, 92, 0.08)' 
                    : isToday 
                    ? 'rgba(15, 107, 92, 0.03)' 
                    : '#ffffff',
                  border: isSelected 
                    ? '2px solid var(--primary)' 
                    : isToday 
                    ? '1px solid var(--primary)' 
                    : '1px solid rgba(18, 33, 30, 0.05)',
                  borderRadius: '10px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  position: 'relative',
                  transition: 'all 0.15s ease',
                }}
              >
                <span style={{ 
                  fontSize: '12px', 
                  fontWeight: isSelected || isToday ? '850' : '600', 
                  color: cell.isOtherMonth 
                    ? 'rgba(30, 42, 40, 0.25)' 
                    : isSelected || isToday 
                    ? 'var(--primary)' 
                    : 'var(--text-dark)' 
                }}>
                  {cell.dayNum}
                </span>

                {/* Event Dot Indicator */}
                {dayAppointments.length > 0 && (
                  <span style={{
                    position: 'absolute',
                    bottom: '5px',
                    width: '5px',
                    height: '5px',
                    borderRadius: '50%',
                    backgroundColor: isSelected ? 'var(--primary)' : 'rgba(15, 107, 92, 0.4)'
                  }}></span>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Right Panel: Selected Day Agenda & Details */}
      <div 
        style={{
          flex: '1 1 350px',
          minWidth: '300px',
          display: 'flex',
          flexDirection: 'column',
          gap: '16px'
        }}
      >
        <div style={{ 
          backgroundColor: '#ffffff', 
          borderRadius: '20px', 
          border: '1px solid var(--border)', 
          boxShadow: '0 4px 20px rgba(0,0,0,0.015)',
          padding: '24px',
          display: 'flex',
          flexDirection: 'column',
          minHeight: '320px'
        }}>
          {/* Agenda Header */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', borderBottom: '1px solid rgba(18, 33, 30, 0.05)', paddingBottom: '12px', marginBottom: '16px' }}>
            <div>
              <span style={{ fontSize: '10px', color: 'var(--text-muted)', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '0.8px' }}>Daily Agenda</span>
              <h4 style={{ fontSize: '15px', fontWeight: '850', color: 'var(--text-dark)', marginTop: '2px' }}>
                {selectedDateStr ? new Date(selectedDateStr).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' }) : 'Select a date'}
              </h4>
            </div>
            <span style={{ fontSize: '11px', fontWeight: '750', padding: '4px 10px', borderRadius: '12px', backgroundColor: 'rgba(15, 107, 92, 0.06)', color: 'var(--primary)' }}>
              {selectedDateAppointments.length} {selectedDateAppointments.length === 1 ? 'Booking' : 'Bookings'}
            </span>
          </div>

          {/* Agenda Appointments List */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', overflowY: 'auto', flexGrow: 1, maxHeight: '340px' }}>
            {selectedDateAppointments.length === 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '40px 12px', color: 'var(--text-muted)', flexGrow: 1 }}>
                <i className="far fa-calendar-times" style={{ fontSize: '28px', color: 'rgba(15, 107, 92, 0.15)', marginBottom: '8px' }}></i>
                <span style={{ fontSize: '12px', fontWeight: '600' }}>No consultations scheduled.</span>
                <button 
                  onClick={() => setIsBookingModalOpen(true)}
                  className="btn btn-primary btn-sm"
                  style={{ marginTop: '14px', fontSize: '11.5px', padding: '6px 12px', borderRadius: '8px' }}
                >
                  <i className="fas fa-plus"></i> Book Consultation
                </button>
              </div>
            ) : (
              selectedDateAppointments.map(apt => (
                <div 
                  key={apt.id}
                  draggable
                  onDragStart={(e) => handleDragStart(e, apt.id)}
                  style={{
                    padding: '14px 16px',
                    backgroundColor: '#F8FAFC',
                    border: '1px solid rgba(18, 33, 30, 0.04)',
                    borderRadius: '12px',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '4px',
                    cursor: 'grab'
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: '13px', fontWeight: '750', color: 'var(--text-dark)' }}>{apt.patientName}</span>
                    <span style={{ fontSize: '11px', fontWeight: '700', color: 'var(--primary)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <i className="far fa-clock"></i> {apt.time}
                    </span>
                  </div>
                  <div style={{ fontSize: '12px', color: 'var(--primary)', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <i className="fas fa-stethoscope"></i> {apt.treatment}
                  </div>
                  {apt.notes && (
                    <div style={{ fontSize: '11px', color: 'var(--text-muted)', borderTop: '1px dashed rgba(18, 33, 30, 0.05)', paddingTop: '4px', marginTop: '2px', fontStyle: 'italic' }}>
                      {apt.notes}
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      </div>
      
    </div>
  );
}
