import React, { useState, useEffect } from 'react';
import { useGoogleMap } from '../hooks/useGoogleMap';
import LoadingSpinner from '../Components/GoogleMapHelpers/LoadingSpinner';
import Tooltip from '../Components/GoogleMapHelpers/Tooltip';
import { createMarker, createPolyline, createMapChange, createMouseMoveEvent  } from '../Components/GoogleMapHelpers/MarkerUtils';
import './css/GoogleMap.css'; // Import your custom CSS for styling
import FloatingButton from "./FloatingButton";
import MarkerModal from "../Components/GoogleMapMarkerModal";
import GoogleMapMarkerAnotherModal from "../Components/GoogleMapMarkerAnotherModal";

const GoogleMap = ({ markersData, latestCalledCoordinate, currentCalledLatLng, firstCalledLatLng, latestCalledLatLng, mapConfig, error }) => {
    const apiKey = 'AIzaSyC3to6HjzBwPXLDL7VyOD_uLj9_TQTyGAg';
    const { map, CustomOverlay } = useGoogleMap(mapConfig, apiKey);
    const [loading, setLoading] = useState(true);
    const [tooltip, setTooltip] = useState(true);
    const [loadingMarkers, setLoadingMarkers] = useState(true); // Loading state for markers
    const [loadingMap, setLoadingMap] = useState(true); // Loading state for the map
    const [selectedMarker, setSelectedMarker] = useState(null);
    const [mouseEventData, setMouseEventData] = useState(null);


    const handleCloseModal = () => {
        setSelectedMarker(null);
    };

    useEffect(() => {
        if (map && markersData && CustomOverlay) {
            markersData.forEach(markerInfo => {
                const marker = createMarker(map, markerInfo, CustomOverlay);
                const tooltip = new window.google.maps.InfoWindow();

                // Example of adding an event listener to a marker
                marker.addListener('click', () => {
                    // Update tooltip state or perform other actions
                    setTooltip({
                        visible: true,
                        content: markerInfo.tooltipContent,
                        position: { x: markerInfo.position.lat, y: markerInfo.position.lng }
                    });

                    setSelectedMarker(markerInfo);
                });
            });

            createPolyline(markersData, map, CustomOverlay);

            createMouseMoveEvent(map, (eventData) => {
                setMouseEventData(eventData); // Update the state with the data
            });

            createMapChange(map);

            setLoadingMarkers(false);
        }
    }, [map, markersData, loadingMarkers]);

    useEffect(() => {
        if(mapConfig.center.lat != 0 && mapConfig.center.lng != 0){
            setLoadingMap(false)
        }
    },[mapConfig])

    useEffect(() => {
        if(mouseEventData){
            setTooltip(true)

            // // Clear previous timer
            // clearTimeout(map.tooltipTimer);

            // // Set timer to hide tooltip after 5 seconds
            // map.tooltipTimer = setTimeout(() => {
            //     setTooltip(false);
            // }, 5000);
        }
    },[mouseEventData])

    return (
        <div className="google-map-container">
            {(loadingMarkers || loadingMap) && <LoadingSpinner />}
            <div id="map" className="google-map"></div>
            {tooltip && mouseEventData &&
                <Tooltip mouseEventData={mouseEventData} />
            }
            {selectedMarker && selectedMarker.type === 0 && map ? (
                <MarkerModal
                    markerInfo={selectedMarker}
                    onClose={handleCloseModal}
                />
            ) : (
                <GoogleMapMarkerAnotherModal
                    markerInfo={selectedMarker}
                    onClose={handleCloseModal}
                />
            )}
            {/* <FloatingButton
                map={map}
                setMarkerData={markersData}
                currentCalledLatLng={
                    currentCalledLatLng ? currentCalledLatLng : firstCalledLatLng
                }
                fetchNewMarkerData={fetchNewMarkerData}
                allPointsLoaded={allPointsLoaded}
                setActualCoordinate={setActualCoordinate}
            /> */}
        </div>
    );
};

export default GoogleMap;
