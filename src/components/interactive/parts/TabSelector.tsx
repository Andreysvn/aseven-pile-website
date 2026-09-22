import React from 'react';

interface TabSelectorProps {
  activeTab: 'borepile' | 'strauss';
  onChange: (tab: 'borepile' | 'strauss') => void;
}

export default function TabSelector({ activeTab, onChange }: TabSelectorProps) {
  return (
    <div className="calc-tabs">
      <button className={`tab-btn ${activeTab === 'borepile' ? 'active' : ''}`} onClick={() => onChange('borepile')}>
        Bore Pile (Mesin)
      </button>
      <button className={`tab-btn ${activeTab === 'strauss' ? 'active' : ''}`} onClick={() => onChange('strauss')}>
        Strauss Pile (Manual)
      </button>
    </div>
  );
}
