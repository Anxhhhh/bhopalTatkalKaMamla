import React, { useState, useEffect, useRef } from 'react';
import Header from './components/Header';
import Footer from './components/Footer';

// API Base URL config for Netlify -> Render or Local development
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

// Constants for Live Data Simulation
const INITIAL_ZONES = [
  { name: 'Zone Alpha', temp: '42°C', status: 'Extreme Heat', color: 'text-error', density: 'High', coordinates: '23.2599° N, 77.4126° E' },
  { name: 'Zone Beta', temp: '36°C', status: 'Normal Flow', color: 'text-tertiary', density: 'Low', coordinates: '23.2324° N, 77.4302° E' },
  { name: 'Zone Gamma', temp: '39°C', status: 'Elevated Warning', color: 'text-primary-container', density: 'Medium', coordinates: '23.2842° N, 77.3998° E' }
];

const INITIAL_STATIONS = [
  { name: 'Habibganj Station (A)', status: 'High Density', color: 'bg-error/20 border-error/50 text-error', flowRate: '89 pax/min' },
  { name: 'Bhopal Junction (B)', status: 'Normal Flow', color: 'bg-tertiary-container/20 border-tertiary-container/50 text-tertiary-container', flowRate: '42 pax/min' },
  { name: 'Nadra Bus Stand (C)', status: 'Low Density', color: 'bg-primary-container/20 border-primary-container/50 text-primary-container', flowRate: '18 pax/min' }
];

const INITIAL_LOGS = [
  'SYSTEM: Ingestion Core connected to 1,240 municipal sensors.',
  'ROUTING: Recalculating active corridors near TT Nagar.',
  'WEATHER: Temperature spike detected in Zone Alpha (42°C).',
  'CRICKET: Stadium Zone flow-redirection system standby.',
  'ALERT: Congestion on Hoshangabad Road elevated (+24%).'
];

// Real Coordinates in Bhopal, India
const ZONE_COORDS = {
  alpha: { lat: 23.2324, lng: 77.3998 },   // New Market / TT Nagar
  beta: { lat: 23.2330, lng: 77.4300 },    // MP Nagar
  gamma: { lat: 23.2726, lng: 77.4100 },   // Bhopal Junction Area
  stadium: { lat: 23.2570, lng: 77.4200 }  // Aishbagh Stadium Zone
};

// Premium Cyberpunk-lite Dark Style for Google Maps
const DARK_MAP_STYLE = [
  { elementType: "geometry", stylers: [{ color: "#07151c" }] },
  { elementType: "labels.text.stroke", stylers: [{ color: "#07151c" }] },
  { elementType: "labels.text.fill", stylers: [{ color: "#ccd0cf" }] },
  {
    featureType: "administrative.locality",
    elementType: "labels.text.fill",
    stylers: [{ color: "#e8eceb" }]
  },
  {
    featureType: "poi",
    elementType: "labels.text.fill",
    stylers: [{ color: "#b6c9d9" }]
  },
  {
    featureType: "poi.park",
    elementType: "geometry",
    stylers: [{ color: "#0f1d25" }]
  },
  {
    featureType: "poi.park",
    elementType: "labels.text.fill",
    stylers: [{ color: "#ccd0cf" }]
  },
  {
    featureType: "road",
    elementType: "geometry",
    stylers: [{ color: "#142129" }]
  },
  {
    featureType: "road",
    elementType: "geometry.stroke",
    stylers: [{ color: "#29373e" }]
  },
  {
    featureType: "road",
    elementType: "labels.text.fill",
    stylers: [{ color: "#c3c7c6" }]
  },
  {
    featureType: "road.highway",
    elementType: "geometry",
    stylers: [{ color: "#394b59" }]
  },
  {
    featureType: "road.highway",
    elementType: "geometry.stroke",
    stylers: [{ color: "#142129" }]
  },
  {
    featureType: "road.highway",
    elementType: "labels.text.fill",
    stylers: [{ color: "#e8eceb" }]
  },
  {
    featureType: "water",
    elementType: "geometry",
    stylers: [{ color: "#031017" }]
  },
  {
    featureType: "water",
    elementType: "labels.text.fill",
    stylers: [{ color: "#485a6a" }]
  }
];

