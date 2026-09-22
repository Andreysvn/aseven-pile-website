import "../../styles/calculator.css";
import React from 'react';
import { useCalculator } from './useCalculator';
import type { CalculatorDefaults } from './useCalculator';
import { asevenCalculatorConfig } from './calculator.config';
import TabSelector from './parts/TabSelector';
import LocationSelect from './parts/LocationSelect';
import RoadAccessInput from './parts/RoadAccessInput';
import ToolSelector from './parts/ToolSelector';
import DiameterSelector from './parts/DiameterSelector';
import DepthPointInputs from './parts/DepthPointInputs';
import PileVisualizer from './parts/PileVisualizer';
import PackageSelect from './parts/PackageSelect';
import ResultDisplay from './parts/ResultDisplay';
import MaterialEstimate from './parts/MaterialEstimate';

interface CalculatorUIProps {
  config?: typeof asevenCalculatorConfig;
  title?: string;
  description?: string;
  defaults?: { location?: string; tab?: 'borepile' | 'strauss'; diameter?: number };
}

export default function CalculatorUI({ config = asevenCalculatorConfig, title, description, defaults }: CalculatorUIProps) {
  const calc = useCalculator(config, defaults);

  const tooltip = calc.activeTab === 'borepile'
    ? "Mini crane dan Gawangan adalah alat berat."
    : "Pengeboran manual tenaga manusia, cocok untuk pondasi dangkal";

  const serviceName = calc.activeTab === 'borepile' ? 'Bore Pile' : 'Strauss Pile';
  const displayTitle = title 
    ? title.replace('{service}', serviceName)
    : `Kalkulator Estimasi Biaya ${serviceName}`;

  return (
    <div className="calc-wrapper">
      <div className="calc-header">
        <h3 className="calc-title">{displayTitle}</h3>
        <p className="calc-desc">{description || "Hitung cepat, harga transparan, dan akurat."}</p>
      </div>

      <TabSelector activeTab={calc.activeTab} onChange={calc.handleTabChange} />

      <div className="calc-body">
        <LocationSelect 
          locations={config.locations} 
          value={calc.location} 
          onChange={calc.setLocation} 
        />

        {calc.activeTab === 'borepile' && (
          <RoadAccessInput 
            value={calc.roadAccess} 
            onChange={calc.setRoadAccess} 
            tool={calc.tool} 
            showWarning={calc.tool === 'gawangan' && calc.roadAccess === 'narrow'} 
          />
        )}

        <ToolSelector options={calc.toolOptions} value={calc.tool} onChange={calc.setTool} tooltip={tooltip} />

        <DiameterSelector diameters={calc.availableDiameters} value={calc.diameter} onChange={calc.setDiameter} />

        <DepthPointInputs
          depth={calc.depth}
          points={calc.points}
          onDepthChange={calc.setDepth}
          onPointsChange={calc.setPoints}
          maxDepth={calc.activeTab === 'strauss' ? 6 : 30}
        />

        <PackageSelect value={calc.packageType} onChange={calc.setPackageType} />

        <PileVisualizer 
          tool={calc.tool} 
          depth={calc.depth} 
          diameter={calc.diameter} 
          packageType={calc.packageType} 
        />

        {calc.packageType === 'allin' && (
          <small className="allin-note" style={{ display: 'block', textAlign: 'center', marginTop: '-12px', marginBottom: '16px', color: '#c2410c' }}>
            *Estimasi material menggunakan besi SNI & beton K-250 - K-300.
          </small>
        )}
      </div>

      <div className="calc-footer">
        <ResultDisplay
          calculation={calc.calculation}
          packageType={calc.packageType}
          activeTab={calc.activeTab}
          includeMob={calc.includeMob}
          onToggleMob={calc.setIncludeMob}
          formatRupiah={calc.formatRupiah}
          lumpsumMinimum={config.lumpsumMinimum[calc.activeTab]}
          waUrl={calc.generateWaUrl()}
        />

        {calc.calculation.totalMeters > 0 && calc.packageType === 'jasa' && (
          <MaterialEstimate materials={calc.materials} />
        )}

        <a href={calc.generateWaUrl()} target="_blank" rel="noopener noreferrer" className="calc-cta-btn" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" viewBox="0 0 24 24">
            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51l-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
          </svg>
          Konsultasi via WhatsApp
        </a>
      </div>
    </div>
  );
}
