import React, { useEffect, useRef, useState } from "react";
import { MapPin, Navigation, Info, Search, ShieldAlert, CheckCircle2 } from "lucide-react";

interface NearbyPlace {
  id: string;
  name: string;
  type: "Aadhaar Center" | "Passport Office" | "Municipal Office" | "Police Station" | "Hospital" | "RTO" | "Court";
  lat: number;
  lng: number;
  address: string;
  distance: string;
  timings: string;
}

const NEARBY_PLACES: NearbyPlace[] = [
  { id: "p1", name: "Sector 7 Aadhaar Seva Kendra", type: "Aadhaar Center", lat: 28.6139, lng: 77.2090, address: "Central Plaza, Sector 7, New Delhi", distance: "0.8 km", timings: "9:00 AM - 6:00 PM" },
  { id: "p2", name: "Regional Passport Office (RPO)", type: "Passport Office", lat: 28.6112, lng: 77.2145, address: "Hudco House, Lodhi Road, New Delhi", distance: "1.4 km", timings: "9:30 AM - 4:30 PM" },
  { id: "p3", name: "District Municipal Corporation (MCD) HQ", type: "Municipal Office", lat: 28.6185, lng: 77.2030, address: "Town Hall, Chandni Chowk, Delhi", distance: "2.1 km", timings: "10:00 AM - 5:00 PM" },
  { id: "p4", name: "Vasant Kunj Police Headquarters", type: "Police Station", lat: 28.6080, lng: 77.2210, address: "Police Station Rd, Vasant Kunj, Delhi", distance: "1.9 km", timings: "24 Hours" },
  { id: "p5", name: "AIIMS Apex Medical Center & Emergency", type: "Hospital", lat: 28.6010, lng: 77.2000, address: "Ansari Nagar, New Delhi", distance: "2.8 km", timings: "24 Hours" },
  { id: "p6", name: "Sarojini Nagar RTO - Licensing Wing", type: "RTO", lat: 28.6250, lng: 77.2110, address: "RTO Office Complex, Sarojini Nagar, Delhi", distance: "3.2 km", timings: "9:30 AM - 4:00 PM" }
];