export default function App() {
  // Page States
  const [currentView, setCurrentView] = useState('landing'); // 'landing' | 'app'
  const [selectedZoneIdx, setSelectedZoneIdx] = useState(0);
  const [zones, setZones] = useState(INITIAL_ZONES);
  const [stations, setStations] = useState(INITIAL_STATIONS);
  const [showStadiumAnalytics, setShowStadiumAnalytics] = useState(false);
  const [hoveredStep, setHoveredStep] = useState(null);
  const [liveMapOverlay, setLiveMapOverlay] = useState(true);
  
  // App initialization simulator
  const [appInitializing, setAppInitializing] = useState(false);
  const [initProgress, setInitProgress] = useState(0);

  // App Dashboard States
  const [systemAlertsOn, setSystemAlertsOn] = useState(true);
  const [terminalLogs, setTerminalLogs] = useState(INITIAL_LOGS);
  const [dashboardMapMode, setDashboardMapMode] = useState('satellite'); // 'satellite' | 'heatmap' | 'vector'
  const [hoveredMapNode, setHoveredMapNode] = useState(null);

  // API Integration States
  const [backendOnline, setBackendOnline] = useState(false);
  const [cricketEvent, setCricketEvent] = useState(null);

  // Routing Calculator States
  const [routeSource, setRouteSource] = useState('alpha');
  const [routeDest, setRouteDest] = useState('beta');
  const [routePref, setRoutePref] = useState('comfort');
  const [calculatedRoute, setCalculatedRoute] = useState(null);
  const [calculatingRoute, setCalculatingRoute] = useState(false);

  const logContainerRef = useRef(null);

  // Map Container Refs & Instances
  const landingMapRef = useRef(null);
  const dashboardMapRef = useRef(null);
  const landingMapInstance = useRef(null);
  const dashboardMapInstance = useRef(null);
  const trafficLayerInstance = useRef(null);
  const directionsRendererInstance = useRef(null);

  // Google Maps SDK loading States
  const [mapsLoaded, setMapsLoaded] = useState(false);
  const [mapsLoadingError, setMapsLoadingError] = useState(false);

  // Dynamic Google Maps Script Loading
  useEffect(() => {
    const loadGoogleMaps = async () => {
      if (window.google && window.google.maps) {
        setMapsLoaded(true);
        return;
      }
      try {
        const config = await fetch(`${API_BASE_URL}/api/config`).then(r => r.json());
        const key = config.googleMapsApiKey;
        const script = document.createElement('script');
        script.src = `https://maps.googleapis.com/maps/api/js?${key ? `key=${key}&` : ''}libraries=places,geometry`;
        script.async = true;
        script.defer = true;
        script.onload = () => setMapsLoaded(true);
        script.onerror = () => setMapsLoadingError(true);
        document.head.appendChild(script);
      } catch (err) {
        console.warn('Backend config endpoint unreachable. Loading Maps in fallback development mode.');
        const script = document.createElement('script');
        script.src = `https://maps.googleapis.com/maps/api/js?libraries=places,geometry`;
        script.async = true;
        script.defer = true;
        script.onload = () => setMapsLoaded(true);
        script.onerror = () => setMapsLoadingError(true);
        document.head.appendChild(script);
      }
    };
    loadGoogleMaps();
  }, []);

  // Landing Page Map Initialization
  useEffect(() => {
    if (!mapsLoaded || currentView !== 'landing' || !landingMapRef.current) return;
    
    try {
      const center = ZONE_COORDS.alpha;
      const map = new window.google.maps.Map(landingMapRef.current, {
        center,
        zoom: 12,
        mapTypeId: 'satellite',
        disableDefaultUI: true,
        styles: DARK_MAP_STYLE
      });
      landingMapInstance.current = map;

      // Add markers for Bhopal zones
      const infoWindow = new window.google.maps.InfoWindow();
      Object.keys(ZONE_COORDS).forEach(key => {
        const coord = ZONE_COORDS[key];
        const marker = new window.google.maps.Marker({
          position: coord,
          map,
          title: key === 'stadium' ? 'Aishbagh Stadium' : `Zone ${key.toUpperCase()}`,
          icon: key === 'stadium' 
            ? 'http://maps.google.com/mapfiles/ms/icons/red-pushpin.png' 
            : 'http://maps.google.com/mapfiles/ms/icons/blue-dot.png'
        });

        marker.addListener('click', () => {
          infoWindow.setContent(`
            <div style="color:#07151c; font-family:sans-serif; padding:5px; font-size:12px; line-height:1.4;">
              <strong>${key === 'stadium' ? 'Aishbagh Stadium (Event Core)' : `Zone ${key.toUpperCase()}`}</strong><br/>
              ${key === 'stadium' ? 'Cricket Mode Redirect Active' : 'Ingesting Live Traffic telemetry'}
            </div>
          `);
          infoWindow.open(map, marker);
        });
      });
    } catch (err) {
      console.error('Error initializing landing map:', err);
    }
  }, [mapsLoaded, currentView]);

  // Dashboard Map Initialization & Overlay Update
  useEffect(() => {
    if (!mapsLoaded || currentView !== 'app' || !dashboardMapRef.current) return;

    try {
      const center = ZONE_COORDS.alpha;
      const map = new window.google.maps.Map(dashboardMapRef.current, {
        center,
        zoom: 12,
        mapTypeId: dashboardMapMode === 'satellite' ? 'satellite' : 'roadmap',
        disableDefaultUI: true,
        styles: DARK_MAP_STYLE
      });
      dashboardMapInstance.current = map;

      // Set up Directions Renderer
      const directionsRenderer = new window.google.maps.DirectionsRenderer({
        map,
        suppressMarkers: false,
        polylineOptions: {
          strokeColor: '#ccd0cf',
          strokeWeight: 5,
          strokeOpacity: 0.85
        }
      });
      directionsRendererInstance.current = directionsRenderer;

      // Set up Traffic Layer
      const trafficLayer = new window.google.maps.TrafficLayer();
      trafficLayerInstance.current = trafficLayer;

      if (dashboardMapMode === 'heatmap') {
        trafficLayer.setMap(map);
      } else {
        trafficLayer.setMap(null);
      }

      // Add Custom Markers
      Object.keys(ZONE_COORDS).forEach(key => {
        const coord = ZONE_COORDS[key];
        const isStadium = key === 'stadium';

        const marker = new window.google.maps.Marker({
          position: coord,
          map,
          title: isStadium ? 'Stadium Venue' : `Zone ${key.toUpperCase()}`,
          icon: isStadium 
            ? 'http://maps.google.com/mapfiles/ms/icons/red-pushpin.png' 
            : 'http://maps.google.com/mapfiles/ms/icons/blue-dot.png'
        });

        marker.addListener('click', () => {
          const idx = zones.findIndex(z => z.id === key);
          if (idx !== -1) {
            setSelectedZoneIdx(idx);
          }
        });
      });
    } catch (err) {
      console.error('Error initializing dashboard map:', err);
    }
  }, [mapsLoaded, currentView, dashboardMapMode]);

  // 1. Fetch live metrics from Express backend periodically
  useEffect(() => {
    const fetchBackendData = async () => {
      try {
        const [zonesRes, stationsRes, logsRes, cricketRes] = await Promise.all([
          fetch(`${API_BASE_URL}/api/zones`).then(r => r.json()),
          fetch(`${API_BASE_URL}/api/stations`).then(r => r.json()),
          fetch(`${API_BASE_URL}/api/logs`).then(r => r.json()),
          fetch(`${API_BASE_URL}/api/events/cricket`).then(r => r.json())
        ]);

        setZones(zonesRes);
        setStations(stationsRes);
        setTerminalLogs(logsRes);
        setCricketEvent(cricketRes);
        setSystemAlertsOn(cricketRes.active);
        setBackendOnline(true);
      } catch (err) {
        // Backend offline
        setBackendOnline(false);
      }
    };

    fetchBackendData();
    const pollInterval = setInterval(fetchBackendData, 4000);

    return () => clearInterval(pollInterval);
  }, [currentView]);

  // 2. Auto-simulate live metrics & console logs locally (Only if Backend is OFFLINE)
  useEffect(() => {
    if (currentView !== 'app' || backendOnline) return;

    const interval = setInterval(() => {
      // Local flow simulator
      setStations(prev => prev.map(st => {
        const flowVal = Math.floor(Math.random() * 80) + 10;
        let status = 'Normal Flow';
        let color = 'bg-tertiary-container/20 border-tertiary-container/50 text-tertiary-container';

        if (flowVal > 70) {
          status = 'High Density';
          color = 'bg-error/20 border-error/50 text-error';
        } else if (flowVal < 25) {
          status = 'Low Density';
          color = 'bg-primary-container/20 border-primary-container/50 text-primary-container';
        }
        return { ...st, flowRate: `${flowVal} pax/min`, status, color };
      }));

      // Local temperature simulator
      setZones(prev => prev.map(z => {
        const currentTemp = parseInt(z.temp, 10);
        const tempChange = Math.random() > 0.5 ? 1 : -1;
        let newTemp = currentTemp + tempChange;
        if (newTemp > 44) newTemp = 44;
        if (newTemp < 35) newTemp = 35;
        return { ...z, temp: `${newTemp}°C` };
      }));

      // Local logs simulator
      const eventTypes = ['SYSTEM', 'ROUTING', 'WEATHER', 'CRICKET', 'SENSOR'];
      const details = [
        'Commuter corridor redirection completed successfully.',
        'Thermal node telemetry synchronized in central grid.',
        'Stadium Shuttle Line 4 reports +12m queue time.',
        'Solar thermal warning updated for Zone Alpha.',
        'Re-routing algorithm loaded comfort weighting indices.'
      ];
      
      const newLog = `${eventTypes[Math.floor(Math.random() * eventTypes.length)]}: ${details[Math.floor(Math.random() * details.length)]}`;
      setTerminalLogs(prev => [...prev.slice(-15), newLog]);
    }, 3500);

    return () => clearInterval(interval);
  }, [currentView, backendOnline]);

  // Handler for toggle alarms via backend or locally
  const handleToggleAlarms = async () => {
    const nextAlertState = !systemAlertsOn;
    setSystemAlertsOn(nextAlertState);

    if (backendOnline) {
      try {
        await fetch(`${API_BASE_URL}/api/events/toggle`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ active: nextAlertState })
        });
        
        await fetch(`${API_BASE_URL}/api/logs`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ 
            category: 'SYSTEM', 
            message: `Alarms toggled to ${nextAlertState ? 'ENABLED' : 'MUTED'} by Control Room administrator.` 
          })
        });
      } catch (err) {
        console.warn('Failed to publish toggle to backend');
      }
    }
  };

  // Handler for calculating route via Google Directions Service or locally
  const handleCalculateRoute = async (e) => {
    e?.preventDefault();
    setCalculatingRoute(true);

    const sourceCoord = ZONE_COORDS[routeSource] || ZONE_COORDS.alpha;
    const destCoord = ZONE_COORDS[routeDest] || ZONE_COORDS.beta;

    if (mapsLoaded && window.google && window.google.maps) {
      try {
        const directionsService = new window.google.maps.DirectionsService();
        
        directionsService.route({
          origin: new window.google.maps.LatLng(sourceCoord.lat, sourceCoord.lng),
          destination: new window.google.maps.LatLng(destCoord.lat, destCoord.lng),
          travelMode: window.google.maps.TravelMode.DRIVING
        }, (result, status) => {
          setCalculatingRoute(false);
          if (status === window.google.maps.DirectionsStatus.OK) {
            // Plot on dashboard map if active
            if (directionsRendererInstance.current) {
              directionsRendererInstance.current.setDirections(result);
            }
            
            const routeLeg = result.routes[0].legs[0];
            setCalculatedRoute({
              routeName: result.routes[0].summary ? `via ${result.routes[0].summary}` : 'Calculated Optimal Route',
              travelTime: routeLeg.duration.text,
              distance: routeLeg.distance.text,
              steps: routeLeg.steps.map(s => s.instructions.replace(/<[^>]*>/g, '')),
              comfortIndex: routePref === 'comfort' ? '91%' : '54%', // Mock comfort based on preference
              incidents: routePref === 'speed' 
                ? ['Route passes through high-density traffic lights.'] 
                : ['Optimum shade canopy cover.', 'Smooth flowing secondary roads.']
            });

            // Post log event to backend
            if (backendOnline) {
              fetch(`${API_BASE_URL}/api/logs`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ 
                  category: 'ROUTING', 
                  message: `Google Directions calculated: ${routeLeg.distance.text} in ${routeLeg.duration.text} (${routeSource.toUpperCase()} to ${routeDest.toUpperCase()}).` 
                })
              }).catch(() => {});
            }
          } else {
            calculateLocalRoute();
          }
        });
      } catch (err) {
        setCalculatingRoute(false);
        calculateLocalRoute();
      }
    } else {
      await new Promise(r => setTimeout(r, 600));
      calculateLocalRoute();
      setCalculatingRoute(false);
    }
  };

  const calculateLocalRoute = () => {
    if (routePref === 'speed') {
      setCalculatedRoute({
        routeName: 'Link Road Express Corridor',
        travelTime: '11 mins',
        comfortIndex: '48%',
        distance: '4.8 km',
        incidents: [
          'Congestion high near Zone Alpha junction (+5m delay).',
          'Direct sun exposure (No shade coverage).'
        ]
      });
    } else {
      setCalculatedRoute({
        routeName: 'Shaded Boulevard & Lake Bypass',
        travelTime: '15 mins',
        comfortIndex: '88%',
        distance: '5.6 km',
        incidents: [
          'Zero traffic incidents.',
          'Max shade density (90% canopy coverage).'
        ]
      });
    }
  };

  // Scroll terminal logs to bottom on update
  useEffect(() => {
    if (logContainerRef.current) {
      logContainerRef.current.scrollTop = logContainerRef.current.scrollHeight;
    }
  }, [terminalLogs]);

  // Trigger loading screen transition
  const triggerLaunchSequence = () => {
    setAppInitializing(true);
    setInitProgress(0);
    const interval = setInterval(() => {
      setInitProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          setTimeout(() => {
            setAppInitializing(false);
            setCurrentView('app');
          }, 500);
          return 100;
        }
        return prev + Math.floor(Math.random() * 20) + 8;
      });
    }, 120);
  };

  const handleZoneSelect = (index) => {
    setSelectedZoneIdx(index);
  };

  return (
    <div className="bg-background text-on-background min-h-screen overflow-x-hidden font-body-lg">
      
      {/* LOADING OVERLAY SCREEN */}
      {appInitializing && (
        <div className="fixed inset-0 bg-surface-container-lowest/95 backdrop-blur-md z-9999 flex flex-col items-center justify-center p-6">
          <div className="max-w-md w-full text-center space-y-6">
            <div className="w-16 h-16 mx-auto rounded-full border border-primary-container/20 flex items-center justify-center bg-surface-container shadow-[0_0_30px_rgba(204,208,207,0.3)] animate-pulse">
              <span className="material-symbols-outlined text-primary-container text-3xl animate-spin">sync</span>
            </div>
            <div className="space-y-2">
              <h3 className="font-headline-md text-primary tracking-widest uppercase text-xl font-bold">Initializing Core</h3>
              <p className="font-data-sm text-data-sm text-on-surface-variant font-mono">Quantum Traffic Redirection Engine v4.2</p>
            </div>
            
            {/* Loading Bar */}
            <div className="w-full bg-surface-container h-2 rounded-full overflow-hidden border border-outline-variant/30">
              <div 
                className="h-full bg-gradient-to-r from-primary-container via-tertiary-container to-secondary-fixed-dim transition-all duration-150 ease-out"
                style={{ width: `${Math.min(initProgress, 100)}%` }}
              ></div>
            </div>
            
            <div className="flex justify-between items-center text-xs font-mono text-on-surface-variant">
              <span>Telemetry Feed Syncing...</span>
              <span>{Math.min(initProgress, 100)}%</span>
            </div>
          </div>
        </div>
      )}

      {/* VIEW 1: LANDING PAGE */}
      {currentView === 'landing' && (
        <>
          <Header triggerLaunchSequence={triggerLaunchSequence} />

          {/* Main Content Canvas */}
          <main className="pt-16 md:pt-24 pb-24">
            
            {/* Hero Section */}
            <section className="relative min-h-[819px] flex flex-col items-center justify-center px-margin-mobile md:px-margin-desktop overflow-hidden">
              <div className="absolute inset-0 bg-cyber-grid opacity-30 z-0"></div>
              <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary-fixed/10 rounded-full blur-[100px] z-0"></div>
              <div className="absolute bottom-1/4 right-1/4 w-[500px] h-[500px] bg-secondary-container/10 rounded-full blur-[120px] z-0"></div>
              
              <div className="relative z-10 text-center max-w-4xl mx-auto space-y-8">
                <h1 className="font-display-lg text-display-lg text-on-surface leading-tight text-4xl md:text-6xl">
                  Navigate Bhopal <br className="md:hidden"/>
                  <span className="text-primary-container inline-block drop-shadow-[0_0_15px_rgba(204,208,207,0.3)]">Smarter, Not Faster</span>
                </h1>
                <p className="font-body-lg text-body-lg text-on-surface-variant max-w-2xl mx-auto">
                  A high-stakes urban monitoring and real-time decision-making platform. Harness live data to optimize routes, avoid heat zones, and manage city flow with cyberpunk precision.
                </p>
                <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
                  <button 
                    onClick={triggerLaunchSequence}
                    className="w-full sm:w-auto px-8 py-4 bg-primary-container text-on-primary-container font-headline-md text-body-lg rounded neon-glow hover:bg-primary transition-all duration-300 cursor-pointer font-semibold"
                  >
                    Launch Platform
                  </button>
                  <button 
                    onClick={() => {
                      document.getElementById('live-feed-card')?.scrollIntoView({ behavior: 'smooth' });
                      setLiveMapOverlay(true);
                    }}
                    className="w-full sm:w-auto px-8 py-4 bg-transparent text-primary-container border border-primary-container/50 font-headline-md text-body-lg rounded hover:bg-primary-container/10 transition-all duration-300 cursor-pointer"
                  >
                    View Live Map
                  </button>
                </div>
              </div>

              {/* Live Preview Mini-Map Card */}
              <div id="live-feed-card" className="relative z-10 mt-16 w-full max-w-5xl aspect-video glass-panel rounded-xl overflow-hidden shadow-2xl transition-all duration-500 hover:border-primary-container/30">
                {mapsLoaded && !mapsLoadingError ? (
                  <div ref={landingMapRef} className="w-full h-full relative z-10"></div>
                ) : (
                  <div className="absolute inset-0 bg-surface-container-highest/80 flex items-center justify-center">
                    <img 
                      alt="Satellite view" 
                      className="absolute inset-0 w-full h-full object-cover opacity-40 mix-blend-luminosity" 
                      src="https://lh3.googleusercontent.com/aida-public/AB6AXuDhrXSs1PNq1SJUkXvdHzGBCq4y0ywPid6uqRw4iv8bZ8tkEdRzqvqlxryMBz-W4nuAjdficXWb-EEaxpppwh4bMDBNDukmwLKa9Rj0NbPKI4worBKpJJmTRKwMJfhc_oZ2FusOuq3fXLAZnz1eGJwefJEtNvteVdTkRMAzUWtt9FMDWPO0um0t6qZhdwqavu2xLcdmwkP6SwLf_YhVCFInnr3Zk7nyo-8nkpQr_1-9rkt6zn8HX8FwbkFbhybnKec8AOkYzc29px0"
                    />
                    
                    {/* Grid Lines on Top */}
                    {liveMapOverlay && (
                      <div className="absolute inset-0 bg-cyber-grid opacity-40 pointer-events-none transition-all duration-300"></div>
                    )}

                    {/* Left Side Info Panel */}
                    <div className="absolute top-4 left-4 glass-panel px-4 py-2 rounded border border-outline-variant/50">
                      <div className="font-data-sm text-data-sm text-primary-container uppercase tracking-widest flex items-center gap-2">
                        <span className="w-2 h-2 bg-primary-container rounded-full animate-pulse"></span>
                        Live Feed active
                      </div>
                    </div>

                    {/* Right Side Map Controller */}
                    <div className="absolute top-4 right-4 flex gap-2">
                      <button 
                        onClick={() => setLiveMapOverlay(!liveMapOverlay)}
                        className={`px-3 py-1.5 rounded glass-panel text-xs border font-mono transition-all ${liveMapOverlay ? 'bg-primary-container text-on-primary-container border-primary-container' : 'border-outline-variant/30 text-on-surface-variant hover:text-on-surface'}`}
                      >
                        Vector Grid: {liveMapOverlay ? 'ON' : 'OFF'}
                      </button>
                    </div>

                    {/* Pulsing Surge detected Node */}
                    <div className="absolute top-1/3 left-1/3 md:top-1/2 md:left-1/2 -translate-x-1/2 -translate-y-1/2 group/node">
                      <div className="w-5 h-5 bg-error rounded-full animate-ping absolute opacity-75"></div>
                      <div className="w-5 h-5 bg-error rounded-full relative z-10 cursor-pointer shadow-[0_0_10px_#ffb4ab]"></div>
                      <div className="mt-2 font-data-sm text-data-sm text-on-surface bg-surface-container-low/95 px-3 py-2 rounded border border-error/50 whitespace-nowrap shadow-lg flex flex-col gap-1 transition-all duration-300 group-hover/node:border-error">
                        <span className="text-error font-bold flex items-center gap-1">
                          <span className="material-symbols-outlined text-sm">warning</span> Surge Detected
                        </span>
                        <span className="text-xs text-on-surface-variant font-mono">Location: TT Nagar Corridors</span>
                      </div>
                    </div>

                    {/* Stable Node */}
                    <div className="absolute top-2/3 right-1/4 group/node-stable">
                      <div className="w-3.5 h-3.5 bg-tertiary-container rounded-full relative z-10 cursor-pointer hover:scale-125 transition-transform"></div>
                      <div className="mt-2 font-data-sm text-data-sm text-on-surface bg-surface-container-low/95 px-3 py-1 rounded border border-tertiary-container/30 whitespace-nowrap hidden group-hover/node-stable:block shadow-lg">
                        <span className="text-tertiary-container font-semibold">Station Stable</span>
                        <span className="block text-xs font-mono">Flow rate: 34 pax/m</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </section>

            {/* Features Bento Grid */}
            <section id="features" className="py-24 px-margin-mobile md:px-margin-desktop max-w-container-max mx-auto relative">
              <div className="text-center mb-16">
                <h2 className="font-headline-lg text-headline-lg md:text-4xl text-on-surface font-bold">Urban Intelligence Core</h2>
                <p className="font-body-lg text-body-lg text-on-surface-variant mt-4">Real-time awareness modules for complex city navigation.</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
                
                {/* Traffic Aware (Spans 8 cols) */}
                <div className="md:col-span-8 glass-panel p-6 rounded-lg hover-neon-glow transition-all duration-300 group">
                  <div className="flex items-start justify-between mb-8">
                    <div>
                      <div className="w-12 h-12 rounded bg-primary-container/10 flex items-center justify-center mb-4 group-hover:bg-primary-container/20 transition-colors">
                        <span className="material-symbols-outlined text-primary-container text-3xl">traffic</span>
                      </div>
                      <h3 className="font-headline-md text-headline-md text-on-surface mb-2 font-semibold">Traffic Aware</h3>
                      <p className="font-body-lg text-body-lg text-on-surface-variant">Predictive routing based on live congestion models and incident reports across the grid.</p>
                    </div>
                  </div>
                  {/* Animated graph placeholder */}
                  <div className="h-32 w-full border-t border-outline-variant/20 pt-4 flex items-end gap-2">
                    <div className="w-full bg-surface-container-high h-[30%] rounded-t-sm transition-all duration-500 hover:h-[45%]"></div>
                    <div className="w-full bg-surface-container-high h-[50%] rounded-t-sm transition-all duration-500 hover:h-[70%]"></div>
                    <div className="w-full bg-primary-container/40 h-[80%] rounded-t-sm border-t border-primary-container transition-all duration-500 hover:bg-primary-container/60"></div>
                    <div className="w-full bg-error/40 h-[95%] rounded-t-sm border-t border-error transition-all duration-500 hover:bg-error/60"></div>
                    <div className="w-full bg-surface-container-high h-[40%] rounded-t-sm transition-all duration-500 hover:h-[60%]"></div>
                    <div className="w-full bg-surface-container-high h-[60%] rounded-t-sm transition-all duration-500 hover:h-[80%]"></div>
                  </div>
                </div>

                {/* Heat Aware (Spans 4 cols) - Interactive Zone telemetries */}
                <div id="routing" className="md:col-span-4 glass-panel p-6 rounded-lg hover-neon-glow transition-all duration-300 group flex flex-col justify-between">
                  <div>
                    <div className="w-12 h-12 rounded bg-error/10 flex items-center justify-center mb-4 group-hover:bg-error/20 transition-colors">
                      <span className="material-symbols-outlined text-error text-3xl">device_thermostat</span>
                    </div>
                    <h3 className="font-headline-md text-headline-md text-on-surface mb-2 font-semibold">Heat Aware</h3>
                    <p className="font-body-lg text-body-lg text-on-surface-variant">Real-time thermal mapping to avoid extreme urban heat islands during peak hours.</p>
                  </div>
                  
                  {/* Selector zones widget */}
                  <div className="my-6 border-t border-b border-outline-variant/10 py-3 space-y-2">
                    <div className="text-xs text-on-surface-variant font-mono uppercase">Select Telemetry Zone</div>
                    <div className="flex gap-2">
                      {zones.map((zone, idx) => (
                        <button 
                          key={zone.name}
                          onClick={() => handleZoneSelect(idx)}
                          className={`px-2 py-1 text-xs font-mono border rounded ${selectedZoneIdx === idx ? 'bg-error/10 border-error text-error' : 'border-outline-variant/20 text-on-surface-variant hover:text-on-surface bg-surface-container-low'}`}
                        >
                          Zone {zone.name.split(' ')[1]}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-2">
                    <div className="flex items-baseline gap-1">
                      <div className="font-data-lg text-data-lg text-error text-3xl font-bold">{zones[selectedZoneIdx]?.temp}</div>
                      <span className="text-xs text-on-surface-variant font-mono">/ Live</span>
                    </div>
                    <div className="text-right">
                      <div className="font-data-sm text-data-sm text-on-surface-variant">{zones[selectedZoneIdx]?.name}</div>
                      <div className="text-xs text-error font-mono">{zones[selectedZoneIdx]?.status}</div>
                    </div>
                  </div>
                </div>

                {/* Crowd Aware (Spans 6 cols) - Simulated live crowd data */}
                <div className="md:col-span-6 glass-panel p-6 rounded-lg hover-neon-glow transition-all duration-300 group">
                  <div className="flex items-center gap-4 mb-6 border-b border-outline-variant/20 pb-4">
                    <div className="w-10 h-10 rounded bg-tertiary-container/10 flex items-center justify-center">
                      <span className="material-symbols-outlined text-tertiary-container text-2xl">groups</span>
                    </div>
                    <h3 className="font-headline-md text-headline-md text-on-surface font-semibold">Crowd Aware</h3>
                  </div>
                  <p className="font-body-lg text-body-lg text-on-surface-variant mb-6">Density monitoring for major transit hubs and public squares to suggest alternate comfortable paths.</p>
                  
                  <div className="space-y-3">
                    {stations.map(st => (
                      <div key={st.name} className="flex justify-between items-center p-2 rounded bg-surface-container/30 border border-outline-variant/10">
                        <span className="text-sm font-semibold">{st.name}</span>
                        <div className="flex gap-2 items-center">
                          <span className="text-xs text-on-surface-variant font-mono">{st.flowRate}</span>
                          <span className={`px-2.5 py-0.5 rounded-full border text-[11px] font-semibold ${st.color}`}>
                            {st.status}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Comfort Routing (Spans 6 cols) */}
                <div className="md:col-span-6 glass-panel p-6 rounded-lg hover-neon-glow transition-all duration-300 group flex flex-col justify-between">
                  <div>
                    <div className="flex items-center gap-4 mb-6 border-b border-outline-variant/20 pb-4">
                      <div className="w-10 h-10 rounded bg-secondary-container/10 flex items-center justify-center">
                        <span className="material-symbols-outlined text-secondary-container text-2xl">route</span>
                      </div>
                      <h3 className="font-headline-md text-headline-md text-on-surface font-semibold">Comfort Routing</h3>
                    </div>
                    <p className="font-body-lg text-body-lg text-on-surface-variant mb-4">Algorithmically determined paths prioritizing shade, lower congestion, and smooth transit over pure speed.</p>
                  </div>

                  {/* Calculator Widget */}
                  <div className="space-y-4 my-2">
                    <form onSubmit={handleCalculateRoute} className="grid grid-cols-3 gap-2 bg-surface-container/20 p-3 rounded border border-outline-variant/10">
                      <div>
                        <label className="block text-[10px] text-on-surface-variant font-mono uppercase mb-1">From</label>
                        <select 
                          value={routeSource} 
                          onChange={(e) => setRouteSource(e.target.value)}
                          className="w-full bg-surface-container text-xs p-1.5 rounded border border-outline-variant/30 text-on-surface outline-none"
                        >
                          <option value="alpha">Zone Alpha</option>
                          <option value="beta">Zone Beta</option>
                          <option value="gamma">Zone Gamma</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-[10px] text-on-surface-variant font-mono uppercase mb-1">To</label>
                        <select 
                          value={routeDest} 
                          onChange={(e) => setRouteDest(e.target.value)}
                          className="w-full bg-surface-container text-xs p-1.5 rounded border border-outline-variant/30 text-on-surface outline-none"
                        >
                          <option value="alpha">Zone Alpha</option>
                          <option value="beta">Zone Beta</option>
                          <option value="gamma">Zone Gamma</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-[10px] text-on-surface-variant font-mono uppercase mb-1">Priority</label>
                        <select 
                          value={routePref} 
                          onChange={(e) => setRoutePref(e.target.value)}
                          className="w-full bg-surface-container text-xs p-1.5 rounded border border-outline-variant/30 text-on-surface outline-none"
                        >
                          <option value="comfort">Comfort</option>
                          <option value="speed">Speed</option>
                        </select>
                      </div>
                      <button 
                        type="submit" 
                        disabled={calculatingRoute}
                        className="col-span-3 mt-2 bg-secondary-container text-on-secondary-container py-1.5 rounded text-xs font-mono font-bold hover:bg-opacity-95 disabled:opacity-50 cursor-pointer flex items-center justify-center gap-1.5"
                      >
                        {calculatingRoute ? (
                          <>
                            <span className="material-symbols-outlined text-sm animate-spin">sync</span>
                            Calculating...
                          </>
                        ) : (
                          <>
                            <span className="material-symbols-outlined text-sm">navigation</span>
                            Query Telemetry Route
                          </>
                        )}
                      </button>
                    </form>

                    {/* Result Panel */}
                    {calculatedRoute && (
                      <div className="p-3 bg-surface-container-high/50 rounded border border-secondary-container/30 space-y-2 animate-fadeIn">
                        <div className="flex justify-between items-center border-b border-outline-variant/10 pb-1.5">
                          <span className="text-xs font-bold text-secondary-container font-mono">{calculatedRoute.routeName}</span>
                          <span className="text-[10px] bg-secondary-container text-on-secondary-container px-1.5 py-0.5 rounded font-mono">
                            {calculatedRoute.travelTime} ({calculatedRoute.distance || '5.6 km'})
                          </span>
                        </div>
                        <div className="flex justify-between items-center text-xs font-mono">
                          <span className="text-on-surface-variant">Comfort Score:</span>
                          <span className={`${parseFloat(calculatedRoute.comfortIndex) > 70 ? 'text-tertiary-container' : 'text-error'} font-bold`}>
                            {calculatedRoute.comfortIndex}
                          </span>
                        </div>
                        {calculatedRoute.incidents && calculatedRoute.incidents.length > 0 && (
                          <div className="text-[10px] text-on-surface-variant font-mono list-disc pl-4 space-y-1">
                            {calculatedRoute.incidents.map((inc, i) => (
                              <div key={i} className="flex gap-1 items-start text-error/90">
                                <span className="text-xs font-bold">•</span>
                                <span>{inc}</span>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  <div className="space-y-4 pt-2">
                    <div className="w-full h-2.5 bg-surface-container rounded-full overflow-hidden border border-outline-variant/20">
                      <div className="h-full bg-gradient-to-r from-secondary-container to-primary-container w-[85%] animate-pulse"></div>
                    </div>
                    <div className="flex justify-between font-data-sm text-data-sm text-on-surface-variant font-mono">
                      <span>Pure Speed</span>
                      <span className="text-primary-container font-semibold">Comfort Index 85%</span>
                    </div>
                  </div>
                </div>

              </div>
            </section>

            {/* How It Works (Horizontal Flow) */}
            <section id="sequence" className="py-24 bg-surface-container-lowest border-y border-outline-variant/10">
              <div className="max-w-container-max mx-auto px-margin-mobile md:px-margin-desktop">
                <h2 className="font-headline-lg text-headline-lg md:text-4xl text-on-surface font-bold text-center mb-16">Operational Sequence</h2>
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center relative">
                  
                  {/* Connecting Line */}
                  <div className="hidden md:block absolute top-1/2 left-[10%] right-[10%] h-[1px] bg-outline-variant/30 -translate-y-1/2 z-0"></div>
                  
                  {/* Step 1 */}
                  <div 
                    onMouseEnter={() => setHoveredStep(1)}
                    onMouseLeave={() => setHoveredStep(null)}
                    className={`relative z-10 w-full md:w-1/3 flex flex-col items-center text-center px-4 mb-12 md:mb-0 transition-all duration-300 ${hoveredStep && hoveredStep !== 1 ? 'opacity-40 scale-95' : 'scale-100'}`}
                  >
                    <div className={`w-20 h-20 rounded-full glass-panel flex items-center justify-center mb-6 border transition-all duration-300 ${hoveredStep === 1 ? 'border-primary-container shadow-[0_0_30px_rgba(204,208,207,0.3)] bg-primary-container/10' : 'border-primary-container/30 shadow-[0_0_20px_rgba(204,208,207,0.1)]'}`}>
                      <span className="material-symbols-outlined text-primary-container text-4xl">sensors</span>
                    </div>
                    <h4 className="font-data-lg text-data-lg text-on-surface mb-2 font-bold">01. Data Ingestion</h4>
                    <p className="font-body-sm text-body-sm text-on-surface-variant">Aggregating live sensor streams from city infrastructure.</p>
                  </div>

                  {/* Step 2 */}
                  <div 
                    onMouseEnter={() => setHoveredStep(2)}
                    onMouseLeave={() => setHoveredStep(null)}
                    className={`relative z-10 w-full md:w-1/3 flex flex-col items-center text-center px-4 mb-12 md:mb-0 transition-all duration-300 ${hoveredStep && hoveredStep !== 2 ? 'opacity-40 scale-95' : 'scale-100'}`}
                  >
                    <div className={`w-20 h-20 rounded-full glass-panel flex items-center justify-center mb-6 border transition-all duration-300 ${hoveredStep === 2 ? 'border-secondary-container shadow-[0_0_30px_rgba(57,75,89,0.4)] bg-secondary-container/10' : 'border-secondary-container/30 shadow-[0_0_20px_rgba(57,75,89,0.1)]'}`}>
                      <span className="material-symbols-outlined text-secondary-container text-4xl">memory</span>
                    </div>
                    <h4 className="font-data-lg text-data-lg text-on-surface mb-2 font-bold">02. Cognitive Processing</h4>
                    <p className="font-body-sm text-body-sm text-on-surface-variant">Machine learning models detect anomalies and surge patterns.</p>
                  </div>

                  {/* Step 3 */}
                  <div 
                    onMouseEnter={() => setHoveredStep(3)}
                    onMouseLeave={() => setHoveredStep(null)}
                    className={`relative z-10 w-full md:w-1/3 flex flex-col items-center text-center px-4 transition-all duration-300 ${hoveredStep && hoveredStep !== 3 ? 'opacity-40 scale-95' : 'scale-100'}`}
                  >
                    <div className={`w-20 h-20 rounded-full glass-panel flex items-center justify-center mb-6 border transition-all duration-300 ${hoveredStep === 3 ? 'border-error shadow-[0_0_30px_rgba(255,180,171,0.4)] bg-error/10' : 'border-error/30 shadow-[0_0_20px_rgba(255,180,171,0.1)]'}`}>
                      <span className="material-symbols-outlined text-error text-4xl">broadcast_on_home</span>
                    </div>
                    <h4 className="font-data-lg text-data-lg text-on-surface mb-2 font-bold">03. Alert Distribution</h4>
                    <p className="font-body-sm text-body-sm text-on-surface-variant">Real-time routing updates pushed to citizen interfaces.</p>
                  </div>

                </div>
              </div>
            </section>

            {/* Cricket Mode Highlight */}
            <section className="py-24 px-margin-mobile md:px-margin-desktop max-w-container-max mx-auto">
              <div className="glass-panel border-error/30 rounded-xl overflow-hidden relative group">
                
                {/* Glowing sphere in background */}
                <div className="absolute -right-20 -top-20 w-64 h-64 bg-error/10 rounded-full blur-[80px] z-0"></div>
                
                <div className="flex flex-col md:flex-row relative z-10">
                  <div className="p-8 md:p-12 md:w-1/2 flex flex-col justify-center">
                    
                    <div className="inline-flex items-center gap-2 px-3 py-1 bg-error/10 border border-error/30 rounded-full w-fit mb-6">
                      <div className="w-2.5 h-2.5 bg-error rounded-full animate-ping"></div>
                      <span className="font-data-sm text-data-sm text-error uppercase tracking-wider font-semibold">Special Event Active</span>
                    </div>

                    <h2 className="font-display-lg text-3xl md:text-5xl text-on-surface mb-4 font-bold">Cricket Mode</h2>
                    <p className="font-body-lg text-body-lg text-on-surface-variant mb-8 leading-relaxed">
                      Massive localized surge detection. Automatically reroutes non-essential traffic away from stadium zones while guiding event attendees via optimized transit corridors.
                    </p>

                    <button 
                      onClick={() => setShowStadiumAnalytics(!showStadiumAnalytics)}
                      className="px-6 py-3 bg-surface text-error border border-error/50 font-headline-md text-body-sm rounded hover:bg-error hover:text-on-error transition-all duration-300 w-fit flex items-center gap-2 cursor-pointer font-bold shadow-[0_0_15px_rgba(255,180,171,0.15)]"
                    >
                      <span className="material-symbols-outlined">sports_cricket</span>
                      {showStadiumAnalytics ? 'Hide Stadium Stats' : 'View Stadium Analytics'}
                    </button>
                  </div>

                  <div className="md:w-1/2 bg-surface-container-high/50 p-6 flex flex-col items-center justify-center border-l border-outline-variant/10 min-h-[350px]">
                    
                    {showStadiumAnalytics ? (
                      /* Stadium Analytics overlay dashboard */
                      <div className="w-full space-y-4 max-w-sm animate-fadeIn">
                        <div className="flex items-center justify-between border-b border-outline-variant/20 pb-2">
                          <span className="font-data-lg text-on-surface font-bold text-sm">Stadium Sector telemetries</span>
                          <span className="text-[10px] bg-error text-on-error px-1.5 py-0.5 rounded font-mono">LIVE FEED</span>
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                          <div className="glass-panel p-3 rounded border-error/20 bg-surface/40">
                            <span className="text-[11px] text-on-surface-variant font-mono">TICKET SCANS</span>
                            <div className="text-xl font-bold text-error mt-1 font-mono">
                              {cricketEvent ? `${cricketEvent.ticketScansPerHour.toLocaleString()} / hr` : '14,240 / hr'}
                            </div>
                          </div>
                          <div className="glass-panel p-3 rounded bg-surface/40">
                            <span className="text-[11px] text-on-surface-variant font-mono">GATE CONGESTION</span>
                            <div className="text-xl font-bold text-primary-container mt-1 font-mono">
                              {cricketEvent ? `${cricketEvent.gateCongestionIndex}% Index` : '92% Index'}
                            </div>
                          </div>
                        </div>
                        <div className="glass-panel p-3 rounded bg-surface-container/50 space-y-2 text-xs font-mono">
                          <div className="flex justify-between">
                            <span>Sector 1-4 Shuttle:</span>
                            <span className="text-error font-semibold">
                              {cricketEvent ? cricketEvent.shuttleStatus : 'DELAYED (14m)'}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span>Alternative Parking:</span>
                            <span className="text-tertiary-container font-semibold">
                              {cricketEvent ? `${cricketEvent.alternativeParkingSpots} Spots left` : '120 Spots left'}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span>Transit Corridors:</span>
                            <span className="text-primary-container font-semibold">
                              {cricketEvent ? cricketEvent.transitCorridorRedirect : 'Redirect Active'}
                            </span>
                          </div>
                        </div>
                      </div>
                    ) : (
                      /* Abstract Stadium Grid Graphic */
                      <div className="w-full max-w-sm aspect-square relative flex items-center justify-center">
                        <div className="absolute inset-4 rounded-full border border-error/20"></div>
                        <div className="absolute inset-12 rounded-full border border-error/40 border-dashed animate-[spin_60s_linear_infinite]"></div>
                        <div className="absolute inset-24 rounded-full bg-error/10 border border-error/60 flex items-center justify-center shadow-[0_0_30px_rgba(255,180,171,0.2)]">
                          <span className="material-symbols-outlined text-error text-5xl">stadium</span>
                        </div>
                        {/* Data nodes */}
                        <div className="absolute top-1/4 right-1/4 w-3.5 h-3.5 bg-primary-container rounded-full neon-glow shadow-[0_0_8px_#ccd0cf]"></div>
                        <div className="absolute bottom-1/3 left-1/4 w-2 h-2 bg-primary-container rounded-full neon-glow"></div>
                        <div className="absolute top-1/2 -right-2 w-4 h-4 bg-error rounded-full animate-ping opacity-50"></div>
                        <div className="absolute top-1/2 -right-2 w-4 h-4 bg-error rounded-full"></div>
                      </div>
                    )}
                  </div>
                </div>

              </div>
            </section>

          </main>

          <Footer />
        </>
      )}

      {/* VIEW 2: INTERACTIVE DASHBOARD SYSTEM */}
      {currentView === 'app' && (
        <div className="min-h-screen bg-surface-container-lowest flex flex-col">
          
          {/* Dashboard Header */}
          <header className="h-16 border-b border-outline-variant/20 bg-surface-container-low px-gutter flex justify-between items-center z-20">
            <div className="flex items-center gap-3">
              <span className="material-symbols-outlined text-primary-container text-3xl">satellite_alt</span>
              <div>
                <h1 className="font-headline-sm text-on-surface font-bold text-base leading-none">Bhopal Tatkal Mamla</h1>
                <span className="font-data-sm text-[10px] text-on-surface-variant font-mono tracking-widest uppercase">Command Center v4.2</span>
              </div>
            </div>

            {/* Dynamic Alarm status */}
            {systemAlertsOn && (
              <div className="hidden lg:flex items-center gap-3 px-3 py-1 bg-error/10 border border-error/30 rounded">
                <span className="w-2.5 h-2.5 bg-error rounded-full animate-ping"></span>
                <span className="font-data-sm text-xs text-error font-mono font-bold tracking-wider">EVENT ALERT LEVEL II ACTIVE</span>
              </div>
            )}

            <div className="flex items-center gap-4">
              <button 
                onClick={handleToggleAlarms}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded text-xs border font-mono transition-all cursor-pointer ${systemAlertsOn ? 'bg-error/10 border-error/50 text-error' : 'border-outline-variant/20 text-on-surface-variant'}`}
              >
                <span className="material-symbols-outlined text-sm">notifications_active</span>
                {systemAlertsOn ? 'Alarms: ENABLED' : 'Alarms: MUTED'}
              </button>
              <button 
                onClick={() => setCurrentView('landing')}
                className="bg-surface border border-outline-variant/30 text-on-surface px-4 py-1.5 rounded text-xs font-mono hover:bg-surface-container-high transition-colors flex items-center gap-1.5 cursor-pointer"
              >
                <span className="material-symbols-outlined text-sm">exit_to_app</span>
                Exit Control Room
              </button>
            </div>
          </header>

          {/* Dashboard Body Grid Layout */}
          <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-6 p-6 overflow-hidden">
            
            {/* Left Controls & Status Column (4 cols) */}
            <div className="lg:col-span-4 flex flex-col gap-6">
              
              {/* Live telemetry widgets */}
              <div className="glass-panel p-5 rounded-lg border-outline-variant/20 space-y-4">
                <div className="flex items-center justify-between border-b border-outline-variant/10 pb-2">
                  <h3 className="text-xs uppercase font-mono tracking-widest text-primary-container">Sensors Feed Node</h3>
                  <span className="text-[10px] text-tertiary-container font-mono bg-tertiary-container/10 border border-tertiary-container/30 px-1.5 py-0.5 rounded">ONLINE</span>
                </div>

                <div className="space-y-3">
                  {zones.map((zone, idx) => (
                    <div 
                      key={zone.name} 
                      onClick={() => handleZoneSelect(idx)}
                      className={`p-3 rounded border transition-all cursor-pointer flex justify-between items-center ${selectedZoneIdx === idx ? 'border-primary-container bg-primary-container/5' : 'border-outline-variant/10 hover:bg-surface-container/20'}`}
                    >
                      <div>
                        <div className="text-xs font-bold">{zone.name}</div>
                        <div className="text-[10px] text-on-surface-variant font-mono mt-0.5">{zone.coordinates}</div>
                      </div>
                      <div className="text-right">
                        <div className={`text-base font-bold font-mono ${selectedZoneIdx === idx ? 'text-primary-container' : 'text-on-surface'}`}>{zone.temp}</div>
                        <div className="text-[9px] font-mono text-on-surface-variant">{zone.density} traffic</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Console Logs Terminal Output (Uses JetBrains Mono) */}
              <div className="glass-panel flex-1 min-h-[220px] p-5 rounded-lg border-outline-variant/20 flex flex-col">
                <div className="flex items-center justify-between border-b border-outline-variant/10 pb-2 mb-3">
                  <h3 className="text-xs uppercase font-mono tracking-widest text-primary-container flex items-center gap-1.5">
                    <span className="material-symbols-outlined text-sm">terminal</span>
                    Live Dispatch Console
                  </h3>
                  <button 
                    onClick={() => setTerminalLogs(INITIAL_LOGS)}
                    className="text-[10px] font-mono text-on-surface-variant hover:text-on-surface"
                  >
                    Clear Logs
                  </button>
                </div>

                <div 
                  ref={logContainerRef}
                  className="flex-1 overflow-y-auto font-data-sm text-data-sm text-on-surface-variant font-mono space-y-1.5 max-h-[280px] scrollbar-thin scrollbar-thumb-surface-container-high"
                >
                  {terminalLogs.map((log, idx) => (
                    <div key={idx} className="leading-relaxed hover:text-on-surface transition-colors flex gap-2">
                      <span className="text-primary-container select-none">&gt;</span>
                      <span>{log}</span>
                    </div>
                  ))}
                </div>
              </div>

            </div>

            {/* Middle Main Map Canvas (5 cols) */}
            <div className="lg:col-span-5 flex flex-col gap-6">
              <div className="glass-panel flex-1 rounded-lg border-outline-variant/20 overflow-hidden relative flex flex-col min-h-[400px]">
                
                {/* Map Control overlay */}
                <div className="absolute top-4 left-4 z-10 flex gap-2">
                  {['satellite', 'heatmap', 'vector'].map(mode => (
                    <button
                      key={mode}
                      onClick={() => setDashboardMapMode(mode)}
                      className={`px-2.5 py-1 text-xs font-mono border rounded capitalize transition-all ${dashboardMapMode === mode ? 'bg-primary-container text-on-primary-container border-primary-container' : 'border-outline-variant/30 text-on-surface-variant hover:text-on-surface bg-surface-container-low'}`}
                    >
                      {mode}
                    </button>
                  ))}
                </div>

                {mapsLoaded && !mapsLoadingError ? (
                  <div ref={dashboardMapRef} className="flex-1 w-full h-full relative z-10"></div>
                ) : (
                  <div className="flex-1 bg-surface-container-highest/60 relative flex items-center justify-center">
                    <img 
                      alt="Satellite view" 
                      className={`absolute inset-0 w-full h-full object-cover transition-all duration-500 ${dashboardMapMode === 'heatmap' ? 'opacity-20 hue-rotate-60 invert' : dashboardMapMode === 'vector' ? 'opacity-10 grayscale brightness-75' : 'opacity-40 mix-blend-luminosity'}`} 
                      src="https://lh3.googleusercontent.com/aida-public/AB6AXuDhrXSs1PNq1SJUkXvdHzGBCq4y0ywPid6uqRw4iv8bZ8tkEdRzqvqlxryMBz-W4nuAjdficXWb-EEaxpppwh4bMDBNDukmwLKa9Rj0NbPKI4worBKpJJmTRKwMJfhc_oZ2FusOuq3fXLAZnz1eGJwefJEtNvteVdTkRMAzUWtt9FMDWPO0um0t6qZhdwqavu2xLcdmwkP6SwLf_YhVCFInnr3Zk7nyo-8nkpQr_1-9rkt6zn8HX8FwbkFbhybnKec8AOkYzc29px0"
                    />
                    
                    {/* Grid Lines on Top */}
                    {dashboardMapMode === 'vector' && (
                      <div className="absolute inset-0 bg-cyber-grid opacity-60 pointer-events-none transition-all duration-300"></div>
                    )}

                    {/* Heatmap color gradient overlays */}
                    {dashboardMapMode === 'heatmap' && (
                      <div className="absolute inset-0 bg-gradient-to-tr from-error/30 via-transparent to-primary-container/20 pointer-events-none transition-all duration-500"></div>
                    )}

                    {/* Pulsing Surge detected Node on Map */}
                    <div 
                      onMouseEnter={() => setHoveredMapNode('surge')}
                      onMouseLeave={() => setHoveredMapNode(null)}
                      className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"
                    >
                      <div className="w-6 h-6 bg-error rounded-full animate-ping absolute opacity-75"></div>
                      <div className="w-6 h-6 bg-error rounded-full relative z-10 cursor-pointer shadow-[0_0_15px_#ffb4ab]"></div>
                      {hoveredMapNode === 'surge' && (
                        <div className="absolute left-8 -top-4 font-data-sm text-xs text-on-surface bg-surface-container-low/95 px-3 py-2 rounded border border-error whitespace-nowrap shadow-xl flex flex-col gap-1 z-30">
                          <span className="text-error font-bold flex items-center gap-1">Warning: Grid Surge</span>
                          <span className="text-xs text-on-surface-variant font-mono">Incident #849 - TT Nagar</span>
                          <span className="text-[10px] text-on-surface-variant font-mono">Priority routing diverted</span>
                        </div>
                      )}
                    </div>

                    {/* Stadium Node */}
                    <div 
                      onMouseEnter={() => setHoveredMapNode('stadium')}
                      onMouseLeave={() => setHoveredMapNode(null)}
                      className="absolute top-1/3 right-1/3"
                    >
                      <div className="w-4 h-4 bg-tertiary-container rounded-full animate-ping absolute opacity-50"></div>
                      <div className="w-4.5 h-4.5 bg-tertiary-container rounded-full relative z-10 cursor-pointer shadow-[0_0_10px_#bfd2e4]"></div>
                      {hoveredMapNode === 'stadium' && (
                        <div className="absolute left-8 -top-4 font-data-sm text-xs text-on-surface bg-surface-container-low/95 px-3 py-2 rounded border border-tertiary-container whitespace-nowrap shadow-xl flex flex-col gap-1 z-30">
                          <span className="text-tertiary-container font-semibold">Stadium Zone (Event Active)</span>
                          <span className="text-xs text-on-surface-variant font-mono">Cricket Mode activated</span>
                          <span className="text-[10px] text-on-surface-variant font-mono">Alternative Shuttle routes active</span>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                <div className="h-10 border-t border-outline-variant/10 bg-surface-container px-3 flex items-center justify-between font-mono text-[10px] text-on-surface-variant">
                  <span>Coordinates: 23.2500° N, 77.4170° E</span>
                  <span>Sensor Sync: 100% (STABLE)</span>
                </div>
              </div>
            </div>

            {/* Right Transit Data & Stats Column (3 cols) */}
            <div className="lg:col-span-3 flex flex-col gap-6">
              
              {/* Transit Hubs Card */}
              <div className="glass-panel p-5 rounded-lg border-outline-variant/20 flex-1 flex flex-col">
                <div className="flex items-center justify-between border-b border-outline-variant/10 pb-2 mb-4">
                  <h3 className="text-xs uppercase font-mono tracking-widest text-primary-container">Transit Hub Flow</h3>
                  <span className="material-symbols-outlined text-sm text-on-surface-variant">directions_transit</span>
                </div>

                <div className="space-y-4 flex-1 overflow-y-auto">
                  {stations.map(st => (
                    <div key={st.name} className="space-y-2 border-b border-outline-variant/10 pb-3 last:border-0 last:pb-0">
                      <div className="flex justify-between items-center">
                        <span className="text-xs font-bold text-on-surface">{st.name.split(' ')[0]}</span>
                        <span className={`text-[10px] px-2 py-0.5 rounded font-mono ${st.color}`}>
                          {st.status.split(' ')[0]}
                        </span>
                      </div>
                      <div className="flex justify-between items-center text-xs font-mono text-on-surface-variant">
                        <span>FLOW RATE</span>
                        <span>{st.flowRate}</span>
                      </div>
                      <div className="w-full h-1 bg-surface-container rounded-full overflow-hidden">
                        <div 
                          className={`h-full transition-all duration-500 ${st.status === 'High Density' ? 'bg-error w-[85%]' : st.status === 'Low Density' ? 'bg-primary-container w-[25%]' : 'bg-tertiary-container w-[55%]'}`}
                        ></div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* System Configuration Metrics card */}
              <div className="glass-panel p-5 rounded-lg border-outline-variant/20 space-y-4">
                <div className="flex items-center justify-between border-b border-outline-variant/10 pb-2">
                  <h3 className="text-xs uppercase font-mono tracking-widest text-primary-container">Command Parameters</h3>
                  <span className="material-symbols-outlined text-sm text-on-surface-variant">tune</span>
                </div>

                <div className="space-y-3 font-mono text-xs">
                  <div className="flex justify-between items-center py-1">
                    <span className="text-on-surface-variant">Shuttle corridors:</span>
                    <span className="text-tertiary-container font-semibold">4 ACTIVE</span>
                  </div>
                  <div className="flex justify-between items-center py-1">
                    <span className="text-on-surface-variant">Speed Weights:</span>
                    <span className="text-on-surface">30% (Speed)</span>
                  </div>
                  <div className="flex justify-between items-center py-1">
                    <span className="text-on-surface-variant">Comfort Weights:</span>
                    <span className="text-primary-container font-semibold">70% (Comfort)</span>
                  </div>
                  <div className="flex justify-between items-center py-1">
                    <span className="text-on-surface-variant">Rerouting core:</span>
                    <span className="text-tertiary-container font-semibold">OPTIMIZED</span>
                  </div>
                </div>
              </div>

            </div>

          </div>

          {/* Footer Bar */}
          <footer className="h-10 border-t border-outline-variant/20 bg-surface-container-low px-gutter flex justify-between items-center text-xs font-mono text-on-surface-variant">
            <span>Grid state: STABLE</span>
            <span>SYSTEM CLOCK: {new Date().toLocaleTimeString()}</span>
          </footer>

        </div>
      )}

    </div>
  );
}