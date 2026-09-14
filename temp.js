
  function initCoverageMap() {
    const mapContainer = document.getElementById('coverage-map');
    if (!mapContainer || mapContainer._leaflet_id) return;

    // Fokus utama ke area Jakarta (zoom level 10)
    const map = L.map('coverage-map', {
      scrollWheelZoom: false,
      zoomControl: false
    }).setView([-6.2000, 106.8166], 10);

    // Zoom control on top right
    L.control.zoom({ position: 'topright' }).addTo(map);

    // CartoDB Positron Basemap (Elegant)
    L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
      attribution: '&copy; <a href="https://carto.com/attributions">CARTO</a>',
      subdomains: 'abcd',
      maxZoom: 18
    }).addTo(map);

    // SVG Icon Creator
    const createPin = (fillColor, strokeColor) => {
      return L.divIcon({
        className: 'custom-pin-icon',
        html: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="${fillColor}" width="36" height="36" stroke="${strokeColor}" stroke-width="1.5" style="filter: drop-shadow(0px 4px 4px rgba(0,0,0,0.25));">
                <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
               </svg>`,
        iconSize: [36, 36],
        iconAnchor: [18, 36],
        popupAnchor: [0, -32]
      });
    };

    const primaryIcon = createPin('#800000', '#ffffff'); // Maroon (HQ)
    const secondaryIcon = createPin('#FFA000', '#ffffff'); // Yellow/Gold
    const tertiaryIcon = createPin('#10B981', '#ffffff'); // Green (Specific Area)

    
    // INITIALIZE CLUSTER GROUP (Sistem Hierarki Alami)
    
      const markers = L.markerClusterGroup({
        maxClusterRadius: 80, // slightly larger to group cities well
        spiderfyOnMaxZoom: true, // enable smooth expanding when clicked
        showCoverageOnHover: false,
        zoomOutOfBoundsOnClick: true,
        iconCreateFunction: function(cluster) {
          const children = cluster.getAllChildMarkers();
          
          // Hitung dominasi kota di dalam cluster ini
          const cityCounts = {};
          let maxCity = 'Area';
          let maxCount = 0;
          
          children.forEach(m => {
            const city = m.options.city || 'Area';
            cityCounts[city] = (cityCounts[city] || 0) + 1;
            if (cityCounts[city] > maxCount) {
              maxCount = cityCounts[city];
              maxCity = city;
            }
          });

          const html = `
            <div style="background: #10B981; color: white; padding: 6px 14px; border-radius: 20px; font-weight: 700; border: 3px solid white; box-shadow: 0 4px 12px rgba(0,0,0,0.25); font-size: 14px; white-space: nowrap; text-align: center; position: absolute; transform: translate(-50%, -50%);">
              ${maxCity} <span style="background: white; color: #10B981; padding: 2px 6px; border-radius: 12px; font-size: 11px; margin-left: 4px;">${children.length}</span>
            </div>
          `;

          return L.divIcon({
            html: html,
            className: 'custom-cluster-badge',
            iconSize: L.point(0, 0)
          });
        }
      });

      const locations = [
  { name: "Menteng (Jakarta)", level: "district", queryName: "Menteng, Jakarta, Indonesia", type: "area", coords: [-6.19446, 106.83248], desc: "Layanan bore pile profesional untuk wilayah Menteng.", city: "Jakarta"  },
  { name: "Senen (Jakarta)", level: "district", queryName: "Senen, Jakarta, Indonesia", type: "area", coords: [-6.19386, 106.8503], desc: "Layanan bore pile profesional untuk wilayah Senen.", city: "Jakarta"  },
  { name: "Tanah Abang (Jakarta)", level: "district", queryName: "Tanah Abang, Jakarta, Indonesia", type: "area", coords: [-6.20889, 106.80781], desc: "Layanan bore pile profesional untuk wilayah Tanah Abang.", city: "Jakarta"  },
  { name: "Gambir (Jakarta)", level: "district", queryName: "Gambir, Jakarta, Indonesia", type: "area", coords: [-6.17095, 106.8185], desc: "Layanan bore pile profesional untuk wilayah Gambir.", city: "Jakarta"  },
  { name: "Kemayoran (Jakarta)", level: "district", queryName: "Kemayoran, Jakarta, Indonesia", type: "area", coords: [-6.16366, 106.85955], desc: "Layanan bore pile profesional untuk wilayah Kemayoran.", city: "Jakarta"  },
  { name: "Cempaka Putih (Jakarta)", level: "district", queryName: "Cempaka Putih, Jakarta, Indonesia", type: "area", coords: [-6.17795, 106.86834], desc: "Layanan bore pile profesional untuk wilayah Cempaka Putih.", city: "Jakarta"  },
  { name: "Johar Baru (Jakarta)", level: "district", queryName: "Johar Baru, Jakarta, Indonesia", type: "area", coords: [-6.18019, 106.85355], desc: "Layanan bore pile profesional untuk wilayah Johar Baru.", city: "Jakarta"  },
  { name: "Sawah Besar (Jakarta)", level: "district", queryName: "Sawah Besar, Jakarta, Indonesia", type: "area", coords: [-6.15129, 106.83352], desc: "Layanan bore pile profesional untuk wilayah Sawah Besar.", city: "Jakarta"  },
  { name: "Kebayoran Baru (Jakarta)", level: "district", queryName: "Kebayoran Baru, Jakarta, Indonesia", type: "area", coords: [-6.2413, 106.79987], desc: "Layanan bore pile profesional untuk wilayah Kebayoran Baru.", city: "Jakarta"  },
  { name: "Kebayoran Lama (Jakarta)", level: "district", queryName: "Kebayoran Lama, Jakarta, Indonesia", type: "area", coords: [-6.27688, 106.78085], desc: "Layanan bore pile profesional untuk wilayah Kebayoran Lama.", city: "Jakarta"  },
  { name: "Pesanggrahan (Jakarta)", level: "district", queryName: "Pesanggrahan, Jakarta, Indonesia", type: "area", coords: [-6.23282, 106.75507], desc: "Layanan bore pile profesional untuk wilayah Pesanggrahan.", city: "Jakarta"  },
  { name: "Cilandak (Jakarta)", level: "district", queryName: "Cilandak, Jakarta, Indonesia", type: "area", coords: [-6.30172, 106.79246], desc: "Layanan bore pile profesional untuk wilayah Cilandak.", city: "Jakarta"  },
  { name: "Pasar Minggu (Jakarta)", level: "district", queryName: "Pasar Minggu, Jakarta, Indonesia", type: "area", coords: [-6.29141, 106.82492], desc: "Layanan bore pile profesional untuk wilayah Pasar Minggu.", city: "Jakarta"  },
  { name: "Jagakarsa (Jakarta)", level: "district", queryName: "Jagakarsa, Jakarta, Indonesia", type: "area", coords: [-6.33836, 106.8187], desc: "Layanan bore pile profesional untuk wilayah Jagakarsa.", city: "Jakarta"  },
  { name: "Mampang Prapatan (Jakarta)", level: "district", queryName: "Mampang Prapatan, Jakarta, Indonesia", type: "area", coords: [-6.2447, 106.82399], desc: "Layanan bore pile profesional untuk wilayah Mampang Prapatan.", city: "Jakarta"  },
  { name: "Pancoran (Jakarta)", level: "district", queryName: "Pancoran, Jakarta, Indonesia", type: "area", coords: [-6.25287, 106.84544], desc: "Layanan bore pile profesional untuk wilayah Pancoran.", city: "Jakarta"  },
  { name: "Tebet (Jakarta)", level: "district", queryName: "Tebet, Jakarta, Indonesia", type: "area", coords: [-6.23126, 106.85166], desc: "Layanan bore pile profesional untuk wilayah Tebet.", city: "Jakarta"  },
  { name: "Setiabudi (Jakarta)", level: "district", queryName: "Setiabudi, Jakarta, Indonesia", type: "area", coords: [-6.21489, 106.83051], desc: "Layanan bore pile profesional untuk wilayah Setiabudi.", city: "Jakarta"  },
  { name: "Kebon Jeruk (Jakarta)", level: "district", queryName: "Kebon Jeruk, Jakarta, Indonesia", type: "area", coords: [-6.17382, 106.76696], desc: "Layanan bore pile profesional untuk wilayah Kebon Jeruk.", city: "Jakarta"  },
  { name: "Kembangan (Jakarta)", level: "district", queryName: "Kembangan, Jakarta, Indonesia", type: "area", coords: [-6.20519, 106.74319], desc: "Layanan bore pile profesional untuk wilayah Kembangan.", city: "Jakarta"  },
  { name: "Cengkareng (Jakarta)", level: "district", queryName: "Cengkareng, Jakarta, Indonesia", type: "area", coords: [-6.14528, 106.73595], desc: "Layanan bore pile profesional untuk wilayah Cengkareng.", city: "Jakarta"  },
  { name: "Grogol Petamburan (Jakarta)", level: "district", queryName: "Grogol Petamburan, Jakarta, Indonesia", type: "area", coords: [-6.15458, 106.78302], desc: "Layanan bore pile profesional untuk wilayah Grogol Petamburan.", city: "Jakarta"  },
  { name: "Palmerah (Jakarta)", level: "district", queryName: "Palmerah, Jakarta, Indonesia", type: "area", coords: [-6.19441, 106.7921], desc: "Layanan bore pile profesional untuk wilayah Palmerah.", city: "Jakarta"  },
  { name: "Kalideres (Jakarta)", level: "district", queryName: "Kalideres, Jakarta, Indonesia", type: "area", coords: [-6.12743, 106.70157], desc: "Layanan bore pile profesional untuk wilayah Kalideres.", city: "Jakarta"  },
  { name: "Taman Sari (Jakarta)", level: "district", queryName: "Taman Sari, Jakarta, Indonesia", type: "area", coords: [-6.152, 106.81958], desc: "Layanan bore pile profesional untuk wilayah Taman Sari.", city: "Jakarta"  },
  { name: "Tambora (Jakarta)", level: "district", queryName: "Tambora, Jakarta, Indonesia", type: "area", coords: [-6.14949, 106.80365], desc: "Layanan bore pile profesional untuk wilayah Tambora.", city: "Jakarta"  },
  { name: "Penjaringan (Jakarta)", level: "district", queryName: "Penjaringan, Jakarta, Indonesia", type: "area", coords: [-6.12612, 106.78501], desc: "Layanan bore pile profesional untuk wilayah Penjaringan.", city: "Jakarta"  },
  { name: "Pademangan (Jakarta)", level: "district", queryName: "Pademangan, Jakarta, Indonesia", type: "area", coords: [-6.13282, 106.83952], desc: "Layanan bore pile profesional untuk wilayah Pademangan.", city: "Jakarta"  },
  { name: "Tanjung Priok (Jakarta)", level: "district", queryName: "Tanjung Priok, Jakarta, Indonesia", type: "area", coords: [-6.13694, 106.87362], desc: "Layanan bore pile profesional untuk wilayah Tanjung Priok.", city: "Jakarta"  },
  { name: "Koja (Jakarta)", level: "district", queryName: "Koja, Jakarta, Indonesia", type: "area", coords: [-6.12558, 106.90653], desc: "Layanan bore pile profesional untuk wilayah Koja.", city: "Jakarta"  },
  { name: "Kelapa Gading (Jakarta)", level: "district", queryName: "Kelapa Gading, Jakarta, Indonesia", type: "area", coords: [-6.16065, 106.90288], desc: "Layanan bore pile profesional untuk wilayah Kelapa Gading.", city: "Jakarta"  },
  { name: "Cilincing (Jakarta)", level: "district", queryName: "Cilincing, Jakarta, Indonesia", type: "area", coords: [-6.1279, 106.94536], desc: "Layanan bore pile profesional untuk wilayah Cilincing.", city: "Jakarta"  },
  { name: "Matraman (Jakarta)", level: "district", queryName: "Matraman, Jakarta, Indonesia", type: "area", coords: [-6.20285, 106.8645], desc: "Layanan bore pile profesional untuk wilayah Matraman.", city: "Jakarta"  },
  { name: "Pulo Gadung (Jakarta)", level: "district", queryName: "Pulo Gadung, Jakarta, Indonesia", type: "area", coords: [-6.19754, 106.8897], desc: "Layanan bore pile profesional untuk wilayah Pulo Gadung.", city: "Jakarta"  },
  { name: "Jatinegara (Jakarta)", level: "district", queryName: "Jatinegara, Jakarta, Indonesia", type: "area", coords: [-6.22735, 106.87775], desc: "Layanan bore pile profesional untuk wilayah Jatinegara.", city: "Jakarta"  },
  { name: "Duren Sawit (Jakarta)", level: "district", queryName: "Duren Sawit, Jakarta, Indonesia", type: "area", coords: [-6.23153, 106.91513], desc: "Layanan bore pile profesional untuk wilayah Duren Sawit.", city: "Jakarta"  },
  { name: "Kramat Jati (Jakarta)", level: "district", queryName: "Kramat Jati, Jakarta, Indonesia", type: "area", coords: [-6.28203, 106.86153], desc: "Layanan bore pile profesional untuk wilayah Kramat Jati.", city: "Jakarta"  },
  { name: "Makasar (Jakarta)", level: "district", queryName: "Makasar, Jakarta, Indonesia", type: "area", coords: [-6.25669, 106.8891], desc: "Layanan bore pile profesional untuk wilayah Makasar.", city: "Jakarta"  },
  { name: "Pasar Rebo (Jakarta)", level: "district", queryName: "Pasar Rebo, Jakarta, Indonesia", type: "area", coords: [-6.32802, 106.8537], desc: "Layanan bore pile profesional untuk wilayah Pasar Rebo.", city: "Jakarta"  },
  { name: "Ciracas (Jakarta)", level: "district", queryName: "Ciracas, Jakarta, Indonesia", type: "area", coords: [-6.32413, 106.87591], desc: "Layanan bore pile profesional untuk wilayah Ciracas.", city: "Jakarta"  },
  { name: "Cipayung (Jakarta)", level: "district", queryName: "Cipayung, Jakarta, Indonesia", type: "area", coords: [-6.31623, 106.90377], desc: "Layanan bore pile profesional untuk wilayah Cipayung.", city: "Jakarta"  },
  { name: "Cakung (Jakarta)", level: "district", queryName: "Cakung, Jakarta, Indonesia", type: "area", coords: [-6.18747, 106.94573], desc: "Layanan bore pile profesional untuk wilayah Cakung.", city: "Jakarta"  },
  { name: "Kecamatan Babelan (Bekasi)", level: "district", queryName: "Kecamatan Babelan, Bekasi, Jawa Barat", type: "area", coords: [-6.166, 107.02898], desc: "Layanan bore pile profesional untuk wilayah Kecamatan Babelan.", city: "Bekasi"  },
  { name: "Kecamatan Cibitung (Bekasi)", level: "district", queryName: "Kecamatan Cibitung, Bekasi, Jawa Barat", type: "area", coords: [-6.23122, 107.10907], desc: "Layanan bore pile profesional untuk wilayah Kecamatan Cibitung.", city: "Bekasi"  },
  { name: "Kecamatan Tarumajaya (Bekasi)", level: "district", queryName: "Kecamatan Tarumajaya, Bekasi, Jawa Barat", type: "area", coords: [-6.11359, 106.99651], desc: "Layanan bore pile profesional untuk wilayah Kecamatan Tarumajaya.", city: "Bekasi"  },
  { name: "Kecamatan Cikarang Barat (Bekasi)", level: "district", queryName: "Kecamatan Cikarang Barat, Bekasi, Jawa Barat", type: "area", coords: [-6.30748, 107.09061], desc: "Layanan bore pile profesional untuk wilayah Kecamatan Cikarang Barat.", city: "Bekasi"  },
  { name: "Kecamatan Cikarang Pusat (Bekasi)", level: "district", queryName: "Kecamatan Cikarang Pusat, Bekasi, Jawa Barat", type: "area", coords: [-6.37107, 107.18593], desc: "Layanan bore pile profesional untuk wilayah Kecamatan Cikarang Pusat.", city: "Bekasi"  },
  { name: "Kecamatan Cikarang Selatan (Bekasi)", level: "district", queryName: "Kecamatan Cikarang Selatan, Bekasi, Jawa Barat", type: "area", coords: [-6.3301, 107.13319], desc: "Layanan bore pile profesional untuk wilayah Kecamatan Cikarang Selatan.", city: "Bekasi"  },
  { name: "Kecamatan Cikarang Timur (Bekasi)", level: "district", queryName: "Kecamatan Cikarang Timur, Bekasi, Jawa Barat", type: "area", coords: [-6.28915, 107.20601], desc: "Layanan bore pile profesional untuk wilayah Kecamatan Cikarang Timur.", city: "Bekasi"  },
  { name: "Kecamatan Cikarang Utara (Bekasi)", level: "district", queryName: "Kecamatan Cikarang Utara, Bekasi, Jawa Barat", type: "area", coords: [-6.26812, 107.16261], desc: "Layanan bore pile profesional untuk wilayah Kecamatan Cikarang Utara.", city: "Bekasi"  },
  { name: "Kecamatan Tambun Selatan (Bekasi)", level: "district", queryName: "Kecamatan Tambun Selatan, Bekasi, Jawa Barat", type: "area", coords: [-6.26568, 107.04651], desc: "Layanan bore pile profesional untuk wilayah Kecamatan Tambun Selatan.", city: "Bekasi"  },
  { name: "Kecamatan Bantar Gebang (Bekasi)", level: "district", queryName: "Kecamatan Bantar Gebang, Bekasi, Jawa Barat", type: "area", coords: [-6.34211, 106.98967], desc: "Layanan bore pile profesional untuk wilayah Kecamatan Bantar Gebang.", city: "Bekasi"  },
  { name: "Kecamatan Bekasi Barat (Bekasi)", level: "district", queryName: "Kecamatan Bekasi Barat, Bekasi, Jawa Barat", type: "area", coords: [-6.23444, 106.96287], desc: "Layanan bore pile profesional untuk wilayah Kecamatan Bekasi Barat.", city: "Bekasi"  },
  { name: "Kecamatan Bekasi Selatan (Bekasi)", level: "district", queryName: "Kecamatan Bekasi Selatan, Bekasi, Jawa Barat", type: "area", coords: [-6.26657, 106.96999], desc: "Layanan bore pile profesional untuk wilayah Kecamatan Bekasi Selatan.", city: "Bekasi"  },
  { name: "Kecamatan Bekasi Timur (Bekasi)", level: "district", queryName: "Kecamatan Bekasi Timur, Bekasi, Jawa Barat", type: "area", coords: [-6.23842, 107.02141], desc: "Layanan bore pile profesional untuk wilayah Kecamatan Bekasi Timur.", city: "Bekasi"  },
  { name: "Kecamatan Bekasi Utara (Bekasi)", level: "district", queryName: "Kecamatan Bekasi Utara, Bekasi, Jawa Barat", type: "area", coords: [-6.21083, 107.00525], desc: "Layanan bore pile profesional untuk wilayah Kecamatan Bekasi Utara.", city: "Bekasi"  },
  { name: "Kecamatan Jatiasih (Bekasi)", level: "district", queryName: "Kecamatan Jatiasih, Bekasi, Jawa Barat", type: "area", coords: [-6.29547, 106.95407], desc: "Layanan bore pile profesional untuk wilayah Kecamatan Jatiasih.", city: "Bekasi"  },
  { name: "Kecamatan Jatisampurna (Bekasi)", level: "district", queryName: "Kecamatan Jatisampurna, Bekasi, Jawa Barat", type: "area", coords: [-6.36298, 106.92867], desc: "Layanan bore pile profesional untuk wilayah Kecamatan Jatisampurna.", city: "Bekasi"  },
  { name: "Kecamatan Medan Satria (Bekasi)", level: "district", queryName: "Kecamatan Medan Satria, Bekasi, Jawa Barat", type: "area", coords: [-6.18364, 106.9828], desc: "Layanan bore pile profesional untuk wilayah Kecamatan Medan Satria.", city: "Bekasi"  },
  { name: "Kecamatan Mustika Jaya (Bekasi)", level: "district", queryName: "Kecamatan Mustika Jaya, Bekasi, Jawa Barat", type: "area", coords: [-6.30451, 107.01794], desc: "Layanan bore pile profesional untuk wilayah Kecamatan Mustika Jaya.", city: "Bekasi"  },
  { name: "Kecamatan Pondok Gede (Bekasi)", level: "district", queryName: "Kecamatan Pondok Gede, Bekasi, Jawa Barat", type: "area", coords: [-6.26994, 106.92392], desc: "Layanan bore pile profesional untuk wilayah Kecamatan Pondok Gede.", city: "Bekasi"  },
  { name: "Kecamatan Pondok Melati (Bekasi)", level: "district", queryName: "Kecamatan Pondok Melati, Bekasi, Jawa Barat", type: "area", coords: [-6.3208, 106.93144], desc: "Layanan bore pile profesional untuk wilayah Kecamatan Pondok Melati.", city: "Bekasi"  },
  { name: "Kecamatan Rawalumbu (Bekasi)", level: "district", queryName: "Kecamatan Rawalumbu, Bekasi, Jawa Barat", type: "area", coords: [-6.2713, 107.00201], desc: "Layanan bore pile profesional untuk wilayah Kecamatan Rawalumbu.", city: "Bekasi"  },
  { name: "Kecamatan Beji (Depok)", level: "district", queryName: "Kecamatan Beji, Depok, Jawa Barat", type: "area", coords: [-6.37546, 106.81911], desc: "Layanan bore pile profesional untuk wilayah Kecamatan Beji.", city: "Depok"  },
  { name: "Kecamatan Bojongsari (Depok)", level: "district", queryName: "Kecamatan Bojongsari, Depok, Jawa Barat", type: "area", coords: [-6.37207, 106.73423], desc: "Layanan bore pile profesional untuk wilayah Kecamatan Bojongsari.", city: "Depok"  },
  { name: "Kecamatan Cilodong (Depok)", level: "district", queryName: "Kecamatan Cilodong, Depok, Jawa Barat", type: "area", coords: [-6.43526, 106.83161], desc: "Layanan bore pile profesional untuk wilayah Kecamatan Cilodong.", city: "Depok"  },
  { name: "Kecamatan Cimanggis (Depok)", level: "district", queryName: "Kecamatan Cimanggis, Depok, Jawa Barat", type: "area", coords: [-6.36175, 106.85042], desc: "Layanan bore pile profesional untuk wilayah Kecamatan Cimanggis.", city: "Depok"  },
  { name: "Kecamatan Cinere (Depok)", level: "district", queryName: "Kecamatan Cinere, Depok, Jawa Barat", type: "area", coords: [-6.33448, 106.7879], desc: "Layanan bore pile profesional untuk wilayah Kecamatan Cinere.", city: "Depok"  },
  { name: "Kecamatan Cipayung (Depok)", level: "district", queryName: "Kecamatan Cipayung, Depok, Jawa Barat", type: "area", coords: [-6.42691, 106.80146], desc: "Layanan bore pile profesional untuk wilayah Kecamatan Cipayung.", city: "Depok"  },
  { name: "Kecamatan Limo (Depok)", level: "district", queryName: "Kecamatan Limo, Depok, Jawa Barat", type: "area", coords: [-6.37158, 106.78278], desc: "Layanan bore pile profesional untuk wilayah Kecamatan Limo.", city: "Depok"  },
  { name: "Kecamatan Pancoran Mas (Depok)", level: "district", queryName: "Kecamatan Pancoran Mas, Depok, Jawa Barat", type: "area", coords: [-6.39829, 106.79182], desc: "Layanan bore pile profesional untuk wilayah Kecamatan Pancoran Mas.", city: "Depok"  },
  { name: "Kecamatan Sawangan (Depok)", level: "district", queryName: "Kecamatan Sawangan, Depok, Jawa Barat", type: "area", coords: [-6.41761, 106.76554], desc: "Layanan bore pile profesional untuk wilayah Kecamatan Sawangan.", city: "Depok"  },
  { name: "Kecamatan Sukmajaya (Depok)", level: "district", queryName: "Kecamatan Sukmajaya, Depok, Jawa Barat", type: "area", coords: [-6.38478, 106.85034], desc: "Layanan bore pile profesional untuk wilayah Kecamatan Sukmajaya.", city: "Depok"  },
  { name: "Kecamatan Tapos (Depok)", level: "district", queryName: "Kecamatan Tapos, Depok, Jawa Barat", type: "area", coords: [-6.41392, 106.87957], desc: "Layanan bore pile profesional untuk wilayah Kecamatan Tapos.", city: "Depok"  },
  { name: "Kecamatan Babakan Madang (Bogor)", level: "district", queryName: "Kecamatan Babakan Madang, Bogor, Jawa Barat", type: "area", coords: [-6.60283, 106.91123], desc: "Layanan bore pile profesional untuk wilayah Kecamatan Babakan Madang.", city: "Bogor" },
  { name: "Kecamatan Bojong Gede (Bogor)", level: "district", queryName: "Kecamatan Bojong Gede, Bogor, Jawa Barat", type: "area", coords: [-6.46673, 106.79966], desc: "Layanan bore pile profesional untuk wilayah Kecamatan Bojong Gede.", city: "Bogor" },
  { name: "Kecamatan Caringin (Bogor)", level: "district", queryName: "Kecamatan Caringin, Bogor, Jawa Barat", type: "area", coords: [-6.73459, 106.8515], desc: "Layanan bore pile profesional untuk wilayah Kecamatan Caringin.", city: "Bogor" },
  { name: "Kecamatan Cariu (Bogor)", level: "district", queryName: "Kecamatan Cariu, Bogor, Jawa Barat", type: "area", coords: [-6.52954, 107.13648], desc: "Layanan bore pile profesional untuk wilayah Kecamatan Cariu.", city: "Bogor" },
  { name: "Kecamatan Ciampea (Bogor)", level: "district", queryName: "Kecamatan Ciampea, Bogor, Jawa Barat", type: "area", coords: [-6.5713, 106.70349], desc: "Layanan bore pile profesional untuk wilayah Kecamatan Ciampea.", city: "Bogor" },
  { name: "Kecamatan Ciawi (Bogor)", level: "district", queryName: "Kecamatan Ciawi, Bogor, Jawa Barat", type: "area", coords: [-6.71286, 106.89413], desc: "Layanan bore pile profesional untuk wilayah Kecamatan Ciawi.", city: "Bogor" },
  { name: "Kecamatan Cibinong (Bogor)", level: "district", queryName: "Kecamatan Cibinong, Bogor, Jawa Barat", type: "area", coords: [-6.48009, 106.83864], desc: "Layanan bore pile profesional untuk wilayah Kecamatan Cibinong.", city: "Bogor" },
  { name: "Kecamatan Cibungbulang (Bogor)", level: "district", queryName: "Kecamatan Cibungbulang, Bogor, Jawa Barat", type: "area", coords: [-6.56597, 106.65861], desc: "Layanan bore pile profesional untuk wilayah Kecamatan Cibungbulang.", city: "Bogor" },
  { name: "Kecamatan Cigombong (Bogor)", level: "district", queryName: "Kecamatan Cigombong, Bogor, Jawa Barat", type: "area", coords: [-6.73315, 106.79437], desc: "Layanan bore pile profesional untuk wilayah Kecamatan Cigombong.", city: "Bogor" },
  { name: "Kecamatan Cigudeg (Bogor)", level: "district", queryName: "Kecamatan Cigudeg, Bogor, Jawa Barat", type: "area", coords: [-6.48528, 106.55348], desc: "Layanan bore pile profesional untuk wilayah Kecamatan Cigudeg.", city: "Bogor" },
  { name: "Kecamatan Cijeruk (Bogor)", level: "district", queryName: "Kecamatan Cijeruk, Bogor, Jawa Barat", type: "area", coords: [-6.68647, 106.7814], desc: "Layanan bore pile profesional untuk wilayah Kecamatan Cijeruk.", city: "Bogor" },
  { name: "Kecamatan Cileungsi (Bogor)", level: "district", queryName: "Kecamatan Cileungsi, Bogor, Jawa Barat", type: "area", coords: [-6.41086, 106.98316], desc: "Layanan bore pile profesional untuk wilayah Kecamatan Cileungsi.", city: "Bogor" },
  { name: "Kecamatan Ciomas (Bogor)", level: "district", queryName: "Kecamatan Ciomas, Bogor, Jawa Barat", type: "area", coords: [-6.60307, 106.75779], desc: "Layanan bore pile profesional untuk wilayah Kecamatan Ciomas.", city: "Bogor" },
  { name: "Kecamatan Cisarua (Bogor)", level: "district", queryName: "Kecamatan Cisarua, Bogor, Jawa Barat", type: "area", coords: [-6.70372, 106.96402], desc: "Layanan bore pile profesional untuk wilayah Kecamatan Cisarua.", city: "Bogor" },
  { name: "Kecamatan Ciseeng (Bogor)", level: "district", queryName: "Kecamatan Ciseeng, Bogor, Jawa Barat", type: "area", coords: [-6.4526, 106.67984], desc: "Layanan bore pile profesional untuk wilayah Kecamatan Ciseeng.", city: "Bogor" },
  { name: "Kecamatan Citeureup (Bogor)", level: "district", queryName: "Kecamatan Citeureup, Bogor, Jawa Barat", type: "area", coords: [-6.53197, 106.8885], desc: "Layanan bore pile profesional untuk wilayah Kecamatan Citeureup.", city: "Bogor" },
  { name: "Kecamatan Dramaga (Bogor)", level: "district", queryName: "Kecamatan Dramaga, Bogor, Jawa Barat", type: "area", coords: [-6.61394, 106.72488], desc: "Layanan bore pile profesional untuk wilayah Kecamatan Dramaga.", city: "Bogor" },
  { name: "Kecamatan Gunung Putri (Bogor)", level: "district", queryName: "Kecamatan Gunung Putri, Bogor, Jawa Barat", type: "area", coords: [-6.43319, 106.91583], desc: "Layanan bore pile profesional untuk wilayah Kecamatan Gunung Putri.", city: "Bogor" },
  { name: "Kecamatan Gunung Sindur (Bogor)", level: "district", queryName: "Kecamatan Gunung Sindur, Bogor, Jawa Barat", type: "area", coords: [-6.38541, 106.68355], desc: "Layanan bore pile profesional untuk wilayah Kecamatan Gunung Sindur.", city: "Bogor" },
  { name: "Kecamatan Jasinga (Bogor)", level: "district", queryName: "Kecamatan Jasinga, Bogor, Jawa Barat", type: "area", coords: [-6.50389, 106.45338], desc: "Layanan bore pile profesional untuk wilayah Kecamatan Jasinga.", city: "Bogor" },
  { name: "Kecamatan Jonggol (Bogor)", level: "district", queryName: "Kecamatan Jonggol, Bogor, Jawa Barat", type: "area", coords: [-6.48151, 107.03879], desc: "Layanan bore pile profesional untuk wilayah Kecamatan Jonggol.", city: "Bogor" },
  { name: "Kecamatan Kelapa Nunggal (Bogor)", level: "district", queryName: "Kecamatan Kelapa Nunggal, Bogor, Jawa Barat", type: "area", coords: [-6.48841, 106.95082], desc: "Layanan bore pile profesional untuk wilayah Kecamatan Kelapa Nunggal.", city: "Bogor" },
  { name: "Kecamatan Kemang (Bogor)", level: "district", queryName: "Kecamatan Kemang, Bogor, Jawa Barat", type: "area", coords: [-6.49123, 106.72518], desc: "Layanan bore pile profesional untuk wilayah Kecamatan Kemang.", city: "Bogor" },
  { name: "Kecamatan Leuwiliang (Bogor)", level: "district", queryName: "Kecamatan Leuwiliang, Bogor, Jawa Barat", type: "area", coords: [-6.63396, 106.60761], desc: "Layanan bore pile profesional untuk wilayah Kecamatan Leuwiliang.", city: "Bogor" },
  { name: "Kecamatan Leuwisadeng (Bogor)", level: "district", queryName: "Kecamatan Leuwisadeng, Bogor, Jawa Barat", type: "area", coords: [-6.56595, 106.59399], desc: "Layanan bore pile profesional untuk wilayah Kecamatan Leuwisadeng.", city: "Bogor" },
  { name: "Kecamatan Megamendung (Bogor)", level: "district", queryName: "Kecamatan Megamendung, Bogor, Jawa Barat", type: "area", coords: [-6.65124, 106.9609], desc: "Layanan bore pile profesional untuk wilayah Kecamatan Megamendung.", city: "Bogor" },
  { name: "Kecamatan Nanggung (Bogor)", level: "district", queryName: "Kecamatan Nanggung, Bogor, Jawa Barat", type: "area", coords: [-6.65713, 106.54954], desc: "Layanan bore pile profesional untuk wilayah Kecamatan Nanggung.", city: "Bogor" },
  { name: "Kecamatan Pamijahan (Bogor)", level: "district", queryName: "Kecamatan Pamijahan, Bogor, Jawa Barat", type: "area", coords: [-6.69318, 106.65781], desc: "Layanan bore pile profesional untuk wilayah Kecamatan Pamijahan.", city: "Bogor" },
  { name: "Kecamatan Parung (Bogor)", level: "district", queryName: "Kecamatan Parung, Bogor, Jawa Barat", type: "area", coords: [-6.43044, 106.71512], desc: "Layanan bore pile profesional untuk wilayah Kecamatan Parung.", city: "Bogor" },
  { name: "Kecamatan Parung Panjang (Bogor)", level: "district", queryName: "Kecamatan Parung Panjang, Bogor, Jawa Barat", type: "area", coords: [-6.37756, 106.55427], desc: "Layanan bore pile profesional untuk wilayah Kecamatan Parung Panjang.", city: "Bogor" },
  { name: "Kecamatan Ranca Bungur (Bogor)", level: "district", queryName: "Kecamatan Ranca Bungur, Bogor, Jawa Barat", type: "area", coords: [-6.52915, 106.71541], desc: "Layanan bore pile profesional untuk wilayah Kecamatan Ranca Bungur.", city: "Bogor" },
  { name: "Kecamatan Rumpin (Bogor)", level: "district", queryName: "Kecamatan Rumpin, Bogor, Jawa Barat", type: "area", coords: [-6.50455, 106.63895], desc: "Layanan bore pile profesional untuk wilayah Kecamatan Rumpin.", city: "Bogor" },
  { name: "Kecamatan Sukajaya (Bogor)", level: "district", queryName: "Kecamatan Sukajaya, Bogor, Jawa Barat", type: "area", coords: [-6.60056, 106.47235], desc: "Layanan bore pile profesional untuk wilayah Kecamatan Sukajaya.", city: "Bogor" },
  { name: "Kecamatan Sukamakmur (Bogor)", level: "district", queryName: "Kecamatan Sukamakmur, Bogor, Jawa Barat", type: "area", coords: [-6.62231, 107.01725], desc: "Layanan bore pile profesional untuk wilayah Kecamatan Sukamakmur.", city: "Bogor" },
  { name: "Kecamatan Sukaraja (Bogor)", level: "district", queryName: "Kecamatan Sukaraja, Bogor, Jawa Barat", type: "area", coords: [-6.53254, 106.83111], desc: "Layanan bore pile profesional untuk wilayah Kecamatan Sukaraja.", city: "Bogor" },
  { name: "Kecamatan Tajur Halang (Bogor)", level: "district", queryName: "Kecamatan Tajur Halang, Bogor, Jawa Barat", type: "area", coords: [-6.46896, 106.75904], desc: "Layanan bore pile profesional untuk wilayah Kecamatan Tajur Halang.", city: "Bogor" },
  { name: "Kecamatan Tamansari (Bogor)", level: "district", queryName: "Kecamatan Tamansari, Bogor, Jawa Barat", type: "area", coords: [-6.65192, 106.7424], desc: "Layanan bore pile profesional untuk wilayah Kecamatan Tamansari.", city: "Bogor" },
  { name: "Kecamatan Tanjungsari (Bogor)", level: "district", queryName: "Kecamatan Tanjungsari, Bogor, Jawa Barat", type: "area", coords: [-6.61154, 107.12822], desc: "Layanan bore pile profesional untuk wilayah Kecamatan Tanjungsari.", city: "Bogor" },
  { name: "Kecamatan Tenjo (Bogor)", level: "district", queryName: "Kecamatan Tenjo, Bogor, Jawa Barat", type: "area", coords: [-6.35549, 106.4537], desc: "Layanan bore pile profesional untuk wilayah Kecamatan Tenjo.", city: "Bogor" },
  { name: "Kecamatan Tenjolaya (Bogor)", level: "district", queryName: "Kecamatan Tenjolaya, Bogor, Jawa Barat", type: "area", coords: [-6.67787, 106.71201], desc: "Layanan bore pile profesional untuk wilayah Kecamatan Tenjolaya.", city: "Bogor" },
  { name: "Kecamatan Balaraja (Tangerang)", level: "district", queryName: "Kecamatan Balaraja, Tangerang, Banten", type: "area", coords: [-6.20707, 106.44098], desc: "Layanan bore pile profesional untuk wilayah Kecamatan Balaraja.", city: "Tangerang" },
  { name: "Kecamatan Cikupa (Tangerang)", level: "district", queryName: "Kecamatan Cikupa, Tangerang, Banten", type: "area", coords: [-6.22183, 106.5173], desc: "Layanan bore pile profesional untuk wilayah Kecamatan Cikupa.", city: "Tangerang" },
  { name: "Kecamatan Cisauk (Tangerang)", level: "district", queryName: "Kecamatan Cisauk, Tangerang, Banten", type: "area", coords: [-6.34375, 106.62962], desc: "Layanan bore pile profesional untuk wilayah Kecamatan Cisauk.", city: "Tangerang" },
  { name: "Kecamatan Cisoka (Tangerang)", level: "district", queryName: "Kecamatan Cisoka, Tangerang, Banten", type: "area", coords: [-6.25824, 106.41895], desc: "Layanan bore pile profesional untuk wilayah Kecamatan Cisoka.", city: "Tangerang" },
  { name: "Kecamatan Curug (Tangerang)", level: "district", queryName: "Kecamatan Curug, Tangerang, Banten", type: "area", coords: [-6.24984, 106.5644], desc: "Layanan bore pile profesional untuk wilayah Kecamatan Curug.", city: "Tangerang" },
  { name: "Kecamatan Gunung Kaler (Tangerang)", level: "district", queryName: "Kecamatan Gunung Kaler, Tangerang, Banten", type: "area", coords: [-6.0889, 106.37079], desc: "Layanan bore pile profesional untuk wilayah Kecamatan Gunung Kaler.", city: "Tangerang" },
  { name: "Kecamatan Jambe (Tangerang)", level: "district", queryName: "Kecamatan Jambe, Tangerang, Banten", type: "area", coords: [-6.30987, 106.49296], desc: "Layanan bore pile profesional untuk wilayah Kecamatan Jambe.", city: "Tangerang" },
  { name: "Kecamatan Jayanti (Tangerang)", level: "district", queryName: "Kecamatan Jayanti, Tangerang, Banten", type: "area", coords: [-6.20374, 106.39671], desc: "Layanan bore pile profesional untuk wilayah Kecamatan Jayanti.", city: "Tangerang" },
  { name: "Kecamatan Kelapa Dua (Tangerang)", level: "district", queryName: "Kecamatan Kelapa Dua, Tangerang, Banten", type: "area", coords: [-6.24009, 106.619], desc: "Layanan bore pile profesional untuk wilayah Kecamatan Kelapa Dua.", city: "Tangerang" },
  { name: "Kecamatan Kemiri (Tangerang)", level: "district", queryName: "Kecamatan Kemiri, Tangerang, Banten", type: "area", coords: [-6.0736, 106.46556], desc: "Layanan bore pile profesional untuk wilayah Kecamatan Kemiri.", city: "Tangerang" },
  { name: "Kecamatan Kosambi (Tangerang)", level: "district", queryName: "Kecamatan Kosambi, Tangerang, Banten", type: "area", coords: [-6.07529, 106.69194], desc: "Layanan bore pile profesional untuk wilayah Kecamatan Kosambi.", city: "Tangerang" },
  { name: "Kecamatan Kresek (Tangerang)", level: "district", queryName: "Kecamatan Kresek, Tangerang, Banten", type: "area", coords: [-6.14031, 106.40318], desc: "Layanan bore pile profesional untuk wilayah Kecamatan Kresek.", city: "Tangerang" },
  { name: "Kecamatan Kronjo (Tangerang)", level: "district", queryName: "Kecamatan Kronjo, Tangerang, Banten", type: "area", coords: [-6.05267, 106.42862], desc: "Layanan bore pile profesional untuk wilayah Kecamatan Kronjo.", city: "Tangerang" },
  { name: "Kecamatan Legok (Tangerang)", level: "district", queryName: "Kecamatan Legok, Tangerang, Banten", type: "area", coords: [-6.29184, 106.57297], desc: "Layanan bore pile profesional untuk wilayah Kecamatan Legok.", city: "Tangerang" },
  { name: "Kecamatan Mauk (Tangerang)", level: "district", queryName: "Kecamatan Mauk, Tangerang, Banten", type: "area", coords: [-6.06066, 106.51831], desc: "Layanan bore pile profesional untuk wilayah Kecamatan Mauk.", city: "Tangerang" },
  { name: "Kecamatan Mekarbaru (Tangerang)", level: "district", queryName: "Kecamatan Mekarbaru, Tangerang, Banten", type: "area", coords: [-6.05287, 106.38411], desc: "Layanan bore pile profesional untuk wilayah Kecamatan Mekarbaru.", city: "Tangerang" },
  { name: "Kecamatan Pagedangan (Tangerang)", level: "district", queryName: "Kecamatan Pagedangan, Tangerang, Banten", type: "area", coords: [-6.28701, 106.62415], desc: "Layanan bore pile profesional untuk wilayah Kecamatan Pagedangan.", city: "Tangerang" },
  { name: "Kecamatan Pakuhaji (Tangerang)", level: "district", queryName: "Kecamatan Pakuhaji, Tangerang, Banten", type: "area", coords: [-6.06395, 106.60518], desc: "Layanan bore pile profesional untuk wilayah Kecamatan Pakuhaji.", city: "Tangerang" },
  { name: "Kecamatan Panongan (Tangerang)", level: "district", queryName: "Kecamatan Panongan, Tangerang, Banten", type: "area", coords: [-6.28496, 106.53148], desc: "Layanan bore pile profesional untuk wilayah Kecamatan Panongan.", city: "Tangerang" },
  { name: "Kecamatan Pasar Kemis (Tangerang)", level: "district", queryName: "Kecamatan Pasar Kemis, Tangerang, Banten", type: "area", coords: [-6.15593, 106.55526], desc: "Layanan bore pile profesional untuk wilayah Kecamatan Pasar Kemis.", city: "Tangerang" },
  { name: "Kecamatan Rajeg (Tangerang)", level: "district", queryName: "Kecamatan Rajeg, Tangerang, Banten", type: "area", coords: [-6.11536, 106.51443], desc: "Layanan bore pile profesional untuk wilayah Kecamatan Rajeg.", city: "Tangerang" },
  { name: "Kecamatan Sepatan (Tangerang)", level: "district", queryName: "Kecamatan Sepatan, Tangerang, Banten", type: "area", coords: [-6.12846, 106.5783], desc: "Layanan bore pile profesional untuk wilayah Kecamatan Sepatan.", city: "Tangerang" },
  { name: "Kecamatan Sepatan Timur (Tangerang)", level: "district", queryName: "Kecamatan Sepatan Timur, Tangerang, Banten", type: "area", coords: [-6.11259, 106.60834], desc: "Layanan bore pile profesional untuk wilayah Kecamatan Sepatan Timur.", city: "Tangerang" },
  { name: "Kecamatan Sindang Jaya (Tangerang)", level: "district", queryName: "Kecamatan Sindang Jaya, Tangerang, Banten", type: "area", coords: [-6.17319, 106.50529], desc: "Layanan bore pile profesional untuk wilayah Kecamatan Sindang Jaya.", city: "Tangerang" },
  { name: "Kecamatan Solear (Tangerang)", level: "district", queryName: "Kecamatan Solear, Tangerang, Banten", type: "area", coords: [-6.30949, 106.414], desc: "Layanan bore pile profesional untuk wilayah Kecamatan Solear.", city: "Tangerang" },
  { name: "Kecamatan Sukadiri (Tangerang)", level: "district", queryName: "Kecamatan Sukadiri, Tangerang, Banten", type: "area", coords: [-6.08409, 106.5608], desc: "Layanan bore pile profesional untuk wilayah Kecamatan Sukadiri.", city: "Tangerang" },
  { name: "Kecamatan Sukamulya (Tangerang)", level: "district", queryName: "Kecamatan Sukamulya, Tangerang, Banten", type: "area", coords: [-6.16952, 106.42922], desc: "Layanan bore pile profesional untuk wilayah Kecamatan Sukamulya.", city: "Tangerang" },
  { name: "Kecamatan Teluknaga (Tangerang)", level: "district", queryName: "Kecamatan Teluknaga, Tangerang, Banten", type: "area", coords: [-6.04434, 106.65597], desc: "Layanan bore pile profesional untuk wilayah Kecamatan Teluknaga.", city: "Tangerang" },
  { name: "Kecamatan Tigaraksa (Tangerang)", level: "district", queryName: "Kecamatan Tigaraksa, Tangerang, Banten", type: "area", coords: [-6.24245, 106.4626], desc: "Layanan bore pile profesional untuk wilayah Kecamatan Tigaraksa.", city: "Tangerang" },
];

    // Cache untuk menyimpan data batas wilayah agar tidak delay
    if (!window.geoCache) window.geoCache = {};
    
    // Lakukan pre-load seluruh batas wilayah Jakarta di background secara rahasia
    if (!window.geoDataPromise) {
      window.geoDataPromise = fetch('/data/jakarta-boundaries.json')
        .then(res => res.json())
        .then(data => {
          Object.assign(window.geoCache, data);
        }).catch(e => console.error("Gagal pre-load data wilayah", e));
    }

    // INITIALIZE CLUSTER GROUPS BY CITY
    const cityClusters = {};
    let currentPolygon = null;

    
    const markersMap = {};
    const searchInput = document.getElementById('map-search-input');
    const searchResults = document.getElementById('map-search-results');
    const gpsBtn = document.getElementById('gps-btn');

    // WORKSHOP MARKER (Task 4)
    const workshopCoords = [-6.1818, 107.0099]; // Koordinat area Setia Asih Bekasi
    const workshopIcon = L.divIcon({
      html: '<div style="background: #800000; width: 22px; height: 22px; border-radius: 50%; border: 3px solid white; box-shadow: 0 0 12px rgba(128,0,0,0.7);"></div>',
      className: '',
      iconSize: [22, 22],
      iconAnchor: [11, 11]
    });
    const workshopMarker = L.marker(workshopCoords, { icon: workshopIcon, zIndexOffset: 1000 }).addTo(map);
    workshopMarker.bindPopup(`
      <div class="map-popup-card">
        <h4 style="color: #800000; margin-bottom: 5px;">Workshop Pusat ASeven</h4>
        <p style="margin-bottom: 12px; font-size: 13px;">Jl. Setia Asih, Tarumajaya, Bekasi</p>
        <a href="https://wa.me/6281234567890?text=Halo%20ASeven%20Pile,%20saya%20ingin%20berkunjung%20ke%20workshop." class="btn" style="background: #800000; color: white;" target="_blank">Hubungi Kami</a>
      </div>
    `);
    
    // GPS BUTTON (Task 3)
    let userLocationMarker = null;
    gpsBtn.addEventListener('click', () => {
      gpsBtn.innerHTML = '&#128205;';
      map.locate({setView: true, maxZoom: 14});
    });
    map.on('locationfound', (e) => {
      gpsBtn.innerHTML = '&#128205;';
      if(userLocationMarker) map.removeLayer(userLocationMarker);
      userLocationMarker = L.circleMarker(e.latlng, {
        radius: 8, fillColor: "#3b82f6", color: "#ffffff", weight: 2, opacity: 1, fillOpacity: 0.8
      }).addTo(map);
      userLocationMarker.bindPopup("Lokasi Anda").openPopup();
    });
    map.on('locationerror', (e) => {
      gpsBtn.innerHTML = '&#128205;';
      alert("Tidak dapat menemukan lokasi Anda. Pastikan izin lokasi (GPS) diaktifkan.");
    });

    locations.forEach(loc => {
      const isMain = loc.type === "main";
      const icon = isMain ? primaryIcon : tertiaryIcon;
      const marker = L.marker(loc.coords, { 
         icon: icon,
         city: loc.city // pass custom property to marker
      });
      
      // Smart WhatsApp (Task 1)
      const waNumber = "6281234567890";
      const waText = encodeURIComponent(`Halo ASeven Pile, saya ingin konsultasi mengenai jasa bore pile untuk proyek di wilayah ${loc.name}.`);
      
      let popupContent = `
        <div class="map-popup-card">
          <h4>${loc.name}</h4>
          <p>${loc.desc}</p>
          <a href="https://wa.me/${waNumber}?text=${waText}" class="btn btn-accent" target="_blank" rel="noopener noreferrer">Konsultasi via WA</a>
        </div>
      `;
      
      marker.bindPopup(popupContent, {
        className: 'custom-popup',
        closeButton: true,
        minWidth: 200
      });

      // Draw polygon on click
      marker.on('click', function() {
        // Draw boundary only if district
        if (!isMain && window.geoCache && window.geoCache[loc.queryName]) {
          if (currentPolygon) {
            map.removeLayer(currentPolygon);
          }
          currentPolygon = L.geoJSON(window.geoCache[loc.queryName], {
            style: {
              color: '#22c55e',
              weight: 2,
              opacity: 0.8,
              fillColor: '#22c55e',
              fillOpacity: 0.1,
              dashArray: '5, 5'
            }
          }).addTo(map);
        }
      });
      
      // Ensure city group exists
      const cityKey = loc.city || 'Area';
      if (!cityClusters[cityKey]) {
        cityClusters[cityKey] = L.markerClusterGroup({
          maxClusterRadius: 180, // Group aggressively within the same city so far edges like Kalideres aren't left out
          spiderfyOnMaxZoom: true,
          showCoverageOnHover: false,
          zoomOutOfBoundsOnClick: true,
          iconCreateFunction: function(cluster) {
            const count = cluster.getChildCount();
            const html = `
              <div style="background: #10B981; color: white; padding: 6px 14px; border-radius: 20px; font-weight: 700; border: 3px solid white; box-shadow: 0 4px 12px rgba(0,0,0,0.25); font-size: 14px; white-space: nowrap; text-align: center; position: absolute; transform: translate(-50%, -50%);">
                ${cityKey === 'Area' ? 'Lainnya' : cityKey} <span style="background: white; color: #10B981; padding: 2px 6px; border-radius: 12px; font-size: 11px; margin-left: 4px;">${count}</span>
              </div>
            `;
            return L.divIcon({
              html: html,
              className: 'custom-cluster-badge',
              iconSize: null
            });
          }
        });
        map.addLayer(cityClusters[cityKey]);
      }

      cityClusters[cityKey].addLayer(marker);
      markersMap[loc.name] = { marker: marker, cityKey: cityKey };
    });

    setTimeout(() => {
      map.invalidateSize();
    }, 100);

    // Search Box Logic (Task 2)
    searchInput.addEventListener('input', (e) => {
      const val = e.target.value.toLowerCase();
      searchResults.innerHTML = '';
      if (!val) {
        searchResults.style.display = 'none';
        return;
      }
      const matches = locations.filter(l => l.name.toLowerCase().includes(val)).slice(0, 5);
      if (matches.length > 0) {
        searchResults.style.display = 'block';
        matches.forEach(m => {
          const li = document.createElement('li');
          li.textContent = m.name;
          li.onclick = () => {
            searchInput.value = m.name;
            searchResults.style.display = 'none';
            const mData = markersMap[m.name];
            if (mData) {
               const cg = cityClusters[mData.cityKey];
               if (cg) {
                 cg.zoomToShowLayer(mData.marker, () => {
                    mData.marker.openPopup();
                    mData.marker.fire('click');
                 });
               }
            }
          };
          searchResults.appendChild(li);
        });
      } else {
        searchResults.style.display = 'none';
      }
    });

  }

  document.addEventListener('DOMContentLoaded', initCoverageMap);
  document.addEventListener('astro:page-load', initCoverageMap);