export const MapComponent: React.FC<{ highContrast?: boolean }> = ({ highContrast }) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const [activeCategory, setActiveCategory] = useState<string>("All");
  const [selectedPlace, setSelectedPlace] = useState<NearbyPlace | null>(NEARBY_PLACES[0]);
  const [leafletLoaded, setLeafletLoaded] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [routingInstructions, setRoutingInstructions] = useState<string[]>([]);
  const [isRouting, setIsRouting] = useState(false);

  // Filter places based on search query and category
  const filteredPlaces = NEARBY_PLACES.filter(place => {
    const matchesCategory = activeCategory === "All" || place.type === activeCategory;
    const matchesSearch = place.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          place.address.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  // Dynamically load Leaflet resources
  useEffect(() => {
    const loadLeaflet = async () => {
      if ((window as any).L) {
        setLeafletLoaded(true);
        return;
      }

      // Load CSS
      const link = document.createElement("link");
      link.rel = "stylesheet";
      link.href = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css";
      link.integrity = "sha256-p4NxAoJBhIIN+hmNHrzRCf9tD/miZyoHS5obTRR9BMY=";
      link.crossOrigin = "";
      document.head.appendChild(link);

      // Load JS
      const script = document.createElement("script");
      script.src = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.js";
      script.integrity = "sha256-20nQCchB9co0qIjJZRGuk2/Z9VM+kNiyxNV1lvTlZBo=";
      script.crossOrigin = "";
      script.onload = () => {
        setLeafletLoaded(true);
      };
      document.body.appendChild(script);
    };

    loadLeaflet();
  }, []);

  // Initialize and update the map
  useEffect(() => {
    if (!leafletLoaded || !mapContainerRef.current) return;

    const L = (window as any).L;
    if (!L) return;

    // Remove existing map instance if it exists to avoid container conflicts
    if (mapInstanceRef.current) {
      mapInstanceRef.current.remove();
      mapInstanceRef.current = null;
    }

    // Coordinates centered around New Delhi, India
    const defaultLat = selectedPlace ? selectedPlace.lat : 28.6139;
    const defaultLng = selectedPlace ? selectedPlace.lng : 77.2090;

    // Initialize Map
    const map = L.map(mapContainerRef.current, {
      zoomControl: true,
      scrollWheelZoom: true
    }).setView([defaultLat, defaultLng], 14);

    mapInstanceRef.current = map;

    // Load OSM Map Tiles
    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      maxZoom: 19,
      attribution: '© OpenStreetMap contributors'
    }).addTo(map);

    // Dynamic marker colors based on type
    const getMarkerColor = (type: string) => {
      switch (type) {
        case "Aadhaar Center": return "#FF8C00";
        case "Passport Office": return "#0B3D91";
        case "Municipal Office": return "#138808";
        case "Police Station": return "#EF4444";
        case "Hospital": return "#22C55E";
        default: return "#64748B";
      }
    };

    // Custom circular vector marker
    const createCustomIcon = (color: string) => {
      return L.divIcon({
        className: "custom-leaflet-icon",
        html: `
          <div style="
            position: relative; 
            width: 32px; 
            height: 32px; 
            background-color: ${color}; 
            border: 3px solid white; 
            border-radius: 50%; 
            display: flex; 
            align-items: center; 
            justify-content: center; 
            box-shadow: 0 4px 10px rgba(0,0,0,0.3);
          ">
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="3" stroke-linecap="round" stroke-linejoin="round">
              <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/>
              <circle cx="12" cy="10" r="3"/>
            </svg>
          </div>
        `,
        iconSize: [32, 32],
        iconAnchor: [16, 32]
      });
    };

    // Current location marker (blue center dot)
    const citizenIcon = L.divIcon({
      className: "citizen-leaflet-icon",
      html: `
        <div style="position: relative; width: 24px; height: 24px;">
          <div class="animate-ping" style="position: absolute; width: 100%; height: 100%; background-color: #3b82f6; opacity: 0.4; border-radius: 50%;"></div>
          <div style="width: 14px; height: 14px; background-color: #1d4ed8; border: 2.5px solid white; border-radius: 50%; position: absolute; top: 5px; left: 5px; box-shadow: 0 2px 5px rgba(0,0,0,0.4);"></div>
        </div>
      `,
      iconSize: [24, 24],
      iconAnchor: [12, 12]
    });

    const citizenMarker = L.marker([28.6100, 77.2050], { icon: citizenIcon }).addTo(map);
    citizenMarker.bindPopup("<b>You are here (Live Location)</b><br/>Secretariat Quarters, New Delhi").openPopup();

    // Plot filtered place markers
    filteredPlaces.forEach(place => {
      const color = getMarkerColor(place.type);
      const markerIcon = createCustomIcon(color);
      const marker = L.marker([place.lat, place.lng], { icon: markerIcon }).addTo(map);

      marker.bindPopup(`
        <div style="font-family: sans-serif; text-align: left; padding: 2px;">
          <b style="color: #0b3d91; font-size: 13px;">${place.name}</b><br/>
          <span style="font-size: 11px; color: #64748b; font-weight: 600;">${place.type}</span><br/>
          <span style="font-size: 11px; color: #1e293b; display: block; margin-top: 4px;">${place.address}</span>
          <span style="font-size: 11px; color: #138808; font-weight: bold; display: block; margin-top: 2px;">Timings: ${place.timings}</span>
        </div>
      `);

      if (selectedPlace && selectedPlace.id === place.id) {
        marker.openPopup();
      }
    });

    // Handle routing display simulation
    if (isRouting && selectedPlace) {
      const citizenLatLng = [28.6100, 77.2050];
      const targetLatLng = [selectedPlace.lat, selectedPlace.lng];
      
      // Draw simulated route line
      const routeLine = L.polyline([citizenLatLng, targetLatLng], {
        color: "#1d4ed8",
        weight: 5,
        opacity: 0.8,
        dashArray: "8, 8"
      }).addTo(map);

      map.fitBounds(routeLine.getBounds(), { padding: [50, 50] });
    }

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, [leafletLoaded, filteredPlaces, selectedPlace, isRouting]);

  // Handle center positioning click
  const selectPlaceHandler = (place: NearbyPlace) => {
    setSelectedPlace(place);
    setIsRouting(false);
    setRoutingInstructions([]);
    if (mapInstanceRef.current) {
      mapInstanceRef.current.setView([place.lat, place.lng], 15);
    }
  };

  // Simulate routing steps
  const handleGetDirections = () => {
    if (!selectedPlace) return;
    setIsRouting(true);
    const steps = [
      "Depart Secretariat quarters toward Janpath Rd (North).",
      "Turn right onto Janpath Rd, continue for 450 meters.",
      "At the roundabout, take the 2nd exit onto Rajpath.",
      `Turn left near the destination signboards and proceed to ${selectedPlace.name}.`,
      "Your destination is on the left side."
    ];
    setRoutingInstructions(steps);
  };

  const categories = ["All", "Aadhaar Center", "Passport Office", "Municipal Office", "Police Station", "Hospital", "RTO"];

  return (
    <div className={`p-6 rounded-3xl border backdrop-blur-md ${
      highContrast ? "bg-black border-yellow-500 text-yellow-400" : "bg-white/60 border-white/50 shadow-sm"
    }`} id="civic-map-module">
      
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6 text-left">
        <div className="space-y-1">
          <h2 className="text-xl font-display font-extrabold text-slate-900 tracking-tight flex items-center space-x-2">
            <MapPin className="w-5 h-5 text-orange-500" />
            <span>Interactive Civic Map Portal</span>
          </h2>
          <p className="text-xs text-slate-500">
            Locate nearest government services, Aadhaar centers, municipal offices, and request direct routing directions.
          </p>
        </div>

        {/* Search input */}
        <div className="relative w-full md:w-72">
          <input
            type="text"
            placeholder="Search nearby offices..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            id="map-search-input"
            className="w-full px-4 py-2.5 pl-10 text-xs rounded-xl border border-slate-200 focus:outline-hidden focus:border-[#0B3D91]"
          />
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
        </div>
      </div>

      {/* Categories slider */}
      <div className="flex overflow-x-auto gap-2 pb-4 no-scrollbar">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => {
              setActiveCategory(cat);
              setSelectedPlace(null);
              setIsRouting(false);
              setRoutingInstructions([]);
            }}
            id={`map-filter-${cat.replace(/\s+/g, "-")}`}
            className={`px-3.5 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all backdrop-blur-xs ${
              activeCategory === cat
                ? highContrast ? "bg-yellow-400 text-black" : "bg-[#0B3D91] text-white"
                : "bg-white/40 border border-white/30 hover:bg-white/80 text-slate-600"
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Places List Panel */}
        <div className="space-y-4 max-h-[500px] overflow-y-auto pr-1">
          {filteredPlaces.length === 0 ? (
            <div className="p-8 text-center text-xs opacity-60 flex flex-col items-center justify-center space-y-2 border border-dashed rounded-xl">
              <ShieldAlert className="w-8 h-8 text-slate-400" />
              <span>No facilities match this category in your immediate zone.</span>
            </div>
          ) : (
            filteredPlaces.map((place) => (
              <div
                key={place.id}
                id={`place-item-${place.id}`}
                onClick={() => selectPlaceHandler(place)}
                className={`p-4 rounded-2xl border text-left cursor-pointer transition-all backdrop-blur-xs ${
                  selectedPlace?.id === place.id
                    ? highContrast ? "bg-yellow-950 border-yellow-400" : "bg-[#0B3D91]/10 border-white/80 shadow-xs"
                    : "bg-white/40 hover:bg-white/60 border-white/30"
                }`}
              >
                <div className="flex justify-between items-start">
                  <span className={`px-2 py-0.5 rounded-sm text-[9px] font-bold ${
                    place.type === "Aadhaar Center" ? "bg-orange-50 text-orange-700 border border-orange-200" :
                    place.type === "Passport Office" ? "bg-blue-50 text-blue-700 border border-blue-200" :
                    place.type === "Municipal Office" ? "bg-green-50 text-green-700 border border-green-200" :
                    place.type === "Police Station" ? "bg-red-50 text-red-700 border border-red-200" :
                    "bg-slate-100 text-slate-700"
                  }`}>
                    {place.type}
                  </span>
                  <span className="text-[10px] font-semibold text-slate-400">{place.distance}</span>
                </div>
                <h4 className="text-xs font-bold text-slate-800 mt-2">{place.name}</h4>
                <p className="text-[11px] text-slate-500 mt-1">{place.address}</p>
                <div className="mt-3 pt-2.5 border-t border-slate-200/60 flex justify-between items-center text-[10px] text-slate-400">
                  <span>Open: {place.timings}</span>
                  {selectedPlace?.id === place.id && (
                    <span className="text-emerald-600 font-bold flex items-center space-x-1">
                      <CheckCircle2 className="w-3 h-3" />
                      <span>Active Selection</span>
                    </span>
                  )}
                </div>
              </div>
            ))
          )}
        </div>

        {/* Map Container Canvas */}
        <div className="lg:col-span-2 relative flex flex-col space-y-4">
          <div 
            ref={mapContainerRef} 
            id="map-container-canvas"
            className="w-full h-[320px] lg:h-[400px] rounded-2xl overflow-hidden border border-slate-200 relative z-10"
            style={{ minHeight: "300px" }}
          >
            {!leafletLoaded && (
              <div className="absolute inset-0 bg-slate-50 flex flex-col items-center justify-center space-y-2">
                <div className="w-8 h-8 rounded-full border-4 border-slate-200 border-t-blue-800 animate-spin"></div>
                <span className="text-xs font-semibold text-slate-500">Injecting OpenStreetMap Tiles...</span>
              </div>
            )}
          </div>

          {/* Interactive Routing Detail Actions */}
          {selectedPlace && (
            <div className={`p-4 rounded-2xl border text-left flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 backdrop-blur-md ${
              highContrast ? "bg-black border-yellow-500 text-yellow-400" : "bg-white/50 border-white/40 shadow-xs"
            }`}>
              <div className="space-y-1">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Target Facility Selected</span>
                <h4 className="text-xs font-extrabold text-slate-800">{selectedPlace.name}</h4>
                <p className="text-[10px] text-slate-500 flex items-center space-x-1">
                  <Info className="w-3.5 h-3.5 text-blue-600 inline" />
                  <span>Located {selectedPlace.distance} from your current sandbox quarters.</span>
                </p>
              </div>
              <button
                onClick={handleGetDirections}
                id="get-directions-btn"
                className="w-full sm:w-auto px-4 py-2.5 text-xs bg-[#0B3D91] hover:bg-[#0B3D91]/95 text-white font-bold rounded-xl flex items-center justify-center space-x-1.5 shadow-sm transition-all"
              >
                <Navigation className="w-3.5 h-3.5" />
                <span>Calculate Directions</span>
              </button>
            </div>
          )}

          {/* Directions Panel */}
          {routingInstructions.length > 0 && (
            <div className={`p-4 rounded-2xl border text-left space-y-2 animate-fadeIn backdrop-blur-md ${
              highContrast ? "bg-black border-yellow-500 text-yellow-400" : "bg-blue-50/40 border-blue-100/40"
            }`}>
              <span className="text-[10px] font-bold text-blue-800 uppercase tracking-wider flex items-center space-x-1">
                <Navigation className="w-3.5 h-3.5 animate-pulse" />
                <span>Active Routing Instructions (Real-Time GPS Simulation)</span>
              </span>
              <ol className="list-decimal list-inside text-xs text-slate-600 space-y-1.5 pl-1">
                {routingInstructions.map((step, idx) => (
                  <li key={idx} className="leading-relaxed">{step}</li>
                ))}
              </ol>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
