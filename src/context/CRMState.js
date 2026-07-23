'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';

const CRMContext = createContext();

// Simple in-memory Event Emitter pattern for asynchronous notifications
class EventEmitter {
  constructor() {
    this.events = {};
  }
  on(event, listener) {
    if (!this.events[event]) this.events[event] = [];
    this.events[event].push(listener);
    return () => this.off(event, listener);
  }
  off(event, listener) {
    if (!this.events[event]) return;
    this.events[event] = this.events[event].filter(l => l !== listener);
  }
  emit(event, data) {
    if (!this.events[event]) return;
    this.events[event].forEach(listener => {
      try {
        listener(data);
      } catch (err) {
        console.error('Emitter listener error:', err);
      }
    });
  }
}

const stateEmitter = new EventEmitter();

// Base API Configuration - editable via environment variables
const BASE_API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

const MOCK_TREATMENTS = [
  { id: 'laser', name: 'Laser Skin Resurfacing', duration: '45 mins', price: '$250 - $600', recovery: '3-5 days' },
  { id: 'botox', name: 'Botox & Dermal Fillers', duration: '30 mins', price: '$350 - $800', recovery: 'None' },
  { id: 'peel', name: 'Chemical Peels', duration: '45 mins', price: '$120 - $250', recovery: '1-2 days' },
  { id: 'acne', name: 'Advanced Acne Therapy', duration: '60 mins', price: '$99 - $180', recovery: 'None' }
];

// Data normalizers for Supabase column mapping compatibility
const mapLead = (lead) => {
  if (!lead) return lead;
  return {
    ...lead,
    treatment: lead.treatment || lead.treatment_name || 'General Consultation',
    date: lead.date || (lead.created_at ? lead.created_at.split('T')[0] : '')
  };
};

const mapPatient = (patient) => {
  if (!patient) return patient;
  return {
    ...patient,
    treatmentPlan: patient.treatmentPlan || patient.plan || 'Consulted. Plan pending.'
  };
};

const mapAppointment = (appointment) => {
  if (!appointment) return appointment;
  return {
    ...appointment,
    treatment: appointment.treatment || appointment.treatment_name || 'Skin Treatment'
  };
};

