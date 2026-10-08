const fs = require('fs');
let content = fs.readFileSync('src/components/ui/InteractiveCoverageMap.astro', 'utf8');

// Fix createPin
content = content.replace(
  /const createPin = \(fillColor, strokeColor\) => \{\s*return L\.divIcon\(\{[\s\S]*?\}\);\s*\};/,
  `const createPin = (fillColor, strokeColor) => {
      return L.divIcon({
        className: 'custom-pin-icon',
        html: '<div style="width: 48px; height: 48px; display: flex; align-items: center; justify-content: center;"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="' + fillColor + '" width="36" height="36" stroke="' + strokeColor + '" stroke-width="1.5" style="filter: drop-shadow(0px 4px 4px rgba(0,0,0,0.25)); pointer-events: none;"><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/></svg></div>',
        iconSize: [48, 48],
        iconAnchor: [24, 42],
        popupAnchor: [0, -42]
      });
    };`
);

// Fix cluster icon
content = content.replace(
  /return L\.divIcon\(\{\s*html: html,\s*className: 'custom-cluster-badge',\s*iconSize: L\.point\(0, 0\)\s*\}\);/,
  `return L.divIcon({
            html: '<div style="width: 48px; height: 48px; display: flex; align-items: center; justify-content: center;">' + html + '</div>',
            className: 'custom-cluster-badge',
            iconSize: L.point(48, 48)
          });`
);

// Fix workshopIcon
content = content.replace(
  /const workshopIcon = L\.divIcon\(\{\s*html: '<div style="background: #800000; width: 22px; height: 22px; border-radius: 50%; border: 3px solid white; box-shadow: 0 0 12px rgba\\(128,0,0,0\.7\\);">.*?<\/div>',\s*className: '',\s*iconSize: \[22, 22\],\s*iconAnchor: \[11, 11\]\s*\}\);/,
  `const workshopIcon = L.divIcon({
      html: '<div style="display:flex;align-items:center;justify-content:center;width:48px;height:48px;"><div style="background: #800000; width: 22px; height: 22px; border-radius: 50%; border: 3px solid white; box-shadow: 0 0 12px rgba(128,0,0,0.7);"></div></div>',
      className: '',
      iconSize: [48, 48],
      iconAnchor: [24, 24]
    });`
);

// Fix L.marker loops
content = content.replace(
  /const marker = L\.marker\(loc\.coords, \{\s*icon: icon,\s*city: loc\.city \/\/ pass custom property to marker\s*\}\);/g,
  `const marker = L.marker(loc.coords, { 
         icon: icon,
         alt: loc.name || 'Lokasi ' + (loc.city || ''),
         title: loc.name || 'Lokasi ' + (loc.city || ''),
         city: loc.city // pass custom property to marker
      });`
);

content = content.replace(
  /const workshopMarker = L\.marker\(workshopCoords, \{ icon: workshopIcon, zIndexOffset: 1000 \}\)\.addTo\(map\);/,
  `const workshopMarker = L.marker(workshopCoords, { icon: workshopIcon, zIndexOffset: 1000, alt: 'Workshop Aseven Pile', title: 'Workshop Pusat ASeven Pile' }).addTo(map);`
);

fs.writeFileSync('src/components/ui/InteractiveCoverageMap.astro', content);
