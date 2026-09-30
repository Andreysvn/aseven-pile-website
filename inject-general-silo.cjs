const fs = require('fs');

const path = 'src/pages/area-layanan/[kota].astro';
let c = fs.readFileSync(path, 'utf8');

const siloCode = `
  <!-- 8. Komponen Silo / Wilayah (Dinamis dari JSON) -->
  {cityData.groupedAreas && cityData.groupedAreas.length > 0 ? (
    <section class="container" style="margin-top: var(--space-8); padding-top: var(--space-8); border-top: 1px solid var(--color-border-light); margin-bottom: var(--space-12);">
      <h2 style="font-size: clamp(1.5rem, 3vw, 2rem); text-align: center; margin-bottom: var(--space-2); color: var(--color-primary);">Cakupan Layanan di {cityData.name}</h2>
      <p style="text-align: center; color: var(--color-text-muted); margin-bottom: var(--space-8); max-width: 600px; margin-left: auto; margin-right: auto;">Area operasional Aseven Pile mencakup seluruh wilayah kecamatan di {cityData.name} berikut.</p>
      
      <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: var(--space-6);">
        {cityData.groupedAreas.map((group: any) => (
          <div style="background: white; border: 1px solid #e2e8f0; border-radius: 12px; padding: var(--space-6); box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05); transition: transform 0.2s, box-shadow 0.2s;" class="hover:shadow-lg hover:-translate-y-1">
            <h3 style="font-size: 1.25rem; margin-bottom: var(--space-4); border-bottom: 2px solid #f1f5f9; padding-bottom: 12px;">
              <span style="color: var(--color-primary); font-weight: 700;">{group.groupName}</span>
            </h3>
            <div style="display: flex; flex-wrap: wrap; gap: 8px;">
              {group.areas.map((area: string) => (
                <span style="display: inline-block; padding: 6px 12px; background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 20px; font-size: 0.8rem; color: #475569;">
                  {area}
                </span>
              ))}
            </div>
          </div>
        ))}
      </div>
    </section>
  ) : (
    cityData.subAreas && cityData.subAreas.length > 0 && (
      <section class="container" style="margin-top: var(--space-8); padding-top: var(--space-8); border-top: 1px solid var(--color-border-light); margin-bottom: var(--space-12);">
        <h3 style="font-size: 1.2rem; margin-bottom: var(--space-2);">Area Layanan {cityData.name}</h3>
        <p style="color: var(--color-text-muted); font-size: 0.9rem; margin-bottom: var(--space-4);">Pilih area spesifik di {cityData.name} untuk melihat info lebih akurat:</p>
        <div style="display: flex; flex-wrap: wrap; gap: 8px;">
          {cityData.subAreas.map((area: any) => (
            <span style="display: inline-block; padding: 4px 12px; background: #f1f5f9; border: 1px solid #e2e8f0; border-radius: 16px; font-size: 0.85rem; color: #475569; font-weight: 500;">
              {area.name}
            </span>
          ))}
        </div>
      </section>
    )
  )}
`;

if (!c.includes('Cakupan Layanan di {cityData.name}')) {
  c = c.replace(/<\/section>\s*<div slot="below-cta"/s, '</section>\n' + siloCode + '\n  <div slot="below-cta"');
  fs.writeFileSync(path, c);
  console.log('Injected silo properly');
}
