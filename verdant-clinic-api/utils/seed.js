require('dotenv').config({ path: require('path').join(__dirname, '../.env') });
const fs = require('fs');
const path = require('path');
const bcrypt = require('bcryptjs');
const supabase = require('../config/supabase');

const SEED_TREATMENTS = [
  {
    name: 'Laser Skin Resurfacing',
    icon: 'fa-laser-blast',
    short: 'Laser skin rejuvenation for scars and wrinkles.',
    who: 'Ideal for patients with acne scarring, deep wrinkles, or age spots.',
    steps: ['Clinical cleansing', 'Topical numbing gel application', 'Laser resurfacing pass', 'Post-procedure soothing serum'],
    recovery: '3-5 days',
    price: '$250 - $600',
    faqs: [
      { q: 'Is the procedure painful?', a: 'Discomfort is minimized by applying a strong topical anesthetic prior to treatment.' },
      { q: 'How many sessions are required?', a: 'Most patients see significant improvement in 1-3 sessions.' }
    ]
  },
  {
    name: 'Botox & Dermal Fillers',
    icon: 'fa-syringe',
    short: 'Wrinkle relaxation and facial facial volume.',
    who: 'Ideal for patients seeking to smooth dynamic expression lines or restore volume to lips/cheeks.',
    steps: ['Facial muscle assessment', 'Target marking', 'Micro-injections of Botox/Filler', 'Gentle cooling wrap'],
    recovery: 'None',
    price: '$350 - $800',
    faqs: [
      { q: 'How long does Botox last?', a: 'Results typical persist for 3-4 months before requiring maintenance.' }
    ]
  },
  {
    name: 'Chemical Peels',
    icon: 'fa-sparkles',
    short: 'Advanced skin exfoliation and tone evening.',
    who: 'Best for patients with active acne, hyperpigmentation, or dull texture.',
    steps: ['Double cleanse prep', 'Peel solution application', 'Neutralizing wash', 'Hydrating sunscreen finish'],
    recovery: '1-2 days',
    price: '$120 - $250',
    faqs: [
      { q: 'Will my skin visibly peel?', a: 'Mild to moderate flaking is normal, starting around day 3 after application.' }
    ]
  },
  {
    name: 'Advanced Acne Therapy',
    icon: 'fa-hand-holding-medical',
    short: 'Comprehensive treatment for active acne breakouts.',
    who: 'Designed for patients suffering from persistent inflammatory or cystic acne.',
    steps: ['Deep pore extraction', 'Salicylic acid solution application', 'Blue LED light therapy session', 'Barrier repair moisturizer'],
    recovery: 'None',
    price: '$99 - $180',
    faqs: [
      { q: 'Can I wear makeup after therapy?', a: 'It is recommended to wait 24 hours to let the skin barrier heal.' }
    ]
  }
];

const SEED_TEMPLATES = [
  {
    name: 'Standard Welcome Greeting',
    channel: 'WhatsApp',
    subject: '',
    body: 'Hi {{PatientName}}! 👋\n\nThank you for reaching out to Aura Dermatology! We have received your inquiry regarding {{TreatmentInterested}}.\n\nDr. Sharma and our care team will contact you shortly to schedule your consultation.\n\nWarm regards,\nThe Aura Care Team',
    image: 'https://images.unsplash.com/photo-1579684389782-64d84b5e901d?q=80&w=600'
  },
  {
    name: 'Laser Resurfacing Welcome',
    channel: 'Email',
    subject: 'Your Laser Consultation at Aura Dermatology',
    body: 'Dear {{PatientName}},\n\nThank you for requesting information on {{TreatmentInterested}}. We are excited to guide you on your skin rejuvenation journey.\n\nHere is what you can expect during your consultation:\n- A detailed scan using our Visia Skin Analysis tool.\n- A customized treatment schedule based on your recovery availability.\n\nOur team will call you within 24 hours.\n\nSincerely,\nDr. Ananya Sharma, MD\nAura Dermatology & Aesthetics',
    image: ''
  },
  {
    name: 'Appointment Reminder',
    channel: 'SMS',
    subject: '',
    body: 'Hi {{PatientName}}, this is Aura Dermatology. Reminder for your upcoming consultation on {{AppointmentDate}} at {{AppointmentTime}}. Reply C to confirm or call +91 98765 43210 to reschedule.',
    image: ''
  }
];

