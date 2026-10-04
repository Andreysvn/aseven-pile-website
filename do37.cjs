const fs = require('fs');
let text = fs.readFileSync('src/components/ui/CostExample.astro', 'utf8');

text = text.replace(
  'interface Props {\n  ex:',
  'interface Props {\n  method?: "borepile" | "strauss";\n  ex:'
);

text = text.replace(
  'const { ex, title, description, caseNote } = Astro.props;',
  'const { ex, title, description, caseNote, method = "borepile" } = Astro.props;\nconst methodText = method === "strauss" ? "Strauss Pile Manual" : "Bore Pile Mesin (Mini Crane)";'
);

const oldBlock = `<div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 8px; padding: 12px 0;">
          <div style="color: #64748b; font-size: 0.95rem;">Jumlah Titik</div>
          <div style="font-weight: 600; color: #0f172a; text-align: right;">{item.points} titik</div>
        </div>`;

const newBlock = `<div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 8px; padding: 12px 0; border-bottom: 1px solid #e2e8f0;">
          <div style="color: #64748b; font-size: 0.95rem;">Jumlah Titik</div>
          <div style="font-weight: 600; color: #0f172a; text-align: right;">{item.points} titik</div>
        </div>
        <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 8px; padding: 12px 0;">
          <div style="color: #64748b; font-size: 0.95rem;">Metode</div>
          <div style="font-weight: 600; color: #0f172a; text-align: right;">{methodText}</div>
        </div>`;

text = text.replace(oldBlock, newBlock);

fs.writeFileSync('src/components/ui/CostExample.astro', text);
