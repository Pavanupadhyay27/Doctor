'use client';

import React, { useState, useRef, useEffect } from 'react';

export default function BeforeAfter() {
  const [position, setPosition] = useState(50);
  const containerRef = useRef(null);
  const isDragging = useRef(false);

  const handleMove = (clientX) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    let x = clientX - rect.left;
    if (x < 0) x = 0;
    if (x > rect.width) x = rect.width;
    const pct = (x / rect.width) * 100;
    setPosition(pct);
  };

  const handleMouseDown = () => {
    isDragging.current = true;
  };

  const handleTouchStart = () => {
    isDragging.current = true;
  };

  useEffect(() => {
    const handleGlobalMouseMove = (e) => {
      if (!isDragging.current) return;
      handleMove(e.clientX);
    };

    const handleGlobalMouseUp = () => {
      isDragging.current = false;
    };

    const handleGlobalTouchMove = (e) => {
      if (!isDragging.current) return;
      handleMove(e.touches[0].clientX);
    };

    window.addEventListener('mousemove', handleGlobalMouseMove);
    window.addEventListener('mouseup', handleGlobalMouseUp);
    window.addEventListener('touchmove', handleGlobalTouchMove);
    window.addEventListener('touchend', handleGlobalMouseUp);

    return () => {
      window.removeEventListener('mousemove', handleGlobalMouseMove);
      window.removeEventListener('mouseup', handleGlobalMouseUp);
      window.removeEventListener('touchmove', handleGlobalTouchMove);
      window.removeEventListener('touchend', handleGlobalMouseUp);
    };
  }, []);

  return (
    <section id="testimonials-ba" className="section-padding bg-white">
      <div className="container mx-auto px-4" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '40px', alignItems: 'center', maxWidth: '1200px', margin: '0 auto' }}>
        <div>
          <span className="section-tag" style={{ color: 'var(--accent)' }}>Visible Results</span>
          <h2 className="section-title" style={{ fontSize: '38px', fontWeight: '800', color: 'var(--text-dark)', marginBottom: '16px' }}>Clinical Skin Rejuvenation</h2>
          <p style={{ color: 'var(--text-muted)', marginBottom: '24px', lineHeight: '1.75', fontSize: '15px' }}>
            See the transformation after 3 sessions of our Fractionated Laser Skin Resurfacing combined with deep salicylic chemical peels.
          </p>
          <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '14px', marginBottom: '32px', padding: 0 }}>
            <li style={{ display: 'flex', alignItems: 'center', fontSize: '14.5px', color: 'var(--text-dark)', fontWeight: '600' }}>
              <div style={{ flexShrink: 0, width: '22px', height: '22px', borderRadius: '50%', backgroundColor: 'rgba(15, 107, 92, 0.08)', color: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '11px', marginRight: '10px' }}>
                <i className="fas fa-check"></i>
              </div>
              Reduced hyperpigmentation & sunspots by 85%
            </li>
            <li style={{ display: 'flex', alignItems: 'center', fontSize: '14.5px', color: 'var(--text-dark)', fontWeight: '600' }}>
              <div style={{ flexShrink: 0, width: '22px', height: '22px', borderRadius: '50%', backgroundColor: 'rgba(15, 107, 92, 0.08)', color: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '11px', marginRight: '10px' }}>
                <i className="fas fa-check"></i>
              </div>
              Softened deep acne pockmark scarring
            </li>
            <li style={{ display: 'flex', alignItems: 'center', fontSize: '14.5px', color: 'var(--text-dark)', fontWeight: '600' }}>
              <div style={{ flexShrink: 0, width: '22px', height: '22px', borderRadius: '50%', backgroundColor: 'rgba(15, 107, 92, 0.08)', color: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '11px', marginRight: '10px' }}>
                <i className="fas fa-check"></i>
              </div>
              Restored skin glow and collagen levels
            </li>
          </ul>
        </div>
        
        <div>
          {/* Slider Component */}
          <div 
            ref={containerRef} 
            className="ba-slider relative"
            style={{ touchAction: 'none' }}
          >
            <img src="/skin_after.png" className="ba-slider-img" alt="Skin Rejuvenation After" />
            <span className="ba-slider-label after">AFTER</span>
            
            <div className="ba-slider-overlay" style={{ width: `${position}%` }}>
              <img src="/skin_before.png" className="ba-slider-img" alt="Skin Rejuvenation Before" />
              <span className="ba-slider-label before">BEFORE</span>
            </div>
            
            <div 
              className="ba-slider-handle" 
              style={{ left: `${position}%` }}
              onMouseDown={handleMouseDown}
              onTouchStart={handleTouchStart}
            >
              <div className="ba-slider-button">
                <i className="fas fa-arrows-alt-h"></i>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
