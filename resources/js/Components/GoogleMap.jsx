// resources/js/components/GoogleMap.js
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import MarkerModal from '../Components/GoogleMapMarkerModal';

const GoogleMap = () => {
  const [markerData, setMarkerData] = useState(null);
  const [selectedMarker, setSelectedMarker] = useState(null);

  useEffect(() => {
    loadGoogleMapScript();
    fetchMarkerData();
  }, []);

  useEffect(() => {
    if (markerData) {
      initMap(); // Call initMap after fetchMarkerData is completed
    }
  }, [markerData]);

  const initMap = () => {
    if (!markerData || !Array.isArray(markerData)) {
      // Marker data not available or not in the expected format
      return;
    }

    // Map initialization logic
    const map = new window.google.maps.Map(document.getElementById('map'), {
      center: { lat: markerData[0].position.lat, lng: markerData[0].position.lng },
      zoom: 15,
      gestureHandling: 'greedy'
    });

    // Add markers based on fetched data
    markerData.forEach((markerInfo, index) => {
      const marker = new window.google.maps.Marker({
        position: markerInfo.position,
        label: markerInfo.label,
        draggable: markerInfo.draggable,
        map: map,
        title: markerInfo.label.text,
        icon:''
      });

      // Add a listener for dragend event
      marker.addListener('dragend', () => {
        onMarkerDragEnd(marker, index);
      });

      // Add a listener for click event
      marker.addListener('click', () => {
        onMarkerClick(markerInfo);
      });
    });

    // Create a polyline based on marker positions
    const polylinePath = markerData.map((markerInfo) => markerInfo.position);
    const polyline = new window.google.maps.Polyline({
      path: polylinePath,
      geodesic: true,
      strokeColor: '#FF0000',
      strokeOpacity: 1.0,
      strokeWeight: 2,
    });

    // Set the polyline on the map
    polyline.setMap(map);
  };

  const onMarkerClick = (markerInfo) => {
    setSelectedMarker(markerInfo);
  };

  const onMarkerDragEnd = (marker, index) => {
    console.log('Marker dragged:', marker.getPosition().lat(), marker.getPosition().lng());
  };

  const handleCloseModal = () => {
    setSelectedMarker(null);
  };

  const fetchMarkerData = async () => {
    try {
      const response = await axios.get('/api/get-coordinates'); // Replace with your Laravel API endpoint
      setMarkerData(response.data);
    } catch (error) {
      console.error('Error fetching marker data:', error);
    }
  };

  const loadGoogleMapScript = async () => {
    if (window.google && window.google.maps) {
      // Google Maps API is already available, call initMap directly
      initMap();
      return;
    }

    const apiKey = 'AIzaSyC3to6HjzBwPXLDL7VyOD_uLj9_TQTyGAg';
    const script = document.createElement('script');
    script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&callback=initMap`;
    script.async = true;
    script.defer = true;

    // Define initMap in the global scope after the script is loaded
    window.initMap = initMap;

    document.head.appendChild(script);

    // Cleanup script tag on component unmount
    return () => {
      document.head.removeChild(script);
    };
  };

  return (
    <div>
      {/* Map container */}
      <div id="map" style={{ height: '100vh', width: '100%' }} />

      {/* Use MarkerModal component */}
      <MarkerModal markerInfo={selectedMarker} onClose={handleCloseModal} />
    </div>
  );
};

export default GoogleMap;
