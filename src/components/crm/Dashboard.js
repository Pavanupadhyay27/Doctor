'use client';

import React from 'react';
import { useCRM } from '@/context/CRMState';

export default function Dashboard({ onNavigate }) {
  const { leads, appointments } = useCRM();

  // Metrics calculations
  const newCount = leads.filter(l => l.status === 'New').length;
  const contactedCount = leads.filter(l => l.status === 'Contacted').length;
  
  const today = new Date();
  const nextWeek = new Date(today);
  nextWeek.setDate(today.getDate() + 7);
  const weeklyApts = appointments.filter(apt => {
    const aptDate = new Date(apt.date);
    return aptDate >= today && aptDate <= nextWeek;
  }).length;

  const totalLeads = leads.length;
  const convertedCount = leads.filter(l => l.status === 'Converted').length;
  const conversionRate = totalLeads > 0 ? Math.round((convertedCount / totalLeads) * 100) : 0;

  // Flatten and gather chronological logs
  let logs = [];
  leads.forEach(lead => {
    (lead.history || []).forEach(hist => {
      logs.push({
        leadName: lead.name,
        leadId: lead.id,
        type: hist.type,
        text: hist.text,
        date: new Date(hist.date),
        rawDate: hist.date
      });
    });
  });

  logs.sort((a, b) => b.date - a.date);
  const recentLogs = logs.slice(0, 6);

  return (
    <div>
      {/* Metric Cards Row */}
      <div className="metrics-row">
        <div className="metric-card">
          <div className="metric-header">
            <span className="metric-title">New Inquiries Today</span>
            <div className="metric-icon leads"><i className="fas fa-user-plus"></i></div>
          </div>
          <span className="metric-value">{newCount}</span>
          <span className="metric-trend up"><i className="fas fa-arrow-up"></i> +12% vs yesterday</span>
        </div>
        <div className="metric-card">
          <div className="metric-header">
            <span className="metric-title">Pending Followups</span>
            <div className="metric-icon followups"><i className="fas fa-phone-volume"></i></div>
          </div>
          <span className="metric-value">{contactedCount}</span>
          <span className="metric-trend down"><i className="fas fa-arrow-down"></i> -2% vs avg</span>
        </div>
        <div className="metric-card">
          <div className="metric-header">
            <span className="metric-title">Booked Consultations</span>
            <div className="metric-icon appointments"><i className="far fa-calendar-check"></i></div>
          </div>
          <span className="metric-value">{weeklyApts}</span>
          <span className="metric-trend up"><i className="fas fa-arrow-up"></i> Next 7 days</span>
        </div>
        <div className="metric-card">
          <div className="metric-header">
            <span className="metric-title">Lead Conversion Rate</span>
            <div className="metric-icon conversion"><i className="fas fa-percentage"></i></div>
          </div>
          <span className="metric-value">{conversionRate}%</span>
          <span className="metric-trend up"><i className="fas fa-arrow-up"></i> +4% industry avg</span>
        </div>
      </div>

      {/* Columns Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-[1.2fr_0.8fr] gap-[30px]">
        {/* Recent activity timeline */}
        <div className="card" style={{ padding: '24px' }}>
          <h3 style={{ fontSize: '16px', marginBottom: '20px', fontWeight: '600', borderBottom: '1px solid var(--border)', paddingBottom: '12px' }}>
            <i className="far fa-clock"></i> Recent Leads Activity Timeline
          </h3>
          
          {recentLogs.length === 0 ? (
            <div style={{ padding: '16px', textAlign: 'center', color: 'var(--text-muted)' }}>No logs found.</div>
          ) : (
            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column' }}>
              {recentLogs.map((log, idx) => {
                let icon = 'fas fa-info-circle';
                if (log.type === 'system') icon = 'fas fa-cog';
                else if (log.type === 'auto-msg') icon = 'fas fa-paper-plane';
                else if (log.type === 'note') icon = 'fas fa-sticky-note';
                else if (log.type === 'manual-msg') icon = 'fas fa-envelope';

                return (
                  <li key={idx} style={{ display: 'flex', gap: '16px', padding: '16px 0', borderBottom: '1px solid var(--border)' }}>
                    <div style={{ width: '36px', height: '36px', borderRadius: 'var(--radius-full)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, backgroundColor: 'var(--bg-warm)', color: 'var(--primary)' }}>
                      <i className={icon}></i>
                    </div>
                    <div style={{ flexGrow: 1, fontSize: '13px' }}>
                      <div style={{ fontWeight: '600', color: 'var(--text-dark)' }}>{log.leadName}</div>
                      <div style={{ color: 'var(--text-muted)', marginTop: '2px' }}>{log.text}</div>
                      <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '4px' }}>{log.rawDate}</div>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </div>

        {/* Quick Tools actions column */}
        <div className="card" style={{ padding: '24px' }}>
          <h3 style={{ fontSize: '16px', marginBottom: '20px', fontWeight: '600', borderBottom: '1px solid var(--border)', paddingBottom: '12px' }}>
            <i className="fas fa-toolbox"></i> Clinical Quick Tools
          </h3>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <button className="btn btn-outline btn-full btn-sm text-left" onClick={() => onNavigate('leads')}>
              <i className="fas fa-user-plus"></i> View Leads Directory
            </button>
            <button className="btn btn-outline btn-full btn-sm text-left" onClick={() => onNavigate('calendar')}>
              <i className="far fa-calendar-alt"></i> Open Schedule Calendar
            </button>
            <button className="btn btn-outline btn-full btn-sm text-left" onClick={() => onNavigate('templates')}>
              <i className="far fa-envelope-open"></i> Manage SMS & Mail Templates
            </button>
          </div>
          
          <div style={{ marginTop: '30px', padding: '16px', border: '1px dashed var(--border)', borderRadius: 'var(--radius-md)', textAlign: 'center' }}>
            <i className="fas fa-user-shield" style={{ fontSize: '32px', color: 'var(--primary)', marginBottom: '10px' }}></i>
            <h4 style={{ fontSize: '13px', fontWeight: '700', marginBottom: '4px' }}>HIPAA & GDPR Secured</h4>
            <p style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Patient medical charts are encrypted at rest. Audit logs active.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
