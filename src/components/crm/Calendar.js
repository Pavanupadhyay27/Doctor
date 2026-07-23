'use client';

import React, { useState } from 'react';
import { useCRM } from '@/context/CRMState';

export default function Calendar() {
  const { appointments, leads, updateAppointmentDate } = useCRM();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDateStr, setSelectedDateStr] = useState(null);

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
    <div className="calendar-wrapper">
      {/* Header controls */}
      <div 
        style={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center', 
          marginBottom: '24px',
          background: '#ffffff',
          padding: '16px 24px',
          borderRadius: '16px',
          border: '1px solid rgba(18, 33, 30, 0.05)',
          boxShadow: '0 4px 12px rgba(18, 33, 30, 0.02)'
        }}
      >
        <h3 style={{ fontSize: '18px', fontWeight: '800', color: 'var(--text-dark)' }}>
          {monthNames[month]} {year}
        </h3>
        <div style={{ display: 'flex', gap: '10px' }}>
          <button 
            onClick={handlePrevMonth} 
            className="btn btn-outline"
            style={{ padding: '8px 14px', fontSize: '12.5px' }}
          >
            <i className="fas fa-chevron-left"></i> Prev
          </button>
          <button 
            onClick={handleNextMonth} 
            className="btn btn-outline"
            style={{ padding: '8px 14px', fontSize: '12.5px' }}
          >
            Next <i className="fas fa-chevron-right"></i>
          </button>
        </div>
      </div>
      
      {/* 7 Day Labels */}
      <div className="calendar-grid-labels" style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '8px', marginBottom: '8px', textAlign: 'center' }}>
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(label => (
          <div key={label} style={{ fontSize: '11px', fontWeight: '800', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
            {label}
          </div>
        ))}
      </div>

      {/* Days Grid */}
      <div className="calendar-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '8px' }}>
        {cells.map((cell, idx) => {
          const dateStr = cell.date.toISOString().split('T')[0];
          const dayAppointments = appointments.filter(apt => apt.date === dateStr);

          return (
            <div 
              key={idx} 
              className={`calendar-cell ${cell.isOtherMonth ? 'other-month' : ''} ${dayAppointments.length > 0 ? 'has-events' : ''}`}
              onDragOver={handleDragOver}
              onDrop={(e) => handleDrop(e, dateStr)}
              onClick={() => setSelectedDateStr(dateStr)}
              style={{
                minHeight: '76px', /* Reduced size */
                backgroundColor: '#ffffff',
                border: '1px solid rgba(18, 33, 30, 0.05)',
                borderBottom: '3px solid rgba(15, 107, 92, 0.06)', /* 3D Style cell */
                borderRadius: '12px',
                padding: '8px',
                display: 'flex',
                flexDirection: 'column',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                position: 'relative'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-2px) scale(1.01)';
                e.currentTarget.style.borderBottomColor = 'var(--primary)';
                e.currentTarget.style.boxShadow = '0 6px 14px rgba(18, 33, 30, 0.04)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0) scale(1)';
                e.currentTarget.style.borderBottomColor = 'rgba(15, 107, 92, 0.06)';
                e.currentTarget.style.boxShadow = 'none';
              }}
            >
              <span style={{ fontSize: '11px', fontWeight: '800', color: cell.isOtherMonth ? 'rgba(30, 42, 40, 0.3)' : 'var(--text-dark)' }}>
                {cell.dayNum}
              </span>
              
              {/* Event indicators dots/mini-badges */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '3px', marginTop: '6px', overflow: 'hidden' }}>
                {dayAppointments.slice(0, 2).map(apt => (
                  <div 
                    key={apt.id}
                    draggable
                    onDragStart={(e) => handleDragStart(e, apt.id)}
                    style={{
                      padding: '2px 5px',
                      fontSize: '9.5px',
                      fontWeight: '700',
                      borderRadius: '4px',
                      backgroundColor: 'rgba(15, 107, 92, 0.05)',
                      color: 'var(--primary)',
                      border: '1px solid rgba(15, 107, 92, 0.1)',
                      whiteSpace: 'nowrap',
                      textOverflow: 'ellipsis',
                      overflow: 'hidden'
                    }}
                    title={`${apt.time} - ${apt.patientName}`}
                  >
                    {apt.time} {apt.patientName.split(' ')[0]}
                  </div>
                ))}
                {dayAppointments.length > 2 && (
                  <div style={{ fontSize: '9px', fontWeight: '750', color: 'var(--text-muted)', textAlign: 'center' }}>
                    +{dayAppointments.length - 2} more
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Date Details Modal Popover */}
      {selectedDateStr && (
        <div 
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(10, 22, 20, 0.4)',
            backdropFilter: 'blur(5px)',
            zIndex: 1100,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '20px'
          }}
          onClick={() => setSelectedDateStr(null)}
        >
          {/* 3D modal card */}
          <div 
            style={{
              width: '100%',
              maxWidth: '480px',
              backgroundColor: '#ffffff',
              borderRadius: '24px',
              border: '1px solid rgba(15, 107, 92, 0.08)',
              borderBottom: '6px solid var(--primary)', /* 3D bevel */
              boxShadow: '0 25px 60px -10px rgba(18, 33, 30, 0.15)',
              padding: '28px',
              position: 'relative',
              animation: 'modalSlideIn 0.3s cubic-bezier(0.16, 1, 0.3, 1)'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', borderBottom: '1px solid rgba(18, 33, 30, 0.05)', paddingBottom: '14px' }}>
              <div>
                <span style={{ fontSize: '10px', color: 'var(--text-muted)', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '0.8px' }}>Daily Schedule</span>
                <h4 style={{ fontSize: '16.5px', fontWeight: '850', color: 'var(--text-dark)', marginTop: '2px' }}>
                  {new Date(selectedDateStr).toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric', year: 'numeric' })}
                </h4>
              </div>
              <button 
                onClick={() => setSelectedDateStr(null)}
                style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: '50%',
                  backgroundColor: '#F4F6F7',
                  border: 'none',
                  color: 'var(--text-muted)',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                <i className="fas fa-times"></i>
              </button>
            </div>

            {selectedDateAppointments.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '36px 12px', color: 'var(--text-muted)' }}>
                <i className="far fa-calendar-times" style={{ fontSize: '32px', color: 'rgba(15, 107, 92, 0.15)', marginBottom: '12px', display: 'block' }}></i>
                <span style={{ fontSize: '13px' }}>No consultations scheduled on this date.</span>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', maxHeight: '300px', overflowY: 'auto', paddingRight: '4px' }}>
                {selectedDateAppointments.map(apt => {
                  const lead = leads.find(l => l.id === apt.leadId);
                  const status = lead ? lead.status : 'New';

                  return (
                    <div 
                      key={apt.id}
                      style={{
                        padding: '16px',
                        backgroundColor: '#F4F6F7',
                        border: '1px solid rgba(18, 33, 30, 0.04)',
                        borderBottom: '3px solid rgba(15, 107, 92, 0.1)', /* Mini 3D bevel */
                        borderRadius: '16px',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '6px'
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ fontSize: '13px', fontWeight: '750', color: 'var(--text-dark)' }}>{apt.patientName}</span>
                        <span style={{ fontSize: '11px', fontWeight: '700', padding: '2px 8px', borderRadius: '20px', backgroundColor: 'rgba(15, 107, 92, 0.06)', color: 'var(--primary)' }}>
                          {apt.time}
                        </span>
                      </div>
                      <div style={{ fontSize: '12.5px', color: 'var(--primary)', fontWeight: '600' }}>
                        <i className="fas fa-stethoscope" style={{ fontSize: '11px', marginRight: '6px' }}></i> {apt.treatment}
                      </div>
                      {apt.notes && (
                        <div style={{ fontSize: '11.5px', color: 'var(--text-muted)', fontStyle: 'italic', borderTop: '1px dashed rgba(18, 33, 30, 0.06)', paddingTop: '6px', marginTop: '2px' }}>
                          Note: {apt.notes}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
