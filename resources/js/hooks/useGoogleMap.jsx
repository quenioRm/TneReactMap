import { useState, useEffect } from 'react';

export const useGoogleMap = (mapConfig, apiKey) => {
    const [map, setMap] = useState(null);
    const [CustomOverlay, setCustomOverlay] = useState(null);

    // Function to load the Google Maps API
    const loadGoogleMapsAPI = () => {
        return new Promise((resolve, reject) => {
            if (window.google && window.google.maps) {
                resolve();
            } else {
                const script = document.createElement('script');
                script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}`;
                script.async = true;
                script.defer = true;
                document.head.appendChild(script);

                script.onload = () => resolve();
                script.onerror = () => reject(new Error('Google Maps API failed to load.'));
            }
        });
    };

    useEffect(() => {
        let isMounted = true;

        const initializeMap = async () => {
            try {
                await loadGoogleMapsAPI();
                if (isMounted) {
                    const newMap = new window.google.maps.Map(document.getElementById('map'), mapConfig);
                    setMap(newMap);
                }
            } catch (error) {
                console.error("Error loading Google Maps: ", error);
            }
        };

        if (isMounted && !CustomOverlay && window.google && window.google.maps) {
            // Define CustomOverlay here
            class CustomOverlayClass extends window.google.maps.OverlayView {
                constructor(marker, icons, map) {
                  super();
                  this.marker = marker;
                  this.icons = icons;
                  this.map = map;
                  this.div = null;
                  this.setMap(map);
                }

                onAdd() {
                  if (window.google) {
                    this.div = document.createElement("div");
                    this.div.style.position = "absolute";
                    this.div.style.display = "none";
                    this.div.innerHTML = this.icons;

                    const panes = this.getPanes();
                    panes.overlayMouseTarget.appendChild(this.div);
                  }
                }

                draw() {
                  if (window.google) {
                    const overlayProjection = this.getProjection();
                    const markerPosition = this.marker.getPosition();
                    const point = overlayProjection.fromLatLngToDivPixel(markerPosition);

                    this.div.style.left = point.x + "px";
                    this.div.style.top = point.y + 40 + "px"; // Adjust the value to position the overlay below the marker
                  }
                }

                onRemove() {
                  if (window.google && this.div) {
                    this.div.parentNode.removeChild(this.div);
                    this.div = null;
                  }
                }
            }

            setCustomOverlay(() => CustomOverlayClass);
        }

        initializeMap();

        return () => {
            isMounted = false;
        };
    }, [mapConfig, apiKey, CustomOverlay]);

    return { map, CustomOverlay };
};
