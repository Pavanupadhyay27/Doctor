'use client';

import React from 'react';

export default function DetailModal({ treatment, isOpen, onClose, onBook }) {
  if (!isOpen || !treatment) return null;

  let treatmentDescription = '';
  if (treatment.id === 'laser') {
    treatmentDescription = `
      <p style="margin-bottom:12px">Laser Skin Resurfacing uses short, concentrated pulsating beams of light to treat skin issues such as fine wrinkles, blemishes, acne scars, and uneven skin tone.</p>
      <p style="margin-bottom:12px"><b>How it works:</b> The laser beam gently removes the outer layer of skin (epidermis) while heating the underlying skin (dermis), which stimulates growth of new collagen fibers.</p>
      <p style="margin-bottom:12px"><b>Best for:</b> Sun damage, mild wrinkles, acne scarring, hyperpigmentation, age spots.</p>
      <p><b>Recovery steps:</b> Apply moisturizer daily, avoid sun exposure, and expect minor peeling and redness similar to a mild sunburn for 3-5 days.</p>
    `;
  } else if (treatment.id === 'botox') {
    treatmentDescription = `
      <p style="margin-bottom:12px">Botox injectables temporarily block nerve signals in targeted muscles, causing them to relax and softening wrinkles. Fillers restore lost volume, plump lips, and lift cheeks.</p>
      <p style="margin-bottom:12px"><b>How it works:</b> A few small injections are administered with micro-needles. Results for Botox peak at 7-14 days and last 3-4 months. Fillers show immediate results and last 6-18 months.</p>
      <p style="margin-bottom:12px"><b>Best for:</b> Crow's feet, forehead lines, lip augmentation, nasolabial folds.</p>
      <p><b>Recovery steps:</b> No downtime. Avoid strenuous exercise, lying down flat, or rubbing the injection sites for 4 hours post-treatment.</p>
    `;
  } else if (treatment.id === 'peel') {
    treatmentDescription = `
      <p style="margin-bottom:12px">Chemical Peels apply a specialized acidic solution to peel away dead outer skin layers, revealing healthier, smoother, glowing skin underneath.</p>
      <p style="margin-bottom:12px"><b>How it works:</b> Salicylic, glycolic, or lactic acids are brushed onto the face, exfoliating cell bonds. Ideal for regular monthly skin maintenance.</p>
      <p style="margin-bottom:12px"><b>Best for:</b> Dull skin, clogged pores, superficial acne scars, active blackheads, uneven texture.</p>
      <p><b>Recovery steps:</b> Expect mild flaking on days 2-3. Keep skin hydrated and apply SPF 50 daily.</p>
    `;
  } else if (treatment.id === 'acne') {
    treatmentDescription = `
      <p style="margin-bottom:12px">Our Clinical Acne Treatment combines medical-grade extractions, high-frequency antibacterial therapy, and calming custom masks to combat inflammation and blemishes.</p>
      <p style="margin-bottom:12px"><b>How it works:</b> A customized system targets acne bacteria, opens blocked follicles, and balances oil production. Usually performed in a series of sessions.</p>
      <p style="margin-bottom:12px"><b>Best for:</b> Active hormonal acne, cystic lesions, clogged blackheads, post-inflammatory erythema.</p>
      <p><b>Recovery steps:</b> Mild redness for 2-4 hours. Do not pick skin. Drink plenty of water.</p>
    `;
  }

  return (
    <div className="modal-backdrop active" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close" onClick={onClose}>
          <i className="fas fa-times"></i>
        </button>
        <span className="section-tag" style={{ marginBottom: '8px' }}>Clinical Treatment Spec</span>
        <h2 style={{ fontSize: '24px', fontWeight: '700', marginBottom: '20px' }}>{treatment.name}</h2>
        
        {/* Key Stats Row */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px', marginBottom: '24px', padding: '16px', backgroundColor: 'var(--bg-warm)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)' }}>
          <div>
            <span style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: '600', textTransform: 'uppercase' }}>Duration</span>
            <div style={{ fontWeight: '700', fontSize: '14px', color: 'var(--primary)' }}>{treatment.duration}</div>
          </div>
          <div>
            <span style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: '600', textTransform: 'uppercase' }}>Price Range</span>
            <div style={{ fontWeight: '700', fontSize: '14px', color: 'var(--primary)' }}>{treatment.price}</div>
          </div>
          <div>
            <span style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: '600', textTransform: 'uppercase' }}>Recovery</span>
            <div style={{ fontWeight: '700', fontSize: '14px', color: 'var(--primary)' }}>{treatment.recovery}</div>
          </div>
        </div>

        {/* Description contents */}
        <div 
          style={{ fontSize: '14px', lineHeight: '1.6', color: 'var(--text-muted)', marginBottom: '32px' }}
          dangerouslySetInnerHTML={{ __html: treatmentDescription }}
        />
        
        <div style={{ display: 'flex', gap: '16px' }}>
          <button 
            onClick={() => {
              onBook(treatment.name);
              onClose();
            }} 
            className="btn btn-accent flex-grow"
          >
            Schedule Session Now
          </button>
          <button onClick={onClose} className="btn btn-secondary">
            Close Specs
          </button>
        </div>
      </div>
    </div>
  );
}