export function CRMProvider({ children }) {
  const [leads, setLeads] = useState([]);
  const [patients, setPatients] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [templates, setTemplates] = useState([]);
  const [loading, setLoading] = useState(true);

  // Modals & Navigation helpers
  const [activeModalTreatmentId, setActiveModalTreatmentId] = useState(null);
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);

  // Authentication state
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Expose Event Emitter methods on State Context
  const on = (event, callback) => stateEmitter.on(event, callback);
  const emit = (event, data) => stateEmitter.emit(event, data);

  // Centralized HTTP fetchWrapper with Bearer Auth Injection & automatic 401 gate expiration
  const fetchWrapper = async (endpoint, options = {}) => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('aura_crm_token') : null;
    const headers = {
      'Content-Type': 'application/json',
      ...(options.headers || {}),
    };

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const url = endpoint.startsWith('http') ? endpoint : `${BASE_API_URL}${endpoint}`;

    try {
      const res = await fetch(url, {
        ...options,
        headers,
      });

      if (res.status === 401) {
        // Automatic session expiration (JWT invalid or expired)
        setUser(null);
        setIsAuthenticated(false);
        if (typeof window !== 'undefined') {
          localStorage.removeItem('aura_crm_token');
          localStorage.removeItem('aura_crm_user');
          if (window.location.hash) {
            window.location.hash = '/admin/login';
          } else {
            window.location.href = '/';
          }
        }
        throw new Error('Unauthorized - Session expired');
      }

      return res;
    } catch (err) {
      console.error(`fetchWrapper failed on [${endpoint}]:`, err.message);
      throw err;
    }
  };

  // Helper to load master CRM state
  const loadData = async (tokenVal) => {
    try {
      const token = tokenVal || localStorage.getItem('aura_crm_token');
      if (!token) {
        setLoading(false);
        return;
      }

      const res = await fetch(`${BASE_API_URL}/crm`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (res.status === 401) {
        logout();
        return;
      }

      const data = await res.json();
      if (data.success) {
        setLeads((data.leads || []).map(mapLead));
        setPatients((data.patients || []).map(mapPatient));
        setAppointments((data.appointments || []).map(mapAppointment));
        setTemplates(data.templates || []);
        emit('change', { type: 'crm_bootstrap', action: 'load' });
      }
    } catch (err) {
      console.error('Failed to load CRM data from API:', err);
    } finally {
      setLoading(false);
    }
  };

  // Load user session on mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedUser = localStorage.getItem('aura_crm_user');
      const savedToken = localStorage.getItem('aura_crm_token');
      if (savedUser && savedToken) {
        setUser(JSON.parse(savedUser));
        setIsAuthenticated(true);
        loadData(savedToken);
      } else {
        setLoading(false);
      }
    }
  }, []);

  // Authentication API calls
  const login = async (email, password) => {
    try {
      const res = await fetch(`${BASE_API_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      const data = await res.json();
      
      if (data.success && data.token) {
        setUser(data.user);
        setIsAuthenticated(true);
        localStorage.setItem('aura_crm_token', data.token);
        localStorage.setItem('aura_crm_user', JSON.stringify(data.user));
        
        setLoading(true);
        await loadData(data.token);
        emit('change', { type: 'auth', action: 'login', user: data.user });
        return true;
      }
      return false;
    } catch (err) {
      console.error('API Login failed:', err);
      return false;
    }
  };

  const logout = () => {
    setUser(null);
    setIsAuthenticated(false);
    localStorage.removeItem('aura_crm_token');
    localStorage.removeItem('aura_crm_user');
    setLeads([]);
    setPatients([]);
    setAppointments([]);
    setTemplates([]);
    emit('change', { type: 'auth', action: 'logout' });
    if (typeof window !== 'undefined') {
      if (window.location.hash) {
        window.location.hash = '/admin/login';
      } else {
        window.location.href = '/';
      }
    }
  };

  // Lead Actions
  const addLead = async (leadData) => {
    try {
      const res = await fetch(`${BASE_API_URL}/leads`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(leadData)
      });
      const data = await res.json();
      if (data.success) {
        const normalizedLead = mapLead(data.lead);
        setLeads(prev => [normalizedLead, ...prev]);
        emit('change', { type: 'leads', action: 'create', lead: normalizedLead });
        return normalizedLead;
      }
    } catch (err) {
      console.error('Error adding lead:', err);
    }
  };

  const updateLeadStatus = async (leadId, status) => {
    try {
      const res = await fetchWrapper(`/leads/${leadId}`, {
        method: 'PUT',
        body: JSON.stringify({ action: 'update_status', status })
      });
      const data = await res.json();
      if (data.success) {
        const normalizedLead = mapLead(data.lead);
        setLeads(prev => prev.map(l => l.id === leadId || l._id === leadId ? normalizedLead : l));
        
        if (data.patient) {
          const normalizedPatient = mapPatient(data.patient);
          setPatients(prev => {
            const exists = prev.some(p => p.id === normalizedPatient.id || p._id === normalizedPatient.id);
            return exists 
              ? prev.map(p => p.id === normalizedPatient.id || p._id === normalizedPatient.id ? normalizedPatient : p) 
              : [normalizedPatient, ...prev];
          });
        }
        emit('change', { type: 'leads', action: 'update_status', lead: normalizedLead });
      }
    } catch (err) {
      console.error('Error updating status:', err);
    }
  };

  const addLeadNote = async (leadId, text, author) => {
    try {
      const res = await fetchWrapper(`/leads/${leadId}`, {
        method: 'PUT',
        body: JSON.stringify({ action: 'add_note', text, author })
      });
      const data = await res.json();
      if (data.success) {
        const normalizedLead = mapLead(data.lead);
        setLeads(prev => prev.map(l => l.id === leadId || l._id === leadId ? normalizedLead : l));
        emit('change', { type: 'leads', action: 'add_note', lead: normalizedLead });
      }
    } catch (err) {
      console.error('Error adding lead note:', err);
    }
  };

  const saveLeadNotesContent = async (leadId, notesContent) => {
    try {
      const res = await fetchWrapper(`/leads/${leadId}`, {
        method: 'PUT',
        body: JSON.stringify({ action: 'save_notes_content', notesContent })
      });
      const data = await res.json();
      if (data.success) {
        const normalizedLead = mapLead(data.lead);
        setLeads(prev => prev.map(l => l.id === leadId || l._id === leadId ? normalizedLead : l));
        emit('change', { type: 'leads', action: 'save_notes_content', lead: normalizedLead });
      }
    } catch (err) {
      console.error('Error saving lead notes content:', err);
    }
  };

  const deleteLead = async (leadId) => {
    try {
      const res = await fetchWrapper(`/leads/${leadId}`, {
        method: 'DELETE'
      });
      const data = await res.json();
      if (data.success) {
        setLeads(prev => prev.filter(l => l.id !== leadId && l._id !== leadId));
        emit('change', { type: 'leads', action: 'delete', leadId });
        return true;
      }
    } catch (err) {
      console.error('Error deleting lead:', err);
    }
    return false;
  };

  // Patient Actions
  const addPatientVisit = async (patientId, visitData) => {
    try {
      const res = await fetchWrapper(`/patients/${patientId}`, {
        method: 'PUT',
        body: JSON.stringify({ action: 'add_visit', visitData })
      });
      const data = await res.json();
      if (data.success) {
        const normalizedPatient = mapPatient(data.patient);
        setPatients(prev => prev.map(p => p.id === patientId || p._id === patientId ? normalizedPatient : p));
        emit('change', { type: 'patients', action: 'add_visit', patient: normalizedPatient });
      }
    } catch (err) {
      console.error('Error adding patient visit:', err);
    }
  };

  const updatePatientFields = async (patientId, fields) => {
    try {
      const res = await fetchWrapper(`/patients/${patientId}`, {
        method: 'PUT',
        body: JSON.stringify({ action: 'update_fields', fields })
      });
      const data = await res.json();
      if (data.success) {
        const normalizedPatient = mapPatient(data.patient);
        setPatients(prev => prev.map(p => p.id === patientId || p._id === patientId ? normalizedPatient : p));
        emit('change', { type: 'patients', action: 'update_fields', patient: normalizedPatient });
      }
    } catch (err) {
      console.error('Error updating patient fields:', err);
    }
  };

  const addPatientDocument = async (patientId, docName) => {
    try {
      const res = await fetchWrapper(`/patients/${patientId}`, {
        method: 'PUT',
        body: JSON.stringify({ action: 'add_document', docName })
      });
      const data = await res.json();
      if (data.success) {
        const normalizedPatient = mapPatient(data.patient);
        setPatients(prev => prev.map(p => p.id === patientId || p._id === patientId ? normalizedPatient : p));
        emit('change', { type: 'patients', action: 'add_document', patient: normalizedPatient });
      }
    } catch (err) {
      console.error('Error uploading patient doc:', err);
    }
  };

  // Appointment Actions
  const addAppointment = async (aptData) => {
    try {
      const res = await fetchWrapper('/appointments', {
        method: 'POST',
        body: JSON.stringify(aptData)
      });
      const data = await res.json();
      if (data.success) {
        const normalizedApt = mapAppointment(data.appointment);
        setAppointments(prev => [...prev, normalizedApt]);
        emit('change', { type: 'appointments', action: 'create', appointment: normalizedApt });
        return normalizedApt;
      }
    } catch (err) {
      console.error('Error scheduling appointment:', err);
    }
  };

  const updateAppointmentDate = async (aptId, newDate) => {
    try {
      const res = await fetchWrapper(`/appointments/${aptId}`, {
        method: 'PATCH',
        body: JSON.stringify({ date: newDate })
      });
      const data = await res.json();
      if (data.success) {
        const normalizedApt = mapAppointment(data.appointment);
        setAppointments(prev => prev.map(a => a.id === aptId || a._id === aptId ? normalizedApt : a));
        
        await loadData();
        emit('change', { type: 'appointments', action: 'reschedule', appointment: normalizedApt });
      }
    } catch (err) {
      console.error('Error rescheduling appointment:', err);
    }
  };

  // Template Actions
  const saveTemplate = async (tmplId, updatedFields) => {
    try {
      const res = await fetchWrapper(`/templates/${tmplId}`, {
        method: 'PUT',
        body: JSON.stringify(updatedFields)
      });
      const data = await res.json();
      if (data.success) {
        setTemplates(prev => prev.map(t => t.id === tmplId || t._id === tmplId ? data.template : t));
        emit('change', { type: 'templates', action: 'update', template: data.template });
      }
    } catch (err) {
      console.error('Error saving template:', err);
    }
  };

  return (
    <CRMContext.Provider value={{
      leads,
      patients,
      appointments,
      templates,
      treatments: MOCK_TREATMENTS,
      loading,
      user,
      isAuthenticated,
      on,
      emit,
      login,
      logout,
      activeModalTreatmentId,
      setActiveModalTreatmentId,
      isBookingModalOpen,
      setIsBookingModalOpen,
      addLead,
      updateLeadStatus,
      addLeadNote,
      saveLeadNotesContent,
      deleteLead,
      addAppointment,
      updateAppointmentDate,
      addPatientVisit,
      updatePatientFields,
      addPatientDocument,
      saveTemplate
    }}>
      {children}
    </CRMContext.Provider>
  );
}

export function useCRM() {
  const context = useContext(CRMContext);
  if (!context) {
    throw new Error('useCRM must be used within a CRMProvider');
  }
  return context;
}
