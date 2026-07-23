'use client';

import React from 'react';

const TREATMENT_DATA = {
  laser: {
    id: 'laser',
    name: 'Laser Skin Resurfacing',
    tagline: 'Precision Light Technology for Flawless Skin',
    image: '/treatment_laser.png',
    duration: '45 mins',
    price: '$250 – $600',
    recovery: '3–5 days',
    sessions: '3–6 sessions',
    anesthesia: 'Topical numbing cream',
    results: 'Visible in 7–14 days',
    overview: 'Laser Skin Resurfacing uses short, concentrated pulsating beams of light to precisely remove damaged skin layer by layer. Our fractionated CO₂ laser stimulates the body\'s natural healing process, triggering collagen production and revealing fresh, rejuvenated skin underneath.',
    howItWorks: [
      'A topical numbing cream is applied 30 minutes before the procedure for maximum comfort.',
      'The laser beam gently ablates the outer layer of skin (epidermis) using controlled micro-pulses.',
      'Thermal energy simultaneously heats the underlying dermis, stimulating new collagen fiber growth.',
      'The skin naturally regenerates over the next 5–10 days, revealing smoother, tighter, more even-toned skin.'
    ],
    bestFor: ['Sun damage & age spots', 'Fine lines & wrinkles', 'Acne scarring & pitted texture', 'Hyperpigmentation & melasma', 'Enlarged pores', 'Uneven skin tone'],
    beforeAfter: [
      'Avoid direct sun exposure for 2 weeks before treatment.',
      'Discontinue retinoid products 5 days prior.',
      'Post-treatment: Apply prescribed moisturizer and SPF 50 daily.',
      'Mild redness and peeling is normal for 3–5 days — do not pick or scratch.',
      'Full results visible after 2–4 weeks as collagen remodeling completes.'
    ],
    faqs: [
      { q: 'Is laser resurfacing painful?', a: 'With topical numbing cream, most patients feel only a warm tingling sensation. Discomfort is minimal and subsides within an hour.' },
      { q: 'How many sessions do I need?', a: 'For mild concerns, 1–2 sessions may suffice. For deep scars or significant sun damage, 3–6 sessions spaced 4–6 weeks apart are recommended.' },
      { q: 'Can I wear makeup after treatment?', a: 'We recommend waiting 5–7 days before applying makeup to allow the skin to heal properly.' },
      { q: 'Are results permanent?', a: 'Results are long-lasting but not permanent. Maintaining a good skincare routine and sun protection will extend results for years.' }
    ]
  },
  botox: {
    id: 'botox',
    name: 'Botox & Dermal Fillers',
    tagline: 'Restore Youth & Volume Without Surgery',
    image: '/treatment_injectables.png',
    duration: '30 mins',
    price: '$350 – $800',
    recovery: 'No downtime',
    sessions: 'Every 3–6 months',
    anesthesia: 'Ice or topical numbing',
    results: 'Immediate to 14 days',
    overview: 'Botox temporarily relaxes targeted facial muscles to smooth dynamic wrinkles like crow\'s feet and forehead lines. Dermal fillers use hyaluronic acid gel to restore lost volume, plump lips, lift cheeks, and soften nasolabial folds — all without surgery or downtime.',
    howItWorks: [
      'Your facial anatomy is mapped and injection points are precisely marked for symmetrical results.',
      'Botox: Ultra-fine needles deliver botulinum toxin into specific muscles, blocking nerve signals that cause wrinkles.',
      'Fillers: Hyaluronic acid gel is injected into areas of volume loss using micro-cannulas for minimal bruising.',
      'Results for Botox peak at 7–14 days and last 3–4 months. Filler results are immediate and last 6–18 months.'
    ],
    bestFor: ['Crow\'s feet & forehead lines', 'Frown lines (glabellar)', 'Lip augmentation & definition', 'Cheek volume restoration', 'Nasolabial fold softening', 'Under-eye hollows'],
    beforeAfter: [
      'Avoid blood-thinning medications (aspirin, ibuprofen) for 7 days before treatment.',
      'No alcohol consumption 24 hours prior.',
      'Post-treatment: Do not rub or massage injection sites for 4 hours.',
      'Avoid strenuous exercise and lying flat for 4 hours after Botox.',
      'Minor swelling or bruising may occur — ice packs can help.'
    ],
    faqs: [
      { q: 'Will I look frozen or unnatural?', a: 'Our approach focuses on subtle, natural-looking results. We use conservative doses and precise placement to maintain your natural expressions.' },
      { q: 'How long do fillers last?', a: 'Depending on the product and area treated, fillers last 6–18 months. Lip fillers typically last 6–9 months, while cheek fillers can last 12–18 months.' },
      { q: 'Is there any downtime?', a: 'No real downtime. You can return to normal activities immediately. Some patients experience minor bruising that fades within 2–3 days.' },
      { q: 'Can fillers be reversed?', a: 'Yes. Hyaluronic acid fillers can be dissolved with an enzyme called hyaluronidase if needed.' }
    ]
  },
  peel: {
    id: 'peel',
    name: 'Chemical Peels',
    tagline: 'Reveal Brighter, Smoother Skin Underneath',
    image: '/treatment_peels.png',
    duration: '45 mins',
    price: '$120 – $250',
    recovery: '1–2 days',
    sessions: 'Monthly maintenance',
    anesthesia: 'None required',
    results: 'Visible in 3–7 days',
    overview: 'Chemical Peels apply a carefully formulated acidic solution to exfoliate dead skin cells and stimulate cellular turnover. Our medical-grade peels penetrate deeper than over-the-counter products, effectively treating dullness, acne, fine lines, and uneven pigmentation.',
    howItWorks: [
      'Your skin is thoroughly cleansed and degreased to ensure even absorption.',
      'A customized acid solution (glycolic, salicylic, lactic, or TCA) is applied in controlled layers.',
      'The solution breaks down dead cell bonds in the stratum corneum, triggering controlled exfoliation.',
      'New skin cells regenerate from beneath, resulting in smoother, brighter, more even-toned skin within 5–7 days.'
    ],
    bestFor: ['Dull, tired-looking skin', 'Clogged pores & blackheads', 'Superficial acne scars', 'Fine lines & texture issues', 'Uneven skin tone & dark spots', 'Sun-damaged skin'],
    beforeAfter: [
      'Discontinue retinoids and exfoliating products 3 days before treatment.',
      'Arrive with clean, makeup-free skin.',
      'Post-treatment: Expect mild flaking and peeling on days 2–4 — this is normal.',
      'Apply hydrating serum and SPF 50 daily during the healing period.',
      'Do not pick, scratch, or peel flaking skin — let it shed naturally.'
    ],
    faqs: [
      { q: 'Which peel is right for me?', a: 'During your consultation, we assess your skin type, concerns, and sensitivity level to recommend the ideal acid concentration and formula.' },
      { q: 'Does it hurt?', a: 'You may feel a mild tingling or warming sensation during application. This is normal and subsides within minutes.' },
      { q: 'How often should I get a peel?', a: 'For best results, we recommend monthly peels as part of your ongoing skincare maintenance routine.' },
      { q: 'Can I do a peel if I have active acne?', a: 'Yes! Salicylic acid peels are specifically designed for acne-prone skin and can help reduce breakouts.' }
    ]
  },
  acne: {
    id: 'acne',
    name: 'Advanced Acne Therapy',
    tagline: 'Medical-Grade Solutions for Clear, Healthy Skin',
    image: '/treatment_acne.png',
    duration: '60 mins',
    price: '$99 – $180',
    recovery: 'Minimal',
    sessions: '6–10 sessions',
    anesthesia: 'None required',
    results: 'Progressive over weeks',
    overview: 'Our Advanced Acne Therapy combines medical-grade extractions, high-frequency antibacterial light therapy, LED phototherapy, and custom calming masks to combat inflammation, kill acne-causing bacteria, and restore skin balance. This comprehensive approach addresses acne at every level — from surface breakouts to deep cystic lesions.',
    howItWorks: [
      'Deep cleansing and steam open clogged pores and soften impactions for safe extraction.',
      'Professional medical extractions remove blackheads, whiteheads, and milia without scarring.',
      'High-frequency antibacterial light destroys P. acnes bacteria deep within follicles.',
      'LED phototherapy (blue + red light) reduces inflammation and accelerates healing.',
      'A custom calming mask with niacinamide and centella soothes irritation and balances oil production.'
    ],
    bestFor: ['Active hormonal acne', 'Cystic & nodular breakouts', 'Persistent blackheads & whiteheads', 'Post-inflammatory hyperpigmentation', 'Oily, congested skin', 'Recurring chin & jawline breakouts'],
    beforeAfter: [
      'Arrive with clean, makeup-free skin for the session.',
      'Avoid picking or squeezing blemishes before your appointment.',
      'Post-treatment: Mild redness is normal and subsides within 2–4 hours.',
      'Use only gentle, fragrance-free products for 48 hours after treatment.',
      'Drink plenty of water and avoid touching your face throughout the day.'
    ],
    faqs: [
      { q: 'How many sessions do I need?', a: 'Most patients see significant improvement after 4–6 sessions. For severe or cystic acne, 8–10 sessions may be recommended, spaced 2 weeks apart.' },
      { q: 'Will extractions cause scarring?', a: 'Professional medical extractions performed by trained clinicians minimize scarring risk. Home squeezing is far more likely to cause permanent marks.' },
      { q: 'Can I combine this with prescription medications?', a: 'Absolutely. Our treatment works alongside topical and oral acne medications. We coordinate with your dermatologist for optimal results.' },
      { q: 'Is this treatment suitable for sensitive skin?', a: 'Yes. We customize every session based on your skin sensitivity, adjusting extraction pressure, light intensity, and mask formulation accordingly.' }
    ]
  }
};

