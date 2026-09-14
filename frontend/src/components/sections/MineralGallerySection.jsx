// Critical Mineral Ore Gallery — React Bits AccordionGallery
// Interactive ore specimen showcase placed under the Technology Mapping section

import React from 'react';
import AccordionGallery from '../common/AccordionGallery';

const ORE_ITEMS = [
  { image: '/minerals/lithium.jpg', label: 'Lithium Ore', alt: 'Lithium ore specimen' },
  { image: '/minerals/cobalt.jpg', label: 'Cobalt Ore', alt: 'Raw cobalt ore with blue translucent crystals' },
  { image: '/minerals/graphite.jpg', label: 'Graphite Ore', alt: 'Graphite ore mine face' },
  { image: '/minerals/gallium.jpg', label: 'Gallium Metal', alt: 'High-purity gallium metal' },
  { image: '/minerals/iron.webp', label: 'Iron Ore', alt: 'Iron ore deposit' },
];

export default function MineralGallerySection() {
  return (
    <section id="ore-gallery" className="section-spacing" style={{ background: 'var(--color-lavender-mist)', padding: '72px 0', width: '100%', overflowX: 'clip', boxSizing: 'border-box' }}>
      <div className="page-container" style={{ maxWidth: '1360px', width: '100%', boxSizing: 'border-box' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: '20px', marginBottom: '32px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
              <span className="badge badge-indigo">Ore Specimens</span>
              <span className="badge">Hover to Expand</span>
            </div>
            <h2 style={{ fontSize: '38px', fontWeight: 500, letterSpacing: '-0.02em', color: 'var(--color-ink)' }}>
              Critical Mineral Ores
            </h2>
          </div>

          <p style={{ color: 'var(--color-graphite)', fontSize: '14px', maxWidth: '480px', lineHeight: 1.55 }}>
            A visual reference of the strategic ore bodies tracked on this platform — hover or tap a panel to inspect each specimen.
          </p>
        </div>

        <AccordionGallery
          items={ORE_ITEMS}
          defaultIndex={0}
          expandRatio={0.52}
          trigger="hover"
          height={460}
          gap={10}
          radius={15}
        />
      </div>
    </section>
  );
}
