import React, { useEffect, useState, useRef } from "react";
import { GoogleMap, LoadScript, Autocomplete, HeatmapLayer, DirectionsRenderer } from '@react-google-maps/api';
import axios from 'axios';

const LIBRARIES = ['places', 'visualization', 'drawing'];

const Map = () => {
  const [map, setMap] = useState(null);
  const [heatmapData, setHeatmapData] = useState([]);
  const [error, setError] = useState(null);
  const [showHeatmap, setShowHeatmap] = useState(true);
  const [shelters, setShelters] = useState([]);
  const [directions, setDirections] = useState(null);
  const autocompleteRef = useRef(null);
  const heatmapLayerRef = useRef(null);
  const directionsRendererRef = useRef(null);
  const [alerts, setAlerts] = useState([]);
  const [showAlerts, setShowAlerts] = useState(true);
  const alertsRef = useRef([]);

  const GOOGLE_MAPS_API_KEY = "AIzaSyAYoQLuc9_1QK50-Mes1hEj_7eTPS32eM8";
  const BACKEND_URL = "http://127.0.0.1:5001/";

  useEffect(() => {
    if (map) {
      fetchWildfires(34.0522, -118.2437);  // Initial fetch at Los Angeles
      fetchShelters();
      fetchWeatherAlerts();
    }
  }, [map]);

  const fetchWildfires = async (lat, lon) => {
    setError(null);

    try {
      const response = await axios.get(`${BACKEND_URL}api/wildfires`, {
        params: { lat, lon, radius: 1000 }
      });
      const wildfires = response.data;

      if (wildfires.error) {
        setError(wildfires.error);
        return;
      }

      console.log("Fetched wildfires:", wildfires);

      const newHeatmapData = wildfires.map(fire => new window.google.maps.LatLng(fire.latitude, fire.longitude));
      setHeatmapData(newHeatmapData);

      // Create the heatmap layer
      const heatmap = new window.google.maps.visualization.HeatmapLayer({
        data: newHeatmapData,
        radius: 50,  // Increase radius of heatmap points
        opacity: 0.6  // Adjust opacity for better visibility
      });

      heatmapLayerRef.current = heatmap;
      heatmap.setMap(showHeatmap ? map : null);
    } catch (error) {
      console.error("Wildfire fetch error:", error);
      // setError("Unable to fetch wildfire data");
    }
  };

  const fetchShelters = async () => {
    try {
      const response = await axios.get(`${BACKEND_URL}api/shelters`);
      const sheltersData = response.data;
      setShelters(sheltersData);
    } catch (error) {
      console.error("Shelter fetch error:", error);
      // setError("Unable to fetch shelter data");
    }
  };

  const fetchWeatherAlerts = async () => {
    try {
      const response = await axios.get('https://api.weather.gov/alerts/active/area/CA');
      const filteredAlerts = response.data.features
        .filter(feature => feature.properties.severity !== 'Unknown')
        .map(feature => ({
          id: feature.id,
          event: feature.properties.event,
          headline: feature.properties.headline,
          description: feature.properties.description,
          severity: feature.properties.severity,
          urgency: feature.properties.urgency,
          areas: feature.properties.areaDesc.split(';').map(area => area.trim()),
          expires: new Date(feature.properties.expires),
          instruction: feature.properties.instruction,
          color: getSeverityColor(feature.properties.severity)
        }));

      console.log('Fetched weather alerts:', filteredAlerts);
      setAlerts(filteredAlerts);
    } catch (error) {
      console.error('Error fetching weather alerts:', error);
      setError('Failed to fetch weather alerts');
    }
  };

  const getSeverityColor = (severity) => {
    switch (severity.toLowerCase()) {
      case 'extreme':
        return '#FF0000';  // Red
      case 'severe':
        return '#FF4500';  // Orange Red
      case 'moderate':
        return '#FFA500';  // Orange
      case 'minor':
        return '#FFFF00';  // Yellow
      default:
        return '#00FF00';  // Green
    }
  };

  useEffect(() => {
    if (!map || !window.google || !alerts.length) return;

    console.log("Drawing alerts on map:", alerts.length);

    // Clear existing polygons
    alertsRef.current.forEach(poly => poly.setMap(null));
    alertsRef.current = [];

    alerts.forEach(alert => {
      if (alert.geometry && alert.geometry.coordinates) {
        console.log("Processing alert geometry:", alert.geometry);
        const coords = alert.geometry.coordinates[0].map(([lng, lat]) => ({
          lat, lng
        }));

        console.log("Processed coordinates:", coords);

        const polygon = new window.google.maps.Polygon({
          paths: coords,
          strokeColor: alert.color,
          strokeOpacity: 0.8,
          strokeWeight: 2,
          fillColor: alert.color,
          fillOpacity: 0.35,
          map: showAlerts ? map : null
        });

        const infoWindow = new window.google.maps.InfoWindow({
          content: `<div>
            <h3>${alert.headline || 'Weather Alert'}</h3>
            <p>${alert.description || ''}</p>
          </div>`
        });

        polygon.addListener('click', e => {
          infoWindow.setPosition(e.latLng);
          infoWindow.open(map);
        });

        alertsRef.current.push(polygon);
      }
    });
  }, [map, alerts, showAlerts]);

  const onMapLoad = (mapInstance) => {
    setMap(mapInstance);
  };

  const onAutocompleteLoad = (autocomplete) => {
    autocompleteRef.current = autocomplete;
  };

  const onPlaceChanged = () => {
    const place = autocompleteRef.current.getPlace();
    if (!place.geometry) return;

    const lat = place.geometry.location.lat();
    const lng = place.geometry.location.lng();

    map.setCenter(place.geometry.location);
    map.setZoom(10);
    fetchWildfires(lat, lng);
    findNearestShelter(lat, lng);
  };

  const toggleHeatmap = () => {
    setShowHeatmap(!showHeatmap);
    if (heatmapLayerRef.current) {
      heatmapLayerRef.current.setMap(showHeatmap ? map : null);
    }
  };

  const findNearestShelter = (lat, lng) => {
    let nearestShelter = null;
    let minDistance = Infinity;

    shelters.forEach(shelter => {
      const shelterLat = shelter.latitude;
      const shelterLng = shelter.longitude;
      const distance = Math.sqrt(Math.pow(shelterLat - lat, 2) + Math.pow(shelterLng - lng, 2));
      if (distance < minDistance) {
        minDistance = distance;
        nearestShelter = shelter;
      }
    });

    if (nearestShelter) {
      fetchRoute(lat, lng, nearestShelter.latitude, nearestShelter.longitude);
    }
  };

  const fetchRoute = async (originLat, originLng, destLat, destLng) => {
    try {
      const response = await axios.post(`${BACKEND_URL}api/route`, {
        origin: `${originLat},${originLng}`,
        destination: `${destLat},${destLng}`
      });
      const routeData = response.data;
      setDirections(routeData);

      if (directionsRendererRef.current) {
        directionsRendererRef.current.setDirections(routeData);
      }
    } catch (error) {
      console.error("Route fetch error:", error);
      setError("Unable to fetch route data");
    }
  };

  return (
    <LoadScript
      googleMapsApiKey={GOOGLE_MAPS_API_KEY}
      libraries={LIBRARIES}
    >
      <div className="map-container">
        <GoogleMap
          mapContainerStyle={{ height: "100vh", width: "100%" }}
          center={{ lat: 34.0522, lng: -118.2437 }}  // Center on Los Angeles
          zoom={6}
          onLoad={onMapLoad}
        >
          <Autocomplete onLoad={onAutocompleteLoad} onPlaceChanged={onPlaceChanged}>
            <input
              type="text"
              placeholder="Search for a location"
              style={{
                boxSizing: `border-box`,
                border: `1px solid transparent`,
                width: `240px`,
                height: `32px`,
                padding: `0 12px`,
                borderRadius: `3px`,
                boxShadow: `0 2px 6px rgba(0, 0, 0, 0.3)`,
                fontSize: `14px`,
                outline: `none`,
                textOverflow: `ellipsis`,
                position: 'absolute',
                left: '50%',
                marginLeft: '-120px',
                marginTop: '10px',
                zIndex: 10,
              }}
            />
          </Autocomplete>
          {showHeatmap && <HeatmapLayer data={heatmapData} />}
          <button
            onClick={toggleHeatmap}
            style={{
              position: 'absolute',
              top: '10px',
              right: '10px',
              background: showHeatmap ? 'green' : 'red',
              color: 'white',
              padding: '10px',
              borderRadius: '5px',
              border: 'none',
              cursor: 'pointer',
              zIndex: 10,
            }}
          >
            {showHeatmap ? 'Hide Heatmap' : 'Show Heatmap'}
          </button>
          {directions && (
            <DirectionsRenderer
              ref={directionsRendererRef}
              directions={directions}
              options={{
                polylineOptions: {
                  strokeColor: 'blue',
                  strokeWeight: 5,
                },
              }}
            />
          )}
          {showAlerts && alerts.map(alert => (
            <div
              key={alert.id}
              style={{
                position: 'absolute',
                bottom: '20px',
                left: '20px',
                backgroundColor: 'white',
                padding: '10px',
                borderRadius: '4px',
                boxShadow: '0 2px 6px rgba(0,0,0,0.3)',
                maxWidth: '300px',
                zIndex: 1000
              }}
            >
              <h3 style={{ color: alert.color }}>{alert.event}</h3>
              <p><strong>Severity:</strong> {alert.severity}</p>
              <p><strong>Areas:</strong> {alert.areas.join(', ')}</p>
              <p>{alert.description}</p>
              {alert.instruction && (
                <p><strong>Instructions:</strong> {alert.instruction}</p>
              )}
            </div>
          ))}
        </GoogleMap>
        <button
          onClick={() => setShowAlerts(!showAlerts)}
          style={{
            background: showAlerts ? '#4CAF50' : '#f44336',
            color: 'white',
            padding: '10px',
            margin: '5px',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer'
          }}
        >
          {showAlerts ? 'Hide Alerts' : 'Show Alerts'}
        </button>
      </div>
      {error && (
        <div style={{ position: 'absolute', top: '10px', left: '10px', background: 'red', color: 'white', padding: '10px', borderRadius: '5px' }}>
          {error}
        </div>
      )}
    </LoadScript>
  );
};

export default Map;