export default function TreatmentDetailPage({ treatmentId, onBack, onBook }) {
  const data = TREATMENT_DATA[treatmentId];
  if (!data) return null;

  return (
    <div style={{ backgroundColor: '#FAF9F6', minHeight: '100vh' }}>
      
      {/* Hero Banner */}
      <div style={{ position: 'relative', height: '420px', overflow: 'hidden', backgroundColor: '#0A1614' }}>
        <img 
          src={data.image} 
          alt={data.name}
          style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center', filter: 'brightness(0.5)' }}
        />
        <div style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'flex-end',
          padding: '60px',
          background: 'linear-gradient(to top, rgba(10, 22, 20, 0.85) 0%, transparent 60%)'
        }}>
          <button 
            onClick={onBack}
            style={{
              position: 'absolute',
              top: '30px',
              left: '30px',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              color: 'rgba(255,255,255,0.7)',
              fontSize: '14px',
              fontWeight: '700',
              background: 'rgba(255,255,255,0.1)',
              border: '1px solid rgba(255,255,255,0.15)',
              borderRadius: '30px',
              padding: '10px 20px',
              cursor: 'pointer',
              backdropFilter: 'blur(10px)'
            }}
          >
            <i className="fas fa-arrow-left"></i> Back to Treatments
          </button>

          <span style={{ fontSize: '12px', fontWeight: '800', color: 'rgba(255,255,255,0.5)', textTransform: 'uppercase', letterSpacing: '1.5px', marginBottom: '10px' }}>
            Clinical Offering
          </span>
          <h1 style={{ fontSize: '38px', fontWeight: '850', color: '#ffffff', letterSpacing: '-0.5px', margin: 0, lineHeight: '1.15' }}>
            {data.name}
          </h1>
          <p style={{ fontSize: '16px', color: 'rgba(255,255,255,0.6)', marginTop: '8px', maxWidth: '600px' }}>
            {data.tagline}
          </p>
        </div>
      </div>

      {/* Content */}
      <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '50px 24px 80px' }}>

        {/* Quick Stats Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '16px', marginBottom: '50px', marginTop: '-70px', position: 'relative', zIndex: 10 }}>
          {[
            { label: 'Duration', value: data.duration, icon: 'far fa-clock' },
            { label: 'Price Range', value: data.price, icon: 'fas fa-tag' },
            { label: 'Recovery', value: data.recovery, icon: 'fas fa-heart-pulse' },
            { label: 'Sessions', value: data.sessions, icon: 'fas fa-layer-group' },
            { label: 'Anesthesia', value: data.anesthesia, icon: 'fas fa-syringe' },
            { label: 'Results', value: data.results, icon: 'fas fa-sparkles' }
          ].map((stat, i) => (
            <div key={i} style={{
              backgroundColor: '#ffffff',
              padding: '20px',
              borderRadius: '16px',
              border: '1px solid var(--border)',
              textAlign: 'center'
            }}>
              <i className={stat.icon} style={{ fontSize: '18px', color: 'var(--primary)', marginBottom: '8px', display: 'block' }}></i>
              <div style={{ fontSize: '10px', fontWeight: '800', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '4px' }}>{stat.label}</div>
              <div style={{ fontSize: '14px', fontWeight: '750', color: 'var(--text-dark)' }}>{stat.value}</div>
            </div>
          ))}
        </div>

        {/* Two Column Layout */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 380px', gap: '40px', alignItems: 'start' }}>
          
          {/* Left Column - Main Content */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '40px' }}>
            
            {/* Overview */}
            <div>
              <h2 style={{ fontSize: '22px', fontWeight: '850', color: 'var(--text-dark)', marginBottom: '16px', letterSpacing: '-0.3px' }}>Overview</h2>
              <p style={{ fontSize: '15px', color: 'var(--text-muted)', lineHeight: '1.7' }}>{data.overview}</p>
            </div>

            {/* How It Works */}
            <div>
              <h2 style={{ fontSize: '22px', fontWeight: '850', color: 'var(--text-dark)', marginBottom: '20px', letterSpacing: '-0.3px' }}>How It Works</h2>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {data.howItWorks.map((step, i) => (
                  <div key={i} style={{ display: 'flex', gap: '16px', alignItems: 'flex-start' }}>
                    <div style={{
                      width: '32px',
                      height: '32px',
                      borderRadius: '50%',
                      backgroundColor: 'var(--primary)',
                      color: '#ffffff',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '13px',
                      fontWeight: '800',
                      flexShrink: 0
                    }}>
                      {i + 1}
                    </div>
                    <p style={{ fontSize: '14.5px', color: 'var(--text-muted)', lineHeight: '1.6', paddingTop: '4px' }}>{step}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Best For */}
            <div>
              <h2 style={{ fontSize: '22px', fontWeight: '850', color: 'var(--text-dark)', marginBottom: '20px', letterSpacing: '-0.3px' }}>Best For</h2>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                {data.bestFor.map((item, i) => (
                  <div key={i} style={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: '10px', 
                    padding: '12px 16px', 
                    backgroundColor: '#ffffff', 
                    borderRadius: '10px', 
                    border: '1px solid var(--border)',
                    fontSize: '13.5px',
                    fontWeight: '650',
                    color: 'var(--text-dark)'
                  }}>
                    <i className="fas fa-check-circle" style={{ color: 'var(--primary)', fontSize: '14px' }}></i>
                    {item}
                  </div>
                ))}
              </div>
            </div>

            {/* Before & After Care */}
            <div>
              <h2 style={{ fontSize: '22px', fontWeight: '850', color: 'var(--text-dark)', marginBottom: '20px', letterSpacing: '-0.3px' }}>Pre & Post Treatment Care</h2>
              <div style={{ 
                backgroundColor: '#ffffff', 
                borderRadius: '16px', 
                border: '1px solid var(--border)', 
                padding: '24px',
                display: 'flex',
                flexDirection: 'column',
                gap: '14px'
              }}>
                {data.beforeAfter.map((item, i) => (
                  <div key={i} style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
                    <i className="fas fa-circle" style={{ fontSize: '5px', color: 'var(--primary)', marginTop: '8px', flexShrink: 0 }}></i>
                    <span style={{ fontSize: '14px', color: 'var(--text-muted)', lineHeight: '1.55' }}>{item}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* FAQs */}
            <div>
              <h2 style={{ fontSize: '22px', fontWeight: '850', color: 'var(--text-dark)', marginBottom: '20px', letterSpacing: '-0.3px' }}>Frequently Asked Questions</h2>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {data.faqs.map((faq, i) => (
                  <div key={i} style={{ 
                    backgroundColor: '#ffffff', 
                    borderRadius: '14px', 
                    border: '1px solid var(--border)', 
                    padding: '20px 24px' 
                  }}>
                    <h4 style={{ fontSize: '14.5px', fontWeight: '750', color: 'var(--text-dark)', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <i className="fas fa-circle-question" style={{ color: 'var(--primary)', fontSize: '14px' }}></i>
                      {faq.q}
                    </h4>
                    <p style={{ fontSize: '13.5px', color: 'var(--text-muted)', lineHeight: '1.6', paddingLeft: '22px' }}>{faq.a}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right Column - Sticky Sidebar */}
          <div style={{ position: 'sticky', top: '30px' }}>
            {/* Booking Card */}
            <div style={{ 
              backgroundColor: '#ffffff', 
              borderRadius: '20px', 
              border: '1px solid var(--border)', 
              padding: '28px',
              marginBottom: '20px'
            }}>
              <h3 style={{ fontSize: '18px', fontWeight: '850', color: 'var(--text-dark)', marginBottom: '6px' }}>Book This Treatment</h3>
              <p style={{ fontSize: '12.5px', color: 'var(--text-muted)', marginBottom: '20px', lineHeight: '1.4' }}>
                Schedule a consultation with our board-certified dermatologists.
              </p>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '24px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 14px', backgroundColor: '#F8FAFC', borderRadius: '8px', fontSize: '13px' }}>
                  <span style={{ color: 'var(--text-muted)', fontWeight: '700' }}>Duration</span>
                  <span style={{ color: 'var(--text-dark)', fontWeight: '750' }}>{data.duration}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 14px', backgroundColor: '#F8FAFC', borderRadius: '8px', fontSize: '13px' }}>
                  <span style={{ color: 'var(--text-muted)', fontWeight: '700' }}>Starting at</span>
                  <span style={{ color: 'var(--text-dark)', fontWeight: '750' }}>{data.price}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 14px', backgroundColor: '#F8FAFC', borderRadius: '8px', fontSize: '13px' }}>
                  <span style={{ color: 'var(--text-muted)', fontWeight: '700' }}>Recovery</span>
                  <span style={{ color: 'var(--text-dark)', fontWeight: '750' }}>{data.recovery}</span>
                </div>
              </div>

              <button 
                onClick={() => onBook(data.name)}
                style={{
                  width: '100%',
                  padding: '14px',
                  backgroundColor: 'var(--primary)',
                  color: '#ffffff',
                  border: 'none',
                  borderRadius: '12px',
                  fontSize: '14.5px',
                  fontWeight: '750',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px'
                }}
              >
                <i className="far fa-calendar-check"></i> Schedule Consultation
              </button>
            </div>

            {/* Contact Info */}
            <div style={{ 
              backgroundColor: '#ffffff', 
              borderRadius: '20px', 
              border: '1px solid var(--border)', 
              padding: '24px' 
            }}>
              <h4 style={{ fontSize: '14px', fontWeight: '800', color: 'var(--text-dark)', marginBottom: '16px' }}>Have Questions?</h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '13px', color: 'var(--text-muted)' }}>
                  <i className="fas fa-phone" style={{ width: '16px', textAlign: 'center', color: 'var(--primary)' }}></i>
                  <span style={{ fontWeight: '700' }}>+91 98765 43210</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '13px', color: 'var(--text-muted)' }}>
                  <i className="fab fa-whatsapp" style={{ width: '16px', textAlign: 'center', color: 'var(--primary)' }}></i>
                  <span style={{ fontWeight: '700' }}>WhatsApp Consultation</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '13px', color: 'var(--text-muted)' }}>
                  <i className="far fa-envelope" style={{ width: '16px', textAlign: 'center', color: 'var(--primary)' }}></i>
                  <span style={{ fontWeight: '700' }}>hello@auraclinic.in</span>
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
