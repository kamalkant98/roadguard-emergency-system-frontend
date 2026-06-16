import { useState, useEffect, useRef } from 'react';
import { GoogleMap, useJsApiLoader, Marker, Circle, Polyline } from '@react-google-maps/api';

// Styles for the map container - full screen height and width
const mapContainerStyle = {
  width: '100%',
  height: '100vh'  // vh = viewport height, makes map take full screen
};

const TrekkingMap = () => {
  // ============================================
  // API KEY & CONFIGURATION
  // ============================================
  const API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;  // Get API key from environment variables

  // ============================================
  // STATE VARIABLES - These hold all the data for our app
  // ============================================
  
  // Location tracking states
  const [currentLocation, setCurrentLocation] = useState(null);  // User's current position {lat, lng}
  const [accuracy, setAccuracy] = useState(null);                // GPS accuracy in meters (lower is better)
  const [loading, setLoading] = useState(true);                  // Shows loading spinner while getting GPS
  const [error, setError] = useState(null);                      // Stores any error messages
  
  // Navigation states
  const [destination, setDestination] = useState(null);          // Where user wants to go {lat, lng, address}
  const [route, setRoute] = useState(null);                      // Complete route data from Google
  const [distance, setDistance] = useState(null);                // Total trip distance (e.g., "15.2 km")
  const [duration, setDuration] = useState(null);                // Total trip time (e.g., "25 mins")
  const [remainingDistance, setRemainingDistance] = useState(null); // Distance left in meters
  const [remainingDuration, setRemainingDuration] = useState(null); // Time left in seconds
  
  // Vehicle tracking states
  const [vehiclePath, setVehiclePath] = useState([]);            // Array of positions where vehicle has been
  const [currentSpeed, setCurrentSpeed] = useState(0);           // Current speed in km/h
  const [eta, setEta] = useState(null);                          // Estimated time of arrival
  
  // UI states
  const [showDestinationInput, setShowDestinationInput] = useState(true); // Show/hide destination search box
  const [isNavigating, setIsNavigating] = useState(false);       // Are we currently navigating?
  
  // Search/autocomplete states
  const [searchQuery, setSearchQuery] = useState('');            // Text user types in search box
  const [predictions, setPredictions] = useState([]);            // Address suggestions from Google
  const [showPredictions, setShowPredictions] = useState(false); // Show/hide suggestions dropdown
  const [isSearching, setIsSearching] = useState(false);         // Show loading indicator while searching
  
  // Google services states
  const [autocompleteService, setAutocompleteService] = useState(null); // Handles address suggestions
  const [placesService, setPlacesService] = useState(null);             // Gets detailed place info
  
  // Advanced navigation states
  const [routeAlternatives, setRouteAlternatives] = useState([]);       // Alternative route options
  const [selectedRouteIndex, setSelectedRouteIndex] = useState(0);      // Currently selected route (0 = main)
  const [showRouteOptions, setShowRouteOptions] = useState(false);      // Show/hide alternatives panel
  const [trafficEnabled, setTrafficEnabled] = useState(false);          // Traffic layer on/off
  const [waypoints, setWaypoints] = useState([]);                       // Stops along the route
  const [showWaypointInput, setShowWaypointInput] = useState(false);    // Show/hide waypoint input
  const [waypointQuery, setWaypointQuery] = useState('');               // Waypoint search text
  const [waypointPredictions, setWaypointPredictions] = useState([]);   // Waypoint suggestions
  const [isCalculatingRoute, setIsCalculatingRoute] = useState(false);  // Prevent multiple route calculations
  
  // Additional tracking states
  const [routePolyline, setRoutePolyline] = useState(null);             // Path coordinates for the route

  // ============================================
  // REFS - Mutable values that don't trigger re-renders
  // ============================================
  const searchTimeoutRef = useRef(null);          // For debouncing search (prevents too many API calls)
  const mapRef = useRef(null);                    // Reference to the Google Map instance
  const directionsRendererRef = useRef(null);     // Renders the route line on map
  const trafficLayerRef = useRef(null);           // Traffic overlay layer
  const routeCalculationTimeoutRef = useRef(null); // For debouncing route calculations

  // ============================================
  // LOAD GOOGLE MAPS API
  // ============================================
  const { isLoaded, loadError } = useJsApiLoader({
    googleMapsApiKey: API_KEY,      // Your API key
    libraries: ['places']           // Places library enables address autocomplete
  });

  // ============================================
  // INITIALIZE GOOGLE SERVICES (runs when map loads)
  // ============================================
  useEffect(() => {
    if (isLoaded && window.google) {
      // Create service for address autocomplete
      setAutocompleteService(new window.google.maps.places.AutocompleteService());
      
      // Create service for getting detailed place info (coordinates, full address)
      setPlacesService(new window.google.maps.places.PlacesService(document.createElement('div')));
      
      // Create the route renderer - this draws the blue line on map
      const renderer = new window.google.maps.DirectionsRenderer({
        polylineOptions: {
          strokeColor: "#4285F4",   // Blue color for route
          strokeWeight: 5,           // Line thickness
          strokeOpacity: 0.8,        // Slightly transparent
        },
        suppressMarkers: true,       // Don't show default markers (we'll add custom ones)
        preserveViewport: false      // Let map adjust to show route
      });
      directionsRendererRef.current = renderer;
      
      // Create traffic layer (initially hidden)
      trafficLayerRef.current = new window.google.maps.TrafficLayer();
    }
  }, [isLoaded]);

  // ============================================
  // ADDRESS AUTOCOMPLETE - Shows suggestions as user types
  // ============================================
  useEffect(() => {
    // Don't search if: no service, empty query, or less than 3 characters
    if (!autocompleteService || !searchQuery.trim() || searchQuery.length < 3) {
      setPredictions([]);
      setShowPredictions(false);
      return;
    }

    // Clear previous timeout to implement debouncing
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    setIsSearching(true);  // Show loading indicator

    // Wait 300ms after user stops typing before searching
    searchTimeoutRef.current = setTimeout(() => {
      const request = {
        input: searchQuery,
        types: ['geocode', 'establishment'],  // Search for addresses and businesses
        componentRestrictions: { country: 'in' },  // Restrict to India (change as needed)
      };

      // Ask Google for address suggestions
      autocompleteService.getPlacePredictions(request, (predictions, status) => {
        setIsSearching(false);
        if (status === window.google.maps.places.PlacesServiceStatus.OK && predictions) {
          setPredictions(predictions);      // Store suggestions
          setShowPredictions(true);         // Show dropdown
        } else {
          setPredictions([]);               // No suggestions
          setShowPredictions(false);
        }
      });
    }, 300);  // 300ms delay = debouncing

    // Cleanup: cancel search if user types again quickly
    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, [searchQuery, autocompleteService]);

  // ============================================
  // WAYPOINT AUTOCOMPLETE (for adding stops along route)
  // ============================================
  useEffect(() => {
    if (!autocompleteService || !waypointQuery.trim() || waypointQuery.length < 3) {
      setWaypointPredictions([]);
      return;
    }

    const timeoutId = setTimeout(() => {
      const request = {
        input: waypointQuery,
        types: ['geocode', 'establishment'],
        componentRestrictions: { country: 'in' },
      };

      autocompleteService.getPlacePredictions(request, (predictions, status) => {
        if (status === window.google.maps.places.PlacesServiceStatus.OK && predictions) {
          setWaypointPredictions(predictions);
        } else {
          setWaypointPredictions([]);
        }
      });
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [waypointQuery, autocompleteService]);

  // ============================================
  // CALCULATE ROUTE - Gets directions from Google (FIXED VERSION)
  // ============================================
  const calculateRoute = async (origin, dest, isInitial = true, waypointsList = waypoints) => {
    // Don't calculate if missing required data
    if (!window.google || !origin || !dest) {
      console.warn("Missing required data for route calculation:", { origin, dest });
      return null;
    }

    // Prevent multiple simultaneous calculations
    if (isCalculatingRoute) {
      console.log("Route calculation already in progress, skipping...");
      return null;
    }

    setIsCalculatingRoute(true);

    try {
      const directionsService = new window.google.maps.DirectionsService();
      
      // Prepare waypoints - ensure they have valid locations
      const validWaypoints = waypointsList.filter(wp => wp && wp.location && wp.location.lat && wp.location.lng);
      
      const request = {
        origin: origin,
        destination: dest,
        travelMode: window.google.maps.TravelMode.DRIVING,
        unitSystem: window.google.maps.UnitSystem.METRIC,
        provideRouteAlternatives: true,   // Get multiple route options
        optimizeWaypoints: validWaypoints.length > 0, // Only optimize if we have waypoints
        waypoints: validWaypoints.map(wp => ({
          location: wp.location,
          stopover: true
        }))
      };

      console.log("Calculating route with:", request);
      
      // Ask Google for the route
      const result = await directionsService.route(request);
      
      // Check if result and routes exist
      if (!result || !result.routes || result.routes.length === 0) {
        console.error("No routes found");
        setIsCalculatingRoute(false);
        return null;
      }
      
      setRoute(result);  // Store full route data
      
      // Store alternative routes (if any)
      if (result.routes.length > 1) {
        setRouteAlternatives(result.routes.slice(1));  // All routes except first
      } else {
        setRouteAlternatives([]);
      }
      
      // Make sure the selected route index is valid
      const routeIndex = Math.min(selectedRouteIndex, result.routes.length - 1);
      if (routeIndex !== selectedRouteIndex) {
        setSelectedRouteIndex(routeIndex);
      }
      
      // Check if legs array exists and has elements
      const selectedRoute = result.routes[routeIndex];
      if (!selectedRoute.legs || selectedRoute.legs.length === 0) {
        console.error("No legs in selected route");
        setIsCalculatingRoute(false);
        return null;
      }
      
      const leg = selectedRoute.legs[0];
      
      if (isInitial) {
        // First time calculating - set total distance and duration
        setDistance(leg.distance?.text || "Unknown");
        setDuration(leg.duration?.text || "Unknown");
        setRemainingDistance(leg.distance?.value || 0);
        setRemainingDuration(leg.duration?.value || 0);
      } else {
        // Real-time update - just update remaining values
        setRemainingDistance(leg.distance?.value || 0);
        setRemainingDuration(leg.duration?.value || 0);
        setDistance(leg.distance?.text || distance);
        setDuration(leg.duration?.text || duration);
      }
      
      // Draw the route on map
      if (directionsRendererRef.current && mapRef.current) {
        directionsRendererRef.current.setMap(mapRef.current);
        directionsRendererRef.current.setDirections(result);
        directionsRendererRef.current.setRouteIndex(routeIndex);
      }
      
      setIsCalculatingRoute(false);
      return result;
      
    } catch (error) {
      console.error("Error calculating route:", error);
      setIsCalculatingRoute(false);
      
      // Show user-friendly error message
      if (error.message === "ZERO_RESULTS") {
        setError("No route found. Please try a different destination or waypoints.");
        setTimeout(() => setError(null), 5000); // Clear error after 5 seconds
      } else if (error.message.includes("waypoints")) {
        setError("Invalid waypoint. Please remove and try again.");
        setTimeout(() => setError(null), 5000);
      }
      
      return null;
    }
  };

  // ============================================
  // REAL-TIME ROUTE UPDATES - Recalculates as vehicle moves (with debounce)
  // ============================================
  useEffect(() => {
    if (isNavigating && currentLocation && destination && window.google && !isCalculatingRoute) {
      // Clear previous timeout
      if (routeCalculationTimeoutRef.current) {
        clearTimeout(routeCalculationTimeoutRef.current);
      }
      
      // Debounce route recalculation to avoid too many API calls
      routeCalculationTimeoutRef.current = setTimeout(() => {
        calculateRoute(currentLocation, destination, false);
      }, 3000);  // Update every 3 seconds
      
      return () => {
        if (routeCalculationTimeoutRef.current) {
          clearTimeout(routeCalculationTimeoutRef.current);
        }
      };
    }
  }, [currentLocation, destination, isNavigating, waypoints]);

  // ============================================
  // SWITCH BETWEEN ALTERNATIVE ROUTES
  // ============================================
  const switchRoute = (index) => {
    if (!route || !route.routes[index]) return;
    
    setSelectedRouteIndex(index);  // Update selected route
    
    if (directionsRendererRef.current && route) {
      directionsRendererRef.current.setRouteIndex(index);  // Show new route on map
      
      // Update distance and duration for the new route
      const leg = route.routes[index].legs[0];
      if (leg) {
        setDistance(leg.distance?.text || "Unknown");
        setDuration(leg.duration?.text || "Unknown");
        setRemainingDistance(leg.distance?.value || 0);
        setRemainingDuration(leg.duration?.value || 0);
      }
    }
    setShowRouteOptions(false);  // Close the alternatives panel
  };

  // ============================================
  // TOGGLE TRAFFIC LAYER - Show/hide traffic conditions
  // ============================================
  const toggleTraffic = () => {
    if (trafficLayerRef.current && mapRef.current) {
      if (trafficEnabled) {
        trafficLayerRef.current.setMap(null);  // Remove traffic layer
        setTrafficEnabled(false);
      } else {
        trafficLayerRef.current.setMap(mapRef.current);  // Add traffic layer
        setTrafficEnabled(true);
      }
    }
  };

  // ============================================
  // ADD WAYPOINT - Add a stop along the route (FIXED VERSION)
  // ============================================
  const addWaypoint = (prediction) => {
    if (!placesService) return;
    
    // Show loading indicator
    setError("Adding waypoint...");
    
    placesService.getDetails(
      { placeId: prediction.place_id },
      (place, status) => {
        if (status === window.google.maps.places.PlacesServiceStatus.OK && place && place.geometry) {
          const newWaypoint = {
            location: {
              lat: place.geometry.location.lat(),
              lng: place.geometry.location.lng()
            },
            address: place.formatted_address || prediction.description,
            name: place.name || prediction.description.split(',')[0]
          };
          
          const updatedWaypoints = [...waypoints, newWaypoint];
          setWaypoints(updatedWaypoints);
          setWaypointQuery('');  // Clear search
          setWaypointPredictions([]);
          setShowWaypointInput(false); // Close the waypoint input
          setError(null); // Clear any previous errors
          
          // Recalculate route with the new waypoint
          if (currentLocation && destination) {
            calculateRoute(currentLocation, destination, false, updatedWaypoints);
          } else {
            console.warn("Cannot recalculate route: missing currentLocation or destination");
          }
        } else {
          console.error("Failed to get place details:", status);
          setError("Failed to add waypoint. Please try again.");
          setTimeout(() => setError(null), 3000);
        }
      }
    );
  };

  // ============================================
  // REMOVE WAYPOINT - Delete a stop from route
  // ============================================
  const removeWaypoint = (index) => {
    const updatedWaypoints = waypoints.filter((_, i) => i !== index);
    setWaypoints(updatedWaypoints);
    
    // Recalculate route without the waypoint
    if (currentLocation && destination) {
      calculateRoute(currentLocation, destination, false, updatedWaypoints);
    }
  };

  // ============================================
  // HANDLE DESTINATION SELECTION - User picks a suggestion
  // ============================================
  const handlePredictionSelect = (prediction) => {
    setSearchQuery(prediction.description);
    setShowPredictions(false);
    
    if (placesService) {
      // Get coordinates and full details of selected place
      placesService.getDetails(
        { placeId: prediction.place_id },
        (place, status) => {
          if (status === window.google.maps.places.PlacesServiceStatus.OK && place && place.geometry) {
            const location = {
              lat: place.geometry.location.lat(),
              lng: place.geometry.location.lng(),
              address: place.formatted_address || prediction.description,
              name: place.name || prediction.description.split(',')[0]
            };
            setDestination(location);
            setShowDestinationInput(false);  // Hide search box
            setIsNavigating(true);            // Start navigation
            
            // Calculate initial route
            if (currentLocation) {
              calculateRoute(currentLocation, location, true);
            }
          } else {
            alert("Could not get location details. Please try again.");
          }
        }
      );
    }
  };

  // ============================================
  // GPS TRACKING - Gets real-time location from device
  // ============================================
  useEffect(() => {
    // Check if browser supports geolocation
    if (!navigator.geolocation) {
      setError("Geolocation not supported");
      setLoading(false);
      return;
    }

    // GPS settings - prioritize accuracy over battery life
    const options = {
      enableHighAccuracy: true,  // Use GPS (not WiFi/cell tower)
      timeout: 5000,             // Wait max 5 seconds for GPS fix
      maximumAge: 0              // Don't use cached location
    };

    // Watch position - continuously track location
    const watchId = navigator.geolocation.watchPosition(
      (position) => {
        // Extract data from GPS
        const { latitude, longitude, accuracy, speed } = position.coords;
        
        const newLocation = { lat: latitude, lng: longitude };
        const speedKmh = speed ? (speed * 3.6) : 0;  // Convert m/s to km/h
        
        // Update state with new position
        setCurrentLocation(newLocation);
        setAccuracy(accuracy);
        setCurrentSpeed(speedKmh);
        
        // Add to path history (only if moved more than 5 meters)
        if (vehiclePath.length === 0 || 
            calculateDistance(vehiclePath[vehiclePath.length - 1], newLocation) > 5) {
          setVehiclePath(prev => [...prev, newLocation]);
        }
        
        setLoading(false);  // GPS acquired, hide loading

        // Check if we've reached the destination
        if (destination && isNavigating) {
          const distanceToDest = calculateDistance(newLocation, destination);
          if (distanceToDest < 50) {  // Within 50 meters
            setIsNavigating(false);
            // Show browser notification
            if (Notification.permission === "granted") {
              new Notification("Destination Reached!", {
                body: "You have arrived at your destination.",
                icon: "https://maps.google.com/favicon.ico"
              });
            }
          }
        }
      },
      (error) => {
        console.error("GPS Error:", error);
        setError(`GPS Error: ${error.message}`);
        setLoading(false);
      },
      options
    );

    // Ask for notification permission
    if (Notification && Notification.permission !== "granted" && Notification.permission !== "denied") {
      Notification.requestPermission();
    }

    // Cleanup: stop tracking when component unmounts
    return () => {
      if (watchId) navigator.geolocation.clearWatch(watchId);
    };
  }, [destination, isNavigating]);

  // ============================================
  // CALCULATE ETA - Estimated time of arrival
  // ============================================
  useEffect(() => {
    if (remainingDistance && remainingDistance > 0) {
      if (currentSpeed > 0) {
        // Calculate ETA based on current speed
        const etaMinutes = (remainingDistance / 1000) / currentSpeed * 60;
        if (etaMinutes < 60) {
          setEta(`${Math.round(etaMinutes)} mins`);
        } else {
          const hours = Math.floor(etaMinutes / 60);
          const minutes = Math.round(etaMinutes % 60);
          setEta(`${hours}h ${minutes}m`);
        }
      } else if (remainingDuration && remainingDuration > 0) {
        // Fallback to Google's duration estimate
        const mins = Math.round(remainingDuration / 60);
        if (mins < 60) {
          setEta(`${mins} mins`);
        } else {
          const hours = Math.floor(mins / 60);
          const minutes = mins % 60;
          setEta(`${hours}h ${minutes}m`);
        }
      }
    }
  }, [remainingDistance, currentSpeed, remainingDuration]);

  // ============================================
  // HELPER FUNCTION: Calculate distance between two points
  // Uses Haversine formula for accurate spherical distance
  // ============================================
  const calculateDistance = (point1, point2) => {
    if (!point1 || !point2) return 0;
    
    const R = 6371e3;  // Earth's radius in meters
    const lat1 = point1.lat * Math.PI / 180;  // Convert to radians
    const lat2 = point2.lat * Math.PI / 180;
    const deltaLat = (point2.lat - point1.lat) * Math.PI / 180;
    const deltaLng = (point2.lng - point1.lng) * Math.PI / 180;

    const a = Math.sin(deltaLat/2) * Math.sin(deltaLat/2) +
              Math.cos(lat1) * Math.cos(lat2) *
              Math.sin(deltaLng/2) * Math.sin(deltaLng/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;  // Distance in meters
  };

  // ============================================
  // RESET DESTINATION - Clear navigation and start over
  // ============================================
  const resetDestination = () => {
    setDestination(null);
    setRoute(null);
    setDistance(null);
    setDuration(null);
    setRemainingDistance(null);
    setRemainingDuration(null);
    setRoutePolyline(null);
    setShowDestinationInput(true);   // Show search box again
    setSearchQuery('');
    setPredictions([]);
    setIsNavigating(false);
    setVehiclePath([]);              // Clear path history
    setEta(null);
    setWaypoints([]);                // Clear stops
    setSelectedRouteIndex(0);
    setRouteAlternatives([]);
    setError(null);
    
    // Remove route from map
    if (directionsRendererRef.current && mapRef.current) {
      directionsRendererRef.current.setMap(null);
    }
  };

  // ============================================
  // FIT ROUTE BOUNDS - Zoom map to show entire route
  // ============================================
  const fitRouteBounds = () => {
    if (route && route.routes && route.routes[selectedRouteIndex] && mapRef.current && window.google) {
      const bounds = new window.google.maps.LatLngBounds();
      // Add all points of the route to bounds
      route.routes[selectedRouteIndex].overview_path.forEach(point => {
        bounds.extend(point);
      });
      // Also include current location
      if (currentLocation) {
        bounds.extend(new window.google.maps.LatLng(currentLocation.lat, currentLocation.lng));
      }
      mapRef.current.fitBounds(bounds);  // Zoom to show everything
    }
  };

  // ============================================
  // LOADING AND ERROR STATES
  // ============================================
  if (loadError) return <div>Error loading map</div>;      // Map failed to load
  if (!isLoaded) return <div>Loading map...</div>;         // Still loading
  if (error) return <div style={{padding: '20px', textAlign: 'center'}}>{error}</div>;                    // GPS error
  if (loading && !currentLocation) return <div style={{padding: '20px', textAlign: 'center'}}>Getting your precise location... 📡</div>;  // Acquiring GPS
  if (!currentLocation) return <div style={{padding: '20px', textAlign: 'center'}}>Waiting for GPS...</div>;

  // ============================================
  // MAIN RENDER - Display the map and UI
  // ============================================
  return (
    <div style={{ position: 'relative' }}>
      {/* ============================================ */}
      {/* DESTINATION INPUT DIALOG - Shows when no destination set */}
      {/* ============================================ */}
      {showDestinationInput && (
        <div style={{
          position: 'absolute',
          top: 20,
          left: '50%',
          transform: 'translateX(-50%)',  // Center horizontally
          background: 'white',
          padding: '20px',
          borderRadius: '12px',
          boxShadow: '0 4px 20px rgba(0,0,0,0.15)',
          zIndex: 1000,  // Show above map
          minWidth: '350px',
          maxWidth: '90%'
        }}>
          <h3 style={{ margin: '0 0 10px 0' }}>Where are you going?</h3>
          <form onSubmit={(e) => e.preventDefault()}>
            <div style={{ position: 'relative' }}>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Enter destination..."
                style={{
                  width: '100%',
                  padding: '12px',
                  border: '2px solid #e0e0e0',
                  borderRadius: '8px',
                  fontSize: '14px',
                  outline: 'none',
                  transition: 'border-color 0.2s'
                }}
                onFocus={(e) => e.target.style.borderColor = '#4285F4'}
                onBlur={(e) => e.target.style.borderColor = '#e0e0e0'}
                autoFocus
              />
              
              {/* Autocomplete Suggestions Dropdown */}
              {showPredictions && predictions.length > 0 && (
                <div style={{
                  position: 'absolute',
                  top: '100%',
                  left: 0,
                  right: 0,
                  background: 'white',
                  border: '1px solid #e0e0e0',
                  borderRadius: '8px',
                  maxHeight: '300px',
                  overflowY: 'auto',
                  zIndex: 1001,
                  boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                  marginTop: '4px'
                }}>
                  {predictions.map((prediction) => (
                    <div
                      key={prediction.place_id}
                      onClick={() => handlePredictionSelect(prediction)}
                      style={{
                        padding: '12px',
                        cursor: 'pointer',
                        borderBottom: '1px solid #f0f0f0',
                        transition: 'background 0.2s'
                      }}
                      onMouseEnter={(e) => e.target.style.background = '#f5f5f5'}
                      onMouseLeave={(e) => e.target.style.background = 'white'}
                    >
                      <div style={{ fontWeight: '500' }}>
                        {prediction.structured_formatting?.main_text || prediction.description.split(',')[0]}
                      </div>
                      <div style={{ fontSize: '12px', color: '#666' }}>
                        {prediction.structured_formatting?.secondary_text || 
                         prediction.description.split(',').slice(1).join(',').trim()}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </form>
        </div>
      )}

      {/* ============================================ */}
      {/* GOOGLE MAP COMPONENT */}
      {/* ============================================ */}
      <GoogleMap
        mapContainerStyle={mapContainerStyle}
        center={currentLocation}  // Center map on current position
        zoom={15}                  // Zoom level (higher = closer)
        onLoad={(map) => {
          mapRef.current = map;  // Store map reference
          if (directionsRendererRef.current) {
            directionsRendererRef.current.setMap(map);
          }
        }}
        options={{
          zoomControl: true,           // Show zoom buttons
          streetViewControl: false,    // Hide street view (cleaner UI)
          mapTypeControl: true,        // Show map/satellite toggle
          fullscreenControl: true,     // Show fullscreen button
        }}
      >
        {/* ============================================ */}
        {/* VEHICLE MARKER - Shows current position with arrow */}
        {/* ============================================ */}
        <Marker 
          position={currentLocation}
          icon={{
            path: window.google.maps.SymbolPath.FORWARD_CLOSED_ARROW,
            scale: 8,
            fillColor: '#4285F4',
            fillOpacity: 1,
            strokeColor: '#ffffff',
            strokeWeight: 3,
          }}
          title="Your Vehicle"
        />
        
        {/* ============================================ */}
        {/* VEHICLE PATH - Blue line showing where you've been */}
        {/* ============================================ */}
        <Polyline
          path={vehiclePath}
          options={{
            strokeColor: '#4285F4',
            strokeOpacity: 0.5,
            strokeWeight: 3,
            geodesic: true
          }}
        />
        
        {/* ============================================ */}
        {/* DESTINATION MARKER - Red pin showing where you're going */}
        {/* ============================================ */}
        {destination && (
          <Marker 
            position={destination}
            icon={{
              path: 'M12,2C8.13,2,5,5.13,5,9c0,5.25,7,13,7,13s7-7.75,7-13C19,5.13,15.87,2,12,2z M12,11.5c-1.38,0-2.5-1.12-2.5-2.5s1.12-2.5,2.5-2.5s2.5,1.12,2.5,2.5S13.38,11.5,12,11.5z',
              fillColor: '#FF4444',  // Red color
              fillOpacity: 1,
              strokeColor: '#ffffff',
              strokeWeight: 2,
              scale: 1.5,
              anchor: new window.google.maps.Point(12, 24)  // Point of pin
            }}
            title={destination.address || destination.name}
          />
        )}
        
        {/* ============================================ */}
        {/* WAYPOINT MARKERS - Numbered circles for stops */}
        {/* ============================================ */}
        {waypoints.map((waypoint, index) => (
          <Marker
            key={index}
            position={waypoint.location}
            label={{
              text: `${index + 1}`,  // Show number
              color: 'white',
              fontWeight: 'bold'
            }}
            icon={{
              path: window.google.maps.SymbolPath.CIRCLE,
              scale: 10,
              fillColor: '#FF9800',  // Orange
              fillOpacity: 1,
              strokeColor: '#ffffff',
              strokeWeight: 2
            }}
            title={waypoint.address}
          />
        ))}
        
        {/* ============================================ */}
        {/* ACCURACY CIRCLE - Shows GPS uncertainty area */}
        {/* ============================================ */}
        <Circle
          center={currentLocation}
          radius={accuracy}  // Circle size = GPS accuracy
          options={{
            fillColor: '#4285F4',
            fillOpacity: 0.1,  // Very transparent
            strokeColor: '#4285F4',
            strokeOpacity: 0.5,
            strokeWeight: 1
          }}
        />

        {/* ============================================ */}
        {/* CONTROL BUTTONS - Top-right floating buttons */}
        {/* ============================================ */}
        <div style={{
          position: 'absolute',
          top: 20,
          right: 20,
          zIndex: 1000,
          display: 'flex',
          gap: '10px',
          flexDirection: 'column'
        }}>
          {/* Traffic Toggle Button */}
          <button
            onClick={toggleTraffic}
            style={{
              background: trafficEnabled ? '#4285F4' : 'white',
              color: trafficEnabled ? 'white' : '#333',
              border: 'none',
              borderRadius: '8px',
              padding: '10px',
              cursor: 'pointer',
              boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
              fontSize: '20px'
            }}
            title="Toggle Traffic"
          >
            🚦
          </button>
          
          {/* Add Waypoint Button */}
          <button
            onClick={() => setShowWaypointInput(!showWaypointInput)}
            style={{
              background: showWaypointInput ? '#4285F4' : 'white',
              color: showWaypointInput ? 'white' : '#333',
              border: 'none',
              borderRadius: '8px',
              padding: '10px',
              cursor: 'pointer',
              boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
              fontSize: '20px'
            }}
            title="Add Waypoint"
          >
            ⚐
          </button>
          
          {/* Route Options Button (only shows if alternatives exist) */}
          {routeAlternatives.length > 0 && (
            <button
              onClick={() => setShowRouteOptions(!showRouteOptions)}
              style={{
                background: 'white',
                border: 'none',
                borderRadius: '8px',
                padding: '10px',
                cursor: 'pointer',
                boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
                fontSize: '20px'
              }}
              title="Route Options"
            >
              🗺️
            </button>
          )}
        </div>

        {/* ============================================ */}
        {/* WAYPOINT INPUT PANEL - Add stops along route */}
        {/* ============================================ */}
        {showWaypointInput && (
          <div style={{
            position: 'absolute',
            top: 80,
            right: 20,
            background: 'white',
            borderRadius: '8px',
            padding: '15px',
            boxShadow: '0 2px 10px rgba(0,0,0,0.2)',
            zIndex: 1000,
            width: '300px'
          }}>
            <h4 style={{ margin: '0 0 10px 0' }}>Add Stop</h4>
            <input              type="text"
              value={waypointQuery}
              onChange={(e) => setWaypointQuery(e.target.value)}
              placeholder="Search for a place..."
              style={{
                width: '100%',
                padding: '8px',
                border: '1px solid #ccc',
                borderRadius: '4px',
                marginBottom: '10px'
              }}
              autoFocus
            />
            {/* Waypoint suggestions */}
            {waypointPredictions.map((prediction) => (
              <div
                key={prediction.place_id}
                onClick={() => addWaypoint(prediction)}
                style={{
                  padding: '8px',
                  cursor: 'pointer',
                  borderBottom: '1px solid #eee',
                  transition: 'background 0.2s'
                }}
                onMouseEnter={(e) => e.target.style.background = '#f5f5f5'}
                onMouseLeave={(e) => e.target.style.background = 'white'}
              >
                <div style={{ fontSize: '12px' }}>{prediction.description}</div>
              </div>
            ))}
            {waypointPredictions.length === 0 && waypointQuery.length > 2 && (
              <div style={{ fontSize: '12px', color: '#666', textAlign: 'center', padding: '8px' }}>
                No results found. Try different search terms.
              </div>
            )}
            <button
              onClick={() => setShowWaypointInput(false)}
              style={{
                width: '100%',
                padding: '8px',
                background: '#FF4444',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer',
                marginTop: '10px'
              }}
            >
              Close
            </button>
          </div>
        )}

        {/* ============================================ */}
        {/* ROUTE ALTERNATIVES PANEL - Show other route options */}
        {/* ============================================ */}
        {showRouteOptions && routeAlternatives.length > 0 && (
          <div style={{
            position: 'absolute',
            bottom: 100,
            left: 20,
            right: 20,
            background: 'white',
            borderRadius: '12px',
            padding: '15px',
            boxShadow: '0 2px 10px rgba(0,0,0,0.2)',
            zIndex: 1000,
            maxWidth: '400px'
          }}>
            <h4 style={{ margin: '0 0 10px 0' }}>Alternative Routes</h4>
            {routeAlternatives.map((altRoute, index) => (
              <div
                key={index}
                onClick={() => switchRoute(index + 1)}  // +1 because first route is index 0
                style={{
                  padding: '10px',
                  marginBottom: '8px',
                  background: selectedRouteIndex === index + 1 ? '#E3F2FD' : '#f5f5f5',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  border: selectedRouteIndex === index + 1 ? '2px solid #4285F4' : 'none'
                }}
              >
                <div style={{ fontWeight: 'bold' }}>
                  Route {index + 2}: {altRoute.legs[0]?.distance?.text || 'Unknown'}
                </div>
                <div style={{ fontSize: '12px', color: '#666' }}>
                  {altRoute.legs[0]?.duration?.text || 'Unknown'}
                </div>
              </div>
            ))}
            <button
              onClick={() => setShowRouteOptions(false)}
              style={{
                width: '100%',
                padding: '8px',
                background: '#4285F4',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer'
              }}
            >
              Close
            </button>
          </div>
        )}

        {/* ============================================ */}
        {/* WAYPOINTS LIST - Shows all added stops */}
        {/* ============================================ */}
        {waypoints.length > 0 && (
          <div style={{
            position: 'absolute',
            bottom: 20,
            left: 20,
            background: 'rgba(0,0,0,0.85)',
            color: 'white',
            padding: '10px',
            borderRadius: '8px',
            fontSize: '12px',
            zIndex: 1000,
            maxWidth: '200px'
          }}>
            <div style={{ fontWeight: 'bold', marginBottom: '5px' }}>Stops:</div>
            {waypoints.map((wp, idx) => (
              <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '5px' }}>
                <span style={{ fontSize: '11px', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {idx + 1}. {wp.address?.substring(0, 25) || 'Stop'}
                </span>
                <button
                  onClick={() => removeWaypoint(idx)}
                  style={{
                    background: '#FF4444',
                    color: 'white',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: 'pointer',
                    padding: '2px 6px',
                    marginLeft: '5px',
                    fontSize: '10px'
                  }}
                >
                  ✕
                </button>
              </div>
            ))}
          </div>
        )}

        {/* ============================================ */}
        {/* NAVIGATION CARD - Main info panel during navigation */}
        {/* ============================================ */}
        {isNavigating && destination && (
          <div style={{
            position: 'absolute',
            top: 20,
            left: 20,
            right: 20,
            background: 'white',
            borderRadius: '12px',
            boxShadow: '0 4px 20px rgba(0,0,0,0.15)',
            zIndex: 1000,
            overflow: 'hidden',
            maxWidth: '400px'
          }}>
            {/* Header with distance and duration */}
            <div style={{
              padding: '16px',
              borderBottom: '1px solid #e0e0e0'
            }}>
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '8px'
              }}>
                <div style={{ fontWeight: 'bold', fontSize: '18px' }}>
                  {distance || 'Calculating...'} • {duration || 'Calculating...'}
                </div>
                <button
                  onClick={fitRouteBounds}
                  style={{
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    fontSize: '20px'
                  }}
                  title="Show full route"
                >
                  🗺️
                </button>
              </div>
              <div style={{ fontSize: '14px', color: '#666' }}>
                🎯 {destination.address?.substring(0, 60) || destination.name}
              </div>
              {waypoints.length > 0 && (
                <div style={{ fontSize: '12px', color: '#FF9800', marginTop: '5px' }}>
                  🚩 {waypoints.length} stop{waypoints.length > 1 ? 's' : ''} along route
                </div>
              )}
            </div>
            
            {/* Stats row - ETA, Distance Left, Speed */}
            <div style={{
              display: 'flex',
              padding: '16px',
              background: '#f8f9fa',
              justifyContent: 'space-between'
            }}>
              <div style={{ textAlign: 'center', flex: 1 }}>
                <div style={{ fontSize: '12px', color: '#666' }}>ETA</div>
                <div style={{ fontSize: '20px', fontWeight: 'bold', color: '#4285F4' }}>
                  {eta || 'Calculating...'}
                </div>
              </div>
              <div style={{ textAlign: 'center', flex: 1 }}>
                <div style={{ fontSize: '12px', color: '#666' }}>Distance Left</div>
                <div style={{ fontSize: '20px', fontWeight: 'bold' }}>
                  {remainingDistance ? `${(remainingDistance / 1000).toFixed(1)} km` : distance || 'Calculating...'}
                </div>
              </div>
              <div style={{ textAlign: 'center', flex: 1 }}>
                <div style={{ fontSize: '12px', color: '#666' }}>Speed</div>
                <div style={{ fontSize: '20px', fontWeight: 'bold' }}>
                  {currentSpeed.toFixed(1)} km/h
                </div>
              </div>
            </div>
            
            {/* End Navigation Button */}
            <button
              onClick={resetDestination}
              style={{
                width: '100%',
                padding: '12px',
                background: '#FF4444',
                color: 'white',
                border: 'none',
                fontSize: '14px',
                fontWeight: 'bold',
                cursor: 'pointer'
              }}
            >
              End Navigation
            </button>
          </div>
        )}

        {/* ============================================ */}
        {/* MINI GPS STATUS - Bottom-right corner */}
        {/* ============================================ */}
        <div style={{
          position: 'absolute',
          bottom: 20,
          right: 20,
          background: 'rgba(0,0,0,0.7)',
          color: 'white',
          padding: '6px 12px',
          borderRadius: '20px',
          fontSize: '11px',
          zIndex: 1000,
          backdropFilter: 'blur(5px)'
        }}>
          📡 {Math.round(accuracy)}m • {currentSpeed.toFixed(0)}km/h
          {trafficEnabled && " • 🚦 Traffic"}
          {waypoints.length > 0 && ` • ${waypoints.length} stop${waypoints.length > 1 ? 's' : ''}`}
          {isCalculatingRoute && " • 🔄 Updating..."}
        </div>
      </GoogleMap>
    </div>
  );
};

export default TrekkingMap;