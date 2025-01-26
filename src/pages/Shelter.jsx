import React, { useEffect, useRef } from 'react';
import { Loader } from '@googlemaps/js-api-loader';

const ShelterFinder = () => {
  const mapRef = useRef(null);
  const searchInputRef = useRef(null);
  const markersRef = useRef([]);
  const serviceRef = useRef(null);
  const directionsServiceRef = useRef(null);
  const directionsRendererRef = useRef(null);

  useEffect(() => {
    const loader = new Loader({
      apiKey: "AIzaSyAYoQLuc9_1QK50-Mes1hEj_7eTPS32eM8",
      version: "weekly",
      libraries: ["places"]
    });

    loader.load().then(() => {
      initMap();
    });

    return () => {
      clearMarkers();
    };
  }, []);

  const initMap = () => {
    const map = new window.google.maps.Map(mapRef.current, {
      center: { lat: 33.669445, lng: -117.823059 },
      zoom: 12,
    });

    directionsServiceRef.current = new window.google.maps.DirectionsService();
    directionsRendererRef.current = new window.google.maps.DirectionsRenderer();
    directionsRendererRef.current.setMap(map);

    const searchBox = new window.google.maps.places.SearchBox(searchInputRef.current);

    searchBox.addListener("places_changed", () => {
      const places = searchBox.getPlaces();
      if (places.length === 0) return;

      const place = places[0];
      if (!place.geometry || !place.geometry.location) return;

      const destinationLocation = place.geometry.location;
      map.setCenter(destinationLocation);
      map.setZoom(14);

      findNearbyShelters(destinationLocation, map);
    });
  };

  const findNearbyShelters = (location, map) => {
    clearMarkers();
    directionsRendererRef.current.setDirections({ routes: [] });

    serviceRef.current = new window.google.maps.places.PlacesService(map);
    serviceRef.current.nearbySearch(
      {
        location: location,
        radius: 5000,
        keyword: "shelter",
      },
      (results, status) => {
        if (status === window.google.maps.places.PlacesServiceStatus.OK && results) {
          results.forEach((place) => {
            if (place.geometry && place.geometry.location) {
              addMarker(
                place.geometry.location,
                place.name,
                "blue",
                location,
                map
              );
            }
          });
        } else {
          console.error("No shelters found or Places API error:", status);
        }
      }
    );
  };

  const addMarker = (location, title, color, userLocation, map) => {
    const icon =
      color === "blue"
        ? {
            url: "https://cdn-icons-png.flaticon.com/512/25/25694.png",
            scaledSize: new window.google.maps.Size(70, 70),
            origin: new window.google.maps.Point(0, 0),
            anchor: new window.google.maps.Point(15, 30),
          }
        : "https://maps.google.com/mapfiles/ms/icons/green-dot.png";

    const marker = new window.google.maps.Marker({
      position: location,
      map,
      title,
      icon,
    });

    markersRef.current.push(marker);

    const infoWindow = new window.google.maps.InfoWindow({
      content: `<b>${title}</b><br>
        <button id="directions-btn-${markersRef.current.length - 1}">Start Navigation</button>`,
    });

    marker.addListener("click", () => {
      infoWindow.open(map, marker);
      
      // Add event listener to dynamically created button
      setTimeout(() => {
        const btn = document.getElementById(`directions-btn-${markersRef.current.length - 1}`);
        if (btn) {
          btn.addEventListener('click', () => 
            showDirections(userLocation.lat(), userLocation.lng(), location.lat(), location.lng())
          );
        }
      }, 100);
    });
  };

  const showDirections = (startLat, startLng, destLat, destLng) => {
    const start = { lat: startLat, lng: startLng };
    const end = { lat: destLat, lng: destLng };

    const request = {
      origin: start,
      destination: end,
      travelMode: window.google.maps.TravelMode.DRIVING,
    };

    directionsServiceRef.current.route(request, (result, status) => {
      if (status === window.google.maps.DirectionsStatus.OK) {
        directionsRendererRef.current.setDirections(result);
      } else {
        console.error("Directions request failed:", status);
        alert("Could not fetch directions. Please try again.");
      }
    });
  };

  const clearMarkers = () => {
    markersRef.current.forEach((marker) => marker.setMap(null));
    markersRef.current = [];
  };

  return (
    <div style={{ position: 'relative', width: '100%', height: '100vh' }}>
      <div 
        style={{
          position: 'absolute',
          top: '10px',
          left: '50%',
          transform: 'translateX(-50%)',
          zIndex: 5,
          background: 'white',
          padding: '10px',
          borderRadius: '8px',
          boxShadow: '0 2px 6px rgba(0, 0, 0, 0.3)'
        }}
      >
        <input 
          ref={searchInputRef}
          style={{
            width: '300px',
            padding: '8px',
            border: '1px solid #ccc',
            borderRadius: '4px'
          }}
          type="text" 
          placeholder="Enter your location (e.g., UCI)" 
        />
      </div>
      <div 
        ref={mapRef} 
        style={{ 
          height: '100%', 
          width: '100%' 
        }} 
      />
    </div>
  );
};

export default ShelterFinder;
