'use client';

import React, { useState } from 'react';
import { useCRM } from '@/context/CRMState';
import DetailModal from './DetailModal';

export default function Treatments({ onSelectTreatment }) {
  const { treatments, activeModalTreatmentId, setActiveModalTreatmentId } = useCRM();
  const [hoveredId, setHoveredId] = useState(null);

  const selectedTmpl = treatments.find(t => t.id === activeModalTreatmentId);
  const isModalOpen = !!activeModalTreatmentId;

  const handleLearnMore = (treatmentId) => {
    setActiveModalTreatmentId(treatmentId);
  };

  const handleCloseModal = () => {
    setActiveModalTreatmentId(null);
  };

  return (
    <section 
      id="treatments" 
      className="section-padding bg-[#FAF9F6]" 
      style={{ paddingTop: '150px' }} // Increased top padding to give quick booking strip plenty of room
    >
      <div className="container mx-auto px-4" style={{ maxWidth: '1200px', margin: '0 auto' }}>
        <div className="section-header" style={{ textAlign: 'center', marginBottom: '60px' }}>
          <span className="section-tag" style={{ color: 'var(--accent)' }}>Clinical Offerings</span>
          <h2 className="section-title" style={{ fontSize: '38px', fontWeight: '800', color: 'var(--text-dark)', fontFamily: 'var(--font-heading)', letterSpacing: '-0.5px' }}>Specialized Skin Treatments</h2>
          <p className="section-subtitle" style={{ color: 'var(--text-muted)', fontSize: '15px', maxWidth: '650px', margin: '12px auto 0 auto', lineHeight: '1.6' }}>
            We offer medical-grade cosmetic and dermatological procedures using state-of-the-art technology to achieve visible, natural results.
          </p>
        </div>
        
        <div className="treatments-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '30px' }}>
          {/* Laser Card */}
          <div 
            className="card treatment-card reveal" 
            onMouseEnter={() => setHoveredId('laser')}
            onMouseLeave={() => setHoveredId(null)}
            style={{ 
              display: 'flex', 
              flexDirection: 'column', 
              height: '100%', 
              overflow: 'hidden', 
              border: hoveredId === 'laser' ? '1px solid var(--primary)' : '1px solid var(--border)', 
              borderRadius: '24px', 
              backgroundColor: '#ffffff', 
              transition: 'all 0.4s cubic-bezier(0.16, 1, 0.3, 1)', 
              cursor: 'pointer',
              transform: hoveredId === 'laser' ? 'translateY(-8px)' : 'translateY(0)',
              boxShadow: hoveredId === 'laser' 
                ? '0 30px 60px -15px rgba(15, 107, 92, 0.12)' 
                : '0 10px 30px rgba(18, 33, 30, 0.02)'
            }}
            onClick={() => handleLearnMore('laser')}
          >
            <div className="treatment-card-img-wrapper" style={{ position: 'relative', height: '230px', overflow: 'hidden', marginBottom: '20px' }}>
              <img 
                src="/treatment_laser.png" 
                alt="Laser Skin Resurfacing" 
                className="w-full h-full object-cover" 
                style={{ 
                  width: '100%', 
                  height: '100%', 
                  objectFit: 'cover',
                  transform: hoveredId === 'laser' ? 'scale(1.05)' : 'scale(1)',
                  transition: 'transform 0.6s cubic-bezier(0.16, 1, 0.3, 1)'
                }}
              />
            </div>
            <div style={{ padding: '0 24px 24px 24px', flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
              <h3 className="treatment-card-title" style={{ fontSize: '20px', fontWeight: '700', color: 'var(--text-dark)', marginBottom: '10px' }}>Laser Skin Resurfacing</h3>
              <p className="treatment-card-desc" style={{ fontSize: '14px', color: 'var(--text-muted)', marginBottom: '20px', lineHeight: '1.65', flexGrow: 1 }}>
                Rejuvenate your skin, remove hyperpigmentation, and smooth deep acne scars with our fractionated CO2 laser technology.
              </p>
              <button 
                onClick={(e) => {
                  e.stopPropagation();
                  handleLearnMore('laser');
                }} 
                className="treatment-card-link text-left"
                style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px', fontWeight: '700', color: 'var(--primary)' }}
              >
                Learn more <i className="fas fa-chevron-right" style={{ fontSize: '11px' }}></i>
              </button>
            </div>
          </div>

          {/* Botox Card */}
          <div 
            className="card treatment-card reveal delay-100" 
            onMouseEnter={() => setHoveredId('botox')}
            onMouseLeave={() => setHoveredId(null)}
            style={{ 
              display: 'flex', 
              flexDirection: 'column', 
              height: '100%', 
              overflow: 'hidden', 
              border: hoveredId === 'botox' ? '1px solid var(--primary)' : '1px solid var(--border)', 
              borderRadius: '24px', 
              backgroundColor: '#ffffff', 
              transition: 'all 0.4s cubic-bezier(0.16, 1, 0.3, 1)', 
              cursor: 'pointer',
              transform: hoveredId === 'botox' ? 'translateY(-8px)' : 'translateY(0)',
              boxShadow: hoveredId === 'botox' 
                ? '0 30px 60px -15px rgba(15, 107, 92, 0.12)' 
                : '0 10px 30px rgba(18, 33, 30, 0.02)'
            }}
            onClick={() => handleLearnMore('botox')}
          >
            <div className="treatment-card-img-wrapper" style={{ position: 'relative', height: '230px', overflow: 'hidden', marginBottom: '20px' }}>
              <img 
                src="/treatment_injectables.png" 
                alt="Botox & Dermal Fillers" 
                className="w-full h-full object-cover" 
                style={{ 
                  width: '100%', 
                  height: '100%', 
                  objectFit: 'cover',
                  transform: hoveredId === 'botox' ? 'scale(1.05)' : 'scale(1)',
                  transition: 'transform 0.6s cubic-bezier(0.16, 1, 0.3, 1)'
                }}
              />
            </div>
            <div style={{ padding: '0 24px 24px 24px', flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
              <h3 className="treatment-card-title" style={{ fontSize: '20px', fontWeight: '700', color: 'var(--text-dark)', marginBottom: '10px' }}>Botox & Dermal Fillers</h3>
              <p className="treatment-card-desc" style={{ fontSize: '14px', color: 'var(--text-muted)', marginBottom: '20px', lineHeight: '1.65', flexGrow: 1 }}>
                Smooth fine lines and restore natural volume to cheeks, lips, and under-eyes with premium FDA-approved injectables.
              </p>
              <button 
                onClick={(e) => {
                  e.stopPropagation();
                  handleLearnMore('botox');
                }} 
                className="treatment-card-link text-left"
                style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px', fontWeight: '700', color: 'var(--primary)' }}
              >
                Learn more <i className="fas fa-chevron-right" style={{ fontSize: '11px' }}></i>
              </button>
            </div>
          </div>

          {/* Peels Card */}
          <div 
            className="card treatment-card reveal delay-200" 
            onMouseEnter={() => setHoveredId('peel')}
            onMouseLeave={() => setHoveredId(null)}
            style={{ 
              display: 'flex', 
              flexDirection: 'column', 
              height: '100%', 
              overflow: 'hidden', 
              border: hoveredId === 'peel' ? '1px solid var(--primary)' : '1px solid var(--border)', 
              borderRadius: '24px', 
              backgroundColor: '#ffffff', 
              transition: 'all 0.4s cubic-bezier(0.16, 1, 0.3, 1)', 
              cursor: 'pointer',
              transform: hoveredId === 'peel' ? 'translateY(-8px)' : 'translateY(0)',
              boxShadow: hoveredId === 'peel' 
                ? '0 30px 60px -15px rgba(15, 107, 92, 0.12)' 
                : '0 10px 30px rgba(18, 33, 30, 0.02)'
            }}
            onClick={() => handleLearnMore('peel')}
          >
            <div className="treatment-card-img-wrapper" style={{ position: 'relative', height: '230px', overflow: 'hidden', marginBottom: '20px' }}>
              <img 
                src="/treatment_peels.png" 
                alt="Chemical Peels" 
                className="w-full h-full object-cover" 
                style={{ 
                  width: '100%', 
                  height: '100%', 
                  objectFit: 'cover',
                  transform: hoveredId === 'peel' ? 'scale(1.05)' : 'scale(1)',
                  transition: 'transform 0.6s cubic-bezier(0.16, 1, 0.3, 1)'
                }}
              />
            </div>
            <div style={{ padding: '0 24px 24px 24px', flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
              <h3 className="treatment-card-title" style={{ fontSize: '20px', fontWeight: '700', color: 'var(--text-dark)', marginBottom: '10px' }}>Chemical Peels</h3>
              <p className="treatment-card-desc" style={{ fontSize: '14px', color: 'var(--text-muted)', marginBottom: '20px', lineHeight: '1.65', flexGrow: 1 }}>
                Exfoliate dead cell layers and activate collagen with medical-grade salicylic, glycolic, and lactic acid peels.
              </p>
              <button 
                onClick={(e) => {
                  e.stopPropagation();
                  handleLearnMore('peel');
                }} 
                className="treatment-card-link text-left"
                style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px', fontWeight: '700', color: 'var(--primary)' }}
              >
                Learn more <i className="fas fa-chevron-right" style={{ fontSize: '11px' }}></i>
              </button>
            </div>
          </div>

          {/* Acne Card */}
          <div 
            className="card treatment-card reveal delay-300" 
            onMouseEnter={() => setHoveredId('acne')}
            onMouseLeave={() => setHoveredId(null)}
            style={{ 
              display: 'flex', 
              flexDirection: 'column', 
              height: '100%', 
              overflow: 'hidden', 
              border: hoveredId === 'acne' ? '1px solid var(--primary)' : '1px solid var(--border)', 
              borderRadius: '24px', 
              backgroundColor: '#ffffff', 
              transition: 'all 0.4s cubic-bezier(0.16, 1, 0.3, 1)', 
              cursor: 'pointer',
              transform: hoveredId === 'acne' ? 'translateY(-8px)' : 'translateY(0)',
              boxShadow: hoveredId === 'acne' 
                ? '0 30px 60px -15px rgba(15, 107, 92, 0.12)' 
                : '0 10px 30px rgba(18, 33, 30, 0.02)'
            }}
            onClick={() => handleLearnMore('acne')}
          >
            <div className="treatment-card-img-wrapper" style={{ position: 'relative', height: '230px', overflow: 'hidden', marginBottom: '20px' }}>
              <img 
                src="/treatment_acne.png" 
                alt="Advanced Acne Therapy" 
                className="w-full h-full object-cover" 
                style={{ 
                  width: '100%', 
                  height: '100%', 
                  objectFit: 'cover',
                  transform: hoveredId === 'acne' ? 'scale(1.05)' : 'scale(1)',
                  transition: 'transform 0.6s cubic-bezier(0.16, 1, 0.3, 1)'
                }}
              />
            </div>
            <div style={{ padding: '0 24px 24px 24px', flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
              <h3 className="treatment-card-title" style={{ fontSize: '20px', fontWeight: '700', color: 'var(--text-dark)', marginBottom: '10px' }}>Advanced Acne Therapy</h3>
              <p className="treatment-card-desc" style={{ fontSize: '14px', color: 'var(--text-muted)', marginBottom: '20px', lineHeight: '1.65', flexGrow: 1 }}>
                Target active hormonal breakouts and cystic inflammation using medical extractions and deep antibacterial light waves.
              </p>
              <button 
                onClick={(e) => {
                  e.stopPropagation();
                  handleLearnMore('acne');
                }} 
                className="treatment-card-link text-left"
                style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px', fontWeight: '700', color: 'var(--primary)' }}
              >
                Learn more <i className="fas fa-chevron-right" style={{ fontSize: '11px' }}></i>
              </button>
            </div>
          </div>
        </div>
      </div>

      <DetailModal 
        treatment={selectedTmpl}
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onBook={onSelectTreatment}
      />
    </section>
  );
}
