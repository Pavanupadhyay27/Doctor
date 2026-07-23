-- PostgreSQL Database Schema for Verdant Skin Clinic CRM (Supabase)

-- Drop child tables first to avoid constraint failures
DROP TABLE IF EXISTS appointments CASCADE;
DROP TABLE IF EXISTS patient_documents CASCADE;
DROP TABLE IF EXISTS patient_visits CASCADE;
DROP TABLE IF EXISTS patient_history CASCADE;
DROP TABLE IF EXISTS patients CASCADE;
DROP TABLE IF EXISTS lead_messages CASCADE;
DROP TABLE IF EXISTS lead_notes CASCADE;
DROP TABLE IF EXISTS leads CASCADE;
DROP TABLE IF EXISTS templates CASCADE;
DROP TABLE IF EXISTS treatments CASCADE;
DROP TABLE IF EXISTS users CASCADE;

-- 1. Users Table
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    role TEXT NOT NULL CHECK (role IN ('doctor', 'receptionist', 'marketing')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. Treatments Table
CREATE TABLE treatments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT UNIQUE NOT NULL,
    icon TEXT DEFAULT '',
    short TEXT DEFAULT '',
    who TEXT DEFAULT '',
    steps TEXT[] DEFAULT '{}',
    recovery TEXT DEFAULT '',
    price TEXT DEFAULT '',
    faqs JSONB DEFAULT '[]'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 3. Templates Table
CREATE TABLE templates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    channel TEXT NOT NULL CHECK (channel IN ('Email', 'SMS', 'WhatsApp')),
    subject TEXT DEFAULT '',
    body TEXT NOT NULL,
    image TEXT DEFAULT '',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 4. Leads Table
CREATE TABLE leads (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    phone TEXT NOT NULL,
    email TEXT DEFAULT '',
    treatment_id UUID REFERENCES treatments(id) ON DELETE SET NULL,
    treatment_name TEXT DEFAULT '',
    source TEXT NOT NULL CHECK (source IN ('Website', 'WhatsApp', 'Instagram', 'Referral', 'Walk-in')),
    status TEXT NOT NULL CHECK (status IN ('new', 'contacted', 'booked', 'converted', 'lost')),
    message TEXT DEFAULT '',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Indexing for fast dashboard pipeline queries
CREATE INDEX idx_leads_status ON leads (status);
CREATE INDEX idx_leads_created_at ON leads (created_at);

-- 5. Lead Notes Table (Relation: 1-to-many from leads)
CREATE TABLE lead_notes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    lead_id UUID NOT NULL REFERENCES leads(id) ON DELETE CASCADE,
    text TEXT NOT NULL,
    system BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 6. Lead Messages Table (Relation: 1-to-many from leads)
CREATE TABLE lead_messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    lead_id UUID NOT NULL REFERENCES leads(id) ON DELETE CASCADE,
    channel TEXT NOT NULL CHECK (channel IN ('Email', 'SMS', 'WhatsApp')),
    direction TEXT NOT NULL CHECK (direction IN ('inbound', 'outbound')),
    body TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 7. Patients Table
CREATE TABLE patients (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    lead_id UUID REFERENCES leads(id) ON DELETE SET NULL,
    name TEXT NOT NULL,
    phone TEXT NOT NULL,
    treatment_name TEXT DEFAULT '',
    last_visit TIMESTAMP WITH TIME ZONE,
    next_appt TIMESTAMP WITH TIME ZONE,
    plan TEXT DEFAULT '',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 8. Patient History (Clinical Notes) Table (Relation: 1-to-many from patients)
CREATE TABLE patient_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    patient_id UUID NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
    note TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 9. Patient Visits (Treatment History) Table (Relation: 1-to-many from patients)
CREATE TABLE patient_visits (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    patient_id UUID NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
    date TEXT NOT NULL,
    treatment TEXT DEFAULT '',
    notes TEXT DEFAULT '',
    cost TEXT DEFAULT '',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 10. Patient Documents Table (Relation: 1-to-many from patients)
CREATE TABLE patient_documents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    patient_id UUID NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    size TEXT DEFAULT '',
    date TEXT DEFAULT '',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 11. Appointments Table
CREATE TABLE appointments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    patient_id UUID NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
    patient_name TEXT NOT NULL,
    treatment_name TEXT DEFAULT '',
    date TIMESTAMP WITH TIME ZONE NOT NULL,
    time TEXT NOT NULL,
    status TEXT NOT NULL CHECK (status IN ('booked', 'converted', 'cancelled')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);
