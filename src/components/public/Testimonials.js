'use client';

import React, { useState, useEffect, useRef } from 'react';

const REVIEWS = [
  {
    text: "The laser skin resurfacing changed my skin entirely. My deep acne scars are virtually gone, and the recovery only took 4 days. Dr. Sharma is incredibly gentle and detailed.",
    name: "Sarah Connor",
    treatment: "Laser Resurfacing",
    initials: "SC"
  },
  {
    text: "Very natural fillers! I was afraid of looking puffy, but Dr. Sharma has an artist's eye. The staff called me every day after my injection to check on me. Highly recommend!",
    name: "Elena Rostova",
    treatment: "Botox & Fillers",
    initials: "ER"
  },
  {
    text: "Severe hormonal acne ruled my life until I visited Aura. The advanced medical extractions and blue light therapies cleared my skin in 2 months. Life-changing care.",
    name: "Marcus Brody",
    treatment: "Acne Therapy",
    initials: "MB"
  },
  {
    text: "Outstanding clinical professionalism. The chemical peels resolved my stubborn hyperpigmentation that I had for years. The clinic is pristine and beautiful.",
    name: "Aisha Patel",
    treatment: "Chemical Peels",
    initials: "AP"
  }
];

export default function Testimonials() {
  const [index, setIndex] = useState(0);
  const [visibleCards, setVisibleCards] = useState(3);
  const [hoveredIdx, setHoveredIdx] = useState(null);
  const [hoverPrev, setHoverPrev] = useState(false);
  const [hoverNext, setHoverNext] = useState(false);
  const autoplayRef = useRef(null);

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 768) {
        setVisibleCards(1);
      } else if (window.innerWidth < 1024) {
        setVisibleCards(2);
      } else {
        setVisibleCards(3);
      }
    };
    
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const maxIndex = REVIEWS.length - visibleCards;

  const startAutoplay = () => {
    stopAutoplay();
    autoplayRef.current = setInterval(() => {
      setIndex(prev => (prev >= maxIndex ? 0 : prev + 1));
    }, 5000);
  };

  const stopAutoplay = () => {
    if (autoplayRef.current) clearInterval(autoplayRef.current);
  };

  useEffect(() => {
    startAutoplay();
    return () => stopAutoplay();
  }, [maxIndex]);

  const handlePrev = () => {
    stopAutoplay();
    setIndex(prev => (prev <= 0 ? maxIndex : prev - 1));
    startAutoplay();
  };

  const handleNext = () => {
    stopAutoplay();
    setIndex(prev => (prev >= maxIndex ? 0 : prev + 1));
    startAutoplay();
  };

  return (
    <section id="testimonials" className="section-padding bg-white">
      <div className="container mx-auto px-4" style={{ maxWidth: '1200px', margin: '0 auto' }}>
        <div className="section-header" style={{ textAlign: 'center', marginBottom: '60px' }}>
          <span className="section-tag" style={{ color: 'var(--accent)' }}>Reviews</span>
          <h2 className="section-title" style={{ fontSize: '36px', fontWeight: '800', color: 'var(--text-dark)' }}>What Our Patients Say</h2>
          <p className="section-subtitle" style={{ color: 'var(--text-muted)', fontSize: '15px', maxWidth: '600px', margin: '12px auto 0 auto' }}>
            Read firsthand experiences from patients who underwent treatment at our clinic.
          </p>
        </div>
        
        <div 
          className="testimonials-wrapper"
          onMouseEnter={stopAutoplay}
          onMouseLeave={startAutoplay}
          style={{ overflow: 'hidden', padding: '16px 4px' }}
        >
          <div 
            className="testimonials-track flex gap-[30px]"
            style={{
              transition: 'transform 0.6s cubic-bezier(0.16, 1, 0.3, 1)',
              transform: `translateX(calc(-${index * (100 / visibleCards)}% - ${index * (30 - 30 / visibleCards)}px))`
            }}
          >
            {REVIEWS.map((rev, idx) => (
              <div 
                key={idx} 
                className="card testimonial-card flex flex-col justify-between"
                onMouseEnter={() => setHoveredIdx(idx)}
                onMouseLeave={() => setHoveredIdx(null)}
                style={{
                  width: `calc(${100 / visibleCards}% - ${(30 * (visibleCards - 1)) / visibleCards}px)`,
                  minWidth: `calc(${100 / visibleCards}% - ${(30 * (visibleCards - 1)) / visibleCards}px)`,
                  flexShrink: 0,
                  backgroundColor: '#ffffff',
                  borderRadius: '24px',
                  border: '1px solid rgba(18, 33, 30, 0.06)',
                  padding: '40px 36px',
                  boxShadow: hoveredIdx === idx 
                    ? '0 30px 60px -15px rgba(15, 107, 92, 0.08)' 
                    : '0 15px 35px rgba(18, 33, 30, 0.02)',
                  transform: hoveredIdx === idx ? 'translateY(-8px)' : 'translateY(0)',
                  transition: 'all 0.4s cubic-bezier(0.16, 1, 0.3, 1)'
                }}
              >
                <div>
                  <i className="fas fa-quote-left" style={{ color: 'rgba(15, 107, 92, 0.12)', fontSize: '38px', marginBottom: '16px', display: 'block' }}></i>
                  <div className="testimonial-stars text-amber-500 mb-4" style={{ fontSize: '13px', display: 'flex', gap: '3px', marginBottom: '18px' }}>
                    <i className="fas fa-star"></i>
                    <i className="fas fa-star"></i>
                    <i className="fas fa-star"></i>
                    <i className="fas fa-star"></i>
                    <i className="fas fa-star"></i>
                  </div>
                  <p className="testimonial-text" style={{ fontSize: '14.5px', color: 'var(--text-dark)', fontFamily: 'var(--font-body)', fontStyle: 'italic', lineHeight: '1.65', marginBottom: '24px' }}>
                    "{rev.text}"
                  </p>
                </div>
                
                <div className="testimonial-patient flex items-center gap-4" style={{ marginTop: '20px', borderTop: '1px solid rgba(18, 33, 30, 0.06)', paddingTop: '20px' }}>
                  <div className="patient-avatar flex items-center justify-center font-bold text-sm" style={{ width: '42px', height: '42px', background: 'linear-gradient(135deg, rgba(15,107,92,0.08), rgba(255,122,89,0.08))', color: 'var(--primary)', borderRadius: '50%', fontWeight: '750' }}>
                    {rev.initials}
                  </div>
                  <div className="patient-info flex flex-col" style={{ alignItems: 'flex-start' }}>
                    <span className="patient-name" style={{ color: 'var(--text-dark)', fontWeight: '700', fontSize: '14.5px' }}>{rev.name}</span>
                    <span className="patient-treatment" style={{ background: 'rgba(15, 107, 92, 0.05)', color: 'var(--primary)', borderRadius: '6px', padding: '3px 8px', fontSize: '11px', fontWeight: '600', marginTop: '4px', display: 'inline-block' }}>{rev.treatment}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
 
        {/* Styled Glass circular buttons */}
        <div className="carousel-controls flex justify-center gap-4 mt-12">
          <button 
            onClick={handlePrev} 
            onMouseEnter={() => setHoverPrev(true)}
            onMouseLeave={() => setHoverPrev(false)}
            style={{
              width: '48px',
              height: '48px',
              borderRadius: '50%',
              border: '1px solid var(--border)',
              backgroundColor: hoverPrev ? 'var(--primary)' : '#ffffff',
              color: hoverPrev ? '#ffffff' : 'var(--text-dark)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              boxShadow: '0 4px 12px rgba(18, 33, 30, 0.04)',
              transition: 'all 0.25s ease',
              outline: 'none'
            }}
          >
            <i className="fas fa-chevron-left" style={{ fontSize: '14px' }}></i>
          </button>
          
          <button 
            onClick={handleNext} 
            onMouseEnter={() => setHoverNext(true)}
            onMouseLeave={() => setHoverNext(false)}
            style={{
              width: '48px',
              height: '48px',
              borderRadius: '50%',
              border: '1px solid var(--border)',
              backgroundColor: hoverNext ? 'var(--primary)' : '#ffffff',
              color: hoverNext ? '#ffffff' : 'var(--text-dark)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              boxShadow: '0 4px 12px rgba(18, 33, 30, 0.04)',
              transition: 'all 0.25s ease',
              outline: 'none'
            }}
          >
            <i className="fas fa-chevron-right" style={{ fontSize: '14px' }}></i>
          </button>
        </div>
      </div>
    </section>
  );
}
