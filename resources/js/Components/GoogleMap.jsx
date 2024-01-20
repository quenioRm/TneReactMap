import React, { useState, useEffect } from 'react';
import { useGoogleMap } from '../hooks/useGoogleMap';
import LoadingSpinner from '../Components/GoogleMapHelpers/LoadingSpinner';
import Tooltip from '../Components/GoogleMapHelpers/Tooltip';
import { createMarker, createPolyline  } from '../Components/GoogleMapHelpers/MarkerUtils';
import './css/GoogleMap.css'; // Import your custom CSS for styling
import FloatingButton from "./FloatingButton";

const GoogleMap = ({ markersData, latestCalledCoordinate, currentCalledLatLng, firstCalledLatLng, latestCalledLatLng, mapConfig, error }) => {
    const apiKey = 'AIzaSyC3to6HjzBwPXLDL7VyOD_uLj9_TQTyGAg';
    const { map, CustomOverlay } = useGoogleMap(mapConfig, apiKey);
    const [loading, setLoading] = useState(true);
    const [tooltip, setTooltip] = useState({ visible: false, content: '', position: { x: 0, y: 0 } });

    useEffect(() => {
        if (map && markersData && CustomOverlay) {
            markersData.forEach(markerInfo => {
                const marker = createMarker(map, markerInfo, CustomOverlay);

                // Example of adding an event listener to a marker
                marker.addListener('click', () => {
                    // Update tooltip state or perform other actions
                    setTooltip({
                        visible: true,
                        content: markerInfo.tooltipContent,
                        position: { x: markerInfo.position.lat, y: markerInfo.position.lng }
                    });
                });


            });

            createPolyline(markersData, map, CustomOverlay);

            setLoading(false);
        }
    }, [map, markersData]);

    return (
        <div className="google-map-container">
            {loading && <LoadingSpinner />}
            <div id="map" className="google-map"></div>
            {tooltip.visible &&
                <Tooltip position={tooltip.position} content={tooltip.content} />
            }
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