const mapSource = (source) => {
  if (!source) return 'Website';
  if (source.includes('WhatsApp')) return 'WhatsApp';
  if (source.includes('Instagram')) return 'Instagram';
  if (source.includes('Referral')) return 'Referral';
  if (source.includes('Walk-in') || source.includes('Walk')) return 'Walk-in';
  return 'Website';
};

const mapStatus = (status) => {
  if (!status) return 'new';
  const s = status.toLowerCase();
  return ['new', 'contacted', 'booked', 'converted', 'lost'].includes(s) ? s : 'new';
};

const seedDB = async () => {
  try {
    console.log('Connecting to Supabase endpoint...');
    
    // Clean all child and master tables
    console.log('Truncating existing database tables...');
    await supabase.from('appointments').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    await supabase.from('patient_documents').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    await supabase.from('patient_visits').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    await supabase.from('patient_history').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    await supabase.from('patients').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    await supabase.from('lead_messages').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    await supabase.from('lead_notes').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    await supabase.from('leads').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    await supabase.from('templates').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    await supabase.from('treatments').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    await supabase.from('users').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    console.log('Tables cleared successfully.');

    // 1. Seed Users
    console.log('Seeding default user profiles...');
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash('AuraCRMProtect2026!', salt);

    const { data: users, error: userError } = await supabase
      .from('users')
      .insert([
        { name: 'Dr. Ananya Sharma', email: 'admin@auraclinic.in', password: hashedPassword, role: 'doctor' },
        { name: 'Staff Receptionist', email: 'reception@auraclinic.in', password: hashedPassword, role: 'receptionist' },
        { name: 'Marketing Manager', email: 'marketing@auraclinic.in', password: hashedPassword, role: 'marketing' }
      ])
      .select();

    if (userError) throw userError;

    // 2. Seed Treatments
    console.log('Seeding treatments...');
    const { data: insertedTreatments, error: treatError } = await supabase
      .from('treatments')
      .insert(SEED_TREATMENTS)
      .select();

    if (treatError) throw treatError;
    console.log(`Seeded ${insertedTreatments.length} treatments.`);

    // 3. Seed Templates
    console.log('Seeding templates...');
    const { data: insertedTemplates, error: tmplError } = await supabase
      .from('templates')
      .insert(SEED_TEMPLATES)
      .select();

    if (tmplError) throw tmplError;
    console.log(`Seeded ${insertedTemplates.length} templates.`);

    // 4. Seed Leads, Patients, and Appointments
    const dbJsonPath = path.join(__dirname, '../../src/data/db.json');
    if (fs.existsSync(dbJsonPath)) {
      console.log('Reading db.json for data seeding...');
      const dbData = JSON.parse(fs.readFileSync(dbJsonPath, 'utf8'));

      const leadMap = {};
      const patientMap = {};

      // Seed Leads
      if (dbData.leads && dbData.leads.length > 0) {
        console.log('Mapping and seeding leads...');
        for (const item of dbData.leads) {
          const matchedTreatment = insertedTreatments.find(t => t.name === item.treatment);
          
          const { data: createdLead, error: leadErr } = await supabase
            .from('leads')
            .insert({
              name: item.name,
              phone: item.phone,
              email: item.email || '',
              treatment_id: matchedTreatment ? matchedTreatment.id : null,
              treatment_name: item.treatment || '',
              source: mapSource(item.source),
              status: mapStatus(item.status),
              message: item.notes || '',
              created_at: new Date(item.date).toISOString()
            })
            .select()
            .single();

          if (leadErr) throw leadErr;
          leadMap[item.id] = createdLead;

          // Process notes & messages
          const notesToInsert = [];
          const messagesToInsert = [];

          if (item.history) {
            item.history.forEach(hist => {
              const dateVal = hist.date ? new Date(hist.date).toISOString() : new Date().toISOString();
              if (hist.type === 'auto-msg') {
                messagesToInsert.push({
                  lead_id: createdLead.id,
                  channel: hist.text.includes('Email') ? 'Email' : 'WhatsApp',
                  direction: 'outbound',
                  body: hist.text,
                  created_at: dateVal
                });
              } else {
                notesToInsert.push({
                  lead_id: createdLead.id,
                  text: hist.text,
                  system: hist.type === 'system',
                  created_at: dateVal
                });
              }
            });
          }

          if (item.notes) {
            notesToInsert.push({
              lead_id: createdLead.id,
              text: item.notes,
              system: false,
              created_at: new Date(item.date).toISOString()
            });
          }

          if (notesToInsert.length > 0) {
            const { error } = await supabase.from('lead_notes').insert(notesToInsert);
            if (error) throw error;
          }
          if (messagesToInsert.length > 0) {
            const { error } = await supabase.from('lead_messages').insert(messagesToInsert);
            if (error) throw error;
          }
        }
        console.log(`Seeded ${Object.keys(leadMap).length} leads.`);
      }

      // Seed Patients
      if (dbData.patients && dbData.patients.length > 0) {
        console.log('Mapping and seeding patients...');
        for (const pat of dbData.patients) {
          const linkedLead = leadMap[pat.leadId];

          const { data: createdPatient, error: patErr } = await supabase
            .from('patients')
            .insert({
              lead_id: linkedLead ? linkedLead.id : null,
              name: pat.name,
              phone: pat.phone,
              treatment_name: pat.treatmentPlan ? pat.treatmentPlan.split(' ')[0] : 'Consultation',
              last_visit: pat.visitHistory && pat.visitHistory.length > 0 ? new Date(pat.visitHistory[0].date).toISOString() : null,
              next_appt: null,
              plan: pat.treatmentPlan || 'Consulted. Plan pending.'
            })
            .select()
            .single();

          if (patErr) throw patErr;
          patientMap[pat.id] = createdPatient;

          if (pat.visitHistory) {
            const visitsToInsert = pat.visitHistory.map(vh => ({
              patient_id: createdPatient.id,
              date: vh.date,
              treatment: vh.treatment || 'Consultation',
              notes: vh.notes || '',
              cost: vh.cost || '',
              created_at: new Date(vh.date).toISOString()
            }));

            const historyToInsert = pat.visitHistory.map(vh => ({
              patient_id: createdPatient.id,
              note: vh.notes,
              created_at: new Date(vh.date).toISOString()
            }));

            const { error: visitErr } = await supabase.from('patient_visits').insert(visitsToInsert);
            if (visitErr) throw visitErr;

            const { error: histErr } = await supabase.from('patient_history').insert(historyToInsert);
            if (histErr) throw histErr;
          }
        }
        console.log(`Seeded ${Object.keys(patientMap).length} patients.`);
      }

      // Seed Appointments
      if (dbData.appointments && dbData.appointments.length > 0) {
        console.log('Mapping and seeding appointments...');
        const apptsToInsert = [];
        for (const apt of dbData.appointments) {
          const linkedPatient = patientMap['pat-1']; // Maps to first patient pat-1

          let apptStatus = 'booked';
          if (apt.status === 'Completed') apptStatus = 'converted';
          if (apt.status === 'Cancelled') apptStatus = 'cancelled';

          apptsToInsert.push({
            patient_id: linkedPatient ? linkedPatient.id : null,
            patient_name: apt.patientName,
            treatment_name: apt.treatment || 'Consultation',
            date: new Date(apt.date).toISOString(),
            time: apt.time,
            status: apptStatus
          });
        }

        const { error: aptErr } = await supabase.from('appointments').insert(apptsToInsert);
        if (aptErr) throw aptErr;
        console.log(`Seeded ${dbData.appointments.length} appointments.`);
      }
    }

    console.log('Database Seeding Successful with Supabase PostgreSQL tables!');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding database:', error.message || error);
    process.exit(1);
  }
};

seedDB();
