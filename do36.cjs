const fs = require('fs');
let text = fs.readFileSync('src/components/ui/CostExample.astro', 'utf8');
text = text.replace(
  '<div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 8px; padding: 12px 0;">\n          <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 8px; padding: 12px 0;">\n          <div style="color: #64748b; font-size: 0.95rem;">Jumlah Titik</div>\n          <div style="font-weight: 600; color: #0f172a; text-align: right;">{item.points} titik</div>\n        </div>',
  '<div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 8px; padding: 12px 0;">\n          <div style="color: #64748b; font-size: 0.95rem;">Jumlah Titik</div>\n          <div style="font-weight: 600; color: #0f172a; text-align: right;">{item.points} titik</div>\n        </div>'
);
fs.writeFileSync('src/components/ui/CostExample.astro', text);
