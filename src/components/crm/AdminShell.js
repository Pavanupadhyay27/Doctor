'use client';

import React, { useState, useEffect } from 'react';
import Dashboard from './Dashboard';
import Leads from './Leads';
import Kanban from './Kanban';
import Patients from './Patients';
import Calendar from './Calendar';
import Templates from './Templates';
import Analytics from './Analytics';
import { useCRM } from '@/context/CRMState';

export default function AdminShell({ onViewChange }) {
  const { logout } = useCRM();
  const [activePane, setActivePane] = useState('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  
  // Shared global search term across active panes
  const [searchTerm, setSearchTerm] = useState('');

  // Automatically reset the global search term when switching sidebar views
  useEffect(() => {
    setSearchTerm('');
  }, [activePane]);

  const handleLogout = () => {
    logout();
    onViewChange('public');
  };

  const renderActivePane = () => {
    switch (activePane) {
      case 'dashboard': 
        return <Dashboard onNavigate={setActivePane} />;
      case 'leads': 
        return <Leads globalSearch={searchTerm} setGlobalSearch={setSearchTerm} />;
      case 'kanban': 
        return <Kanban globalSearch={searchTerm} setGlobalSearch={setSearchTerm} />;
      case 'patients': 
        return <Patients globalSearch={searchTerm} setGlobalSearch={setSearchTerm} />;
      case 'calendar': 
        return <Calendar />;
      case 'templates': 
        return <Templates />;
      case 'analytics': 
        return <Analytics />;
      default: 
        return <Dashboard onNavigate={setActivePane} />;
    }
  };

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: 'fas fa-th-large' },
    { id: 'leads', label: 'Leads List', icon: 'fas fa-user-tag' },
    { id: 'kanban', label: 'Kanban Board', icon: 'fas fa-columns' },
    { id: 'patients', label: 'Patients Directory', icon: 'fas fa-user-injured' },
    { id: 'calendar', label: 'Appointments', icon: 'fas fa-calendar-alt' },
    { id: 'templates', label: 'Message Templates', icon: 'fas fa-envelope-open-text' },
    { id: 'analytics', label: 'CRM Analytics', icon: 'fas fa-chart-line' }
  ];

  return (
    <div className={`admin-shell w-full min-h-screen flex ${sidebarCollapsed ? 'sidebar-collapsed' : ''}`}>
      {/* Sidebar Left Navigation */}
      <aside className={`admin-sidebar ${sidebarOpen ? 'open' : ''}`}>
        <div className="admin-sidebar-header" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          {!sidebarCollapsed ? (
            <a href="#" className="admin-logo">
              Aura CRM<span className="admin-logo-dot"></span>
            </a>
          ) : (
            <a href="#" className="admin-logo" style={{ justifyContent: 'center', width: '100%' }}>
              A<span className="admin-logo-dot"></span>
            </a>
          )}
          
          <button 
            onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
            className="sidebar-collapse-toggle hidden md:flex"
            style={{
              background: 'none',
              border: 'none',
              color: 'rgba(255, 255, 255, 0.4)',
              cursor: 'pointer',
              padding: '4px',
              outline: 'none',
              fontSize: '15px',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'color 0.2s ease'
            }}
            onMouseEnter={(e) => e.currentTarget.style.color = '#ffffff'}
            onMouseLeave={(e) => e.currentTarget.style.color = 'rgba(255, 255, 255, 0.4)'}
            title={sidebarCollapsed ? "Expand Sidebar" : "Collapse Sidebar"}
          >
            <i className={`fas ${sidebarCollapsed ? 'fa-indent' : 'fa-outdent'}`}></i>
          </button>
        </div>

        <nav className="admin-nav">
          {navItems.map(item => (
            <div 
              key={item.id} 
              className={`admin-nav-item ${activePane === item.id ? 'active' : ''}`}
              onClick={() => {
                setActivePane(item.id);
                setSidebarOpen(false);
              }}
              title={sidebarCollapsed ? item.label : ""}
              style={sidebarCollapsed ? { justifyContent: 'center', padding: '14px 0', borderLeft: 'none' } : {}}
            >
              <i className={item.icon} style={sidebarCollapsed ? { margin: 0, fontSize: '16px' } : {}}></i>
              {!sidebarCollapsed && <span>{item.label}</span>}
            </div>
          ))}
        </nav>

        <div className="admin-sidebar-footer" style={{ display: 'flex', alignItems: 'center', justifyContent: sidebarCollapsed ? 'center' : 'space-between', width: '100%', padding: sidebarCollapsed ? '16px 0' : '24px 20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', justifyContent: 'center' }}>
            <div className="admin-avatar">AS</div>
            {!sidebarCollapsed && (
              <div className="admin-user-info">
                <span className="admin-username">Dr. Ananya Sharma</span>
                <span className="admin-role">Clinic Admin (Full)</span>
              </div>
            )}
          </div>
          {!sidebarCollapsed && (
            <button 
              onClick={handleLogout}
              style={{ background: 'none', border: 'none', color: 'rgba(255, 255, 255, 0.4)', cursor: 'pointer', padding: '4px' }}
              onMouseEnter={(e) => e.currentTarget.style.color = '#ffffff'}
              onMouseLeave={(e) => e.currentTarget.style.color = 'rgba(255, 255, 255, 0.4)'}
              title="Sign Out"
            >
              <i className="fas fa-sign-out-alt" style={{ fontSize: '16px' }}></i>
            </button>
          )}
        </div>
      </aside>

      {/* Main Workspace */}
      <main className="admin-main flex-grow flex flex-col min-h-screen">
        {/* Top Navbar */}
        <header className="admin-header">
          <div className="admin-title-area">
            <button 
              onClick={() => setSidebarOpen(!sidebarOpen)} 
              className="admin-mobile-toggle"
              style={{ background: 'none', border: 'none', cursor: 'pointer' }}
            >
              <i className="fas fa-bars"></i>
            </button>
            <h2 className="admin-header-title capitalize" style={{ fontSize: '20px', fontWeight: '800', color: 'var(--text-dark)', fontFamily: 'var(--font-heading)', letterSpacing: '-0.5px' }}>
              {activePane.replace('-', ' ')}
            </h2>
          </div>
          
          <div className="admin-actions flex items-center gap-6">
            {/* Functional search bar */}
            {(activePane === 'leads' || activePane === 'patients' || activePane === 'kanban') && (
              <div className="admin-search-wrapper hidden md:block">
                <i className="fas fa-search"></i>
                <input 
                  type="text" 
                  className="admin-search-input" 
                  placeholder="Search active view..." 
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            )}
            <button className="admin-notifications-btn relative" style={{ background: 'none', border: 'none' }}>
              <i className="far fa-bell"></i>
              <span 
                style={{ 
                  position: 'absolute', 
                  top: '-2px', 
                  right: '-2px', 
                  width: '6px', 
                  height: '6px', 
                  borderRadius: '50%', 
                  backgroundColor: 'var(--accent)' 
                }}
              ></span>
            </button>
            <button onClick={() => onViewChange('public')} className="admin-website-btn">
              <i className="fas fa-globe"></i> View Website
            </button>
          </div>
        </header>

        {/* Dynamic Pane Canvas */}
        <div className="admin-content flex-grow">
          <div className="admin-body">
            {renderActivePane()}
          </div>
        </div>
      </main>
    </div>
  );
}
