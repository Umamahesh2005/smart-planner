document.addEventListener('DOMContentLoaded', () => {
    const dataStr = localStorage.getItem('tripResults');
    if (!dataStr) return;

    try {
        const data = JSON.parse(dataStr);
        const lat = data.lat || 20.5937;
        const lon = data.lon || 78.9629;
        
        const map = L.map('map').setView([lat, lon], 12);

        // Google Maps Tiles
        L.tileLayer('http://{s}.google.com/vt/lyrs=m&x={x}&y={y}&z={z}', {
            maxZoom: 20,
            subdomains: ['mt0', 'mt1', 'mt2', 'mt3'],
            attribution: '&copy; Google Maps'
        }).addTo(map);

        const markers = [];
        const routeCoords = [];
        
        let routeLayerRef = null;
        let polylineRef = null;

        // 1. Add Source (START) Marker
        if (data.source_lat && data.source_lon) {
            const startPos = [data.source_lat, data.source_lon];
            const startMarker = L.marker(startPos, {
                icon: L.divIcon({
                    className: 'map-start-marker',
                    html: `<div style="background-color: #28a745; color: white; border-radius: 50%; width: 30px; height: 30px; display: flex; align-items: center; justify-content: center; border: 2px solid white; font-weight: bold; box-shadow: 0 2px 5px rgba(0,0,0,0.3);">START</div>`,
                    iconSize: [30, 30],
                    iconAnchor: [15, 15]
                })
            }).addTo(map).bindPopup(`<b>Starting from: ${data.source_name || 'Home'}</b>`);
            markers.push(startMarker);
            routeCoords.push(startPos);
        }

        // 2. Add Hotel Markers
        if (data.hotels) {
            data.hotels.forEach(hotel => {
                if (hotel.lat && hotel.lon) {
                    const m = L.marker([hotel.lat, hotel.lon], {
                        icon: L.divIcon({
                            className: 'hotel-marker',
                            html: '<i class="fa-solid fa-hotel" style="color: #2b4eff; font-size: 20px; text-shadow: 0 0 3px white;"></i>',
                            iconSize: [20, 20],
                            iconAnchor: [10, 10]
                        })
                    }).addTo(map).bindPopup(`<b>${hotel.name}</b><br>Base Hotel`);
                    markers.push(m);
                }
            });
        }

        // 3. Add Itinerary Markers (Numbered)
        let stopCount = 0;
        if (data.itinerary) {
            data.itinerary.forEach(day => {
                if (day.activities) {
                    day.activities.forEach(act => {
                        if (act.lat && act.lon) {
                            stopCount++;
                            const pos = [act.lat, act.lon];
                            const m = L.marker(pos, {
                                icon: L.divIcon({
                                    className: 'numbered-stop-marker',
                                    html: `<div style="background-color: #2b4eff; color: white; border-radius: 50%; width: 25px; height: 25px; display: flex; align-items: center; justify-content: center; border: 2px solid white; font-weight: bold; box-shadow: 0 2px 5px rgba(0,0,0,0.2); font-size: 12px;">${stopCount}</div>`,
                                    iconSize: [25, 25],
                                    iconAnchor: [12, 12]
                                })
                            }).addTo(map).bindPopup(`<b>Stop ${stopCount}: ${act.name}</b><br>Day ${day.day}`);
                            
                            markers.push(m);
                            routeCoords.push(pos);
                        }
                    });
                }
            });
        }

        // 4. Draw the Route (Road Following)
        if (data.route_geometry) {
            routeLayerRef = L.geoJSON(data.route_geometry, {
                style: { color: '#2b4eff', weight: 6, opacity: 0.8 }
            }).addTo(map);

            const features = data.route_geometry.features;
            if (features && features.length > 0 && features[0].properties.summary) {
                const duration = Math.round(features[0].properties.summary.duration / 60);
                L.popup()
                    .setLatLng(routeLayerRef.getBounds().getCenter())
                    .setContent(`<b>Road Route</b><br>Est. Drive Time: ${Math.floor(duration/60)}h ${duration%60}m`)
                    .openOn(map);
            }
        } else if (routeCoords.length > 1) {
            polylineRef = L.polyline(routeCoords, { color: '#2b4eff', weight: 4, opacity: 0.7, dashArray: '10, 10' }).addTo(map);
        }
        
        // Critical Fix: Size invalidation and zoom fitting must happen AFTER DOM has expanded and settled
        setTimeout(() => {
            map.invalidateSize();
            if (routeLayerRef) {
                map.fitBounds(routeLayerRef.getBounds(), { padding: [50, 50] });
            } else if (polylineRef) {
                map.fitBounds(polylineRef.getBounds(), { padding: [50, 50] });
            } else if (markers.length > 0) {
                const group = new L.featureGroup(markers);
                map.fitBounds(group.getBounds(), { padding: [50, 50] });
            }
        }, 300);

    } catch (e) {
        console.error("Map initialization failed", e);
    }
});
