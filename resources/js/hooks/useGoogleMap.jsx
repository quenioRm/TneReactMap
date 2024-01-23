import { useState, useEffect } from "react";

export const useGoogleMap = (mapConfig, apiKey) => {
    const [map, setMap] = useState(null);
    const [CustomOverlay, setCustomOverlay] = useState(null);
    const [isApiLoaded, setIsApiLoaded] = useState(false);

    // Callback function for API loading
    window.initMap = () => {
        setIsApiLoaded(true);
    };

    useEffect(() => {
        const loadGoogleMapsAPI = () => {
            if (window.google && window.google.maps) {
                setIsApiLoaded(true);
            } else {
                const script = document.createElement("script");
                script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&callback=initMap`;
                script.async = true;
                document.head.appendChild(script);

                script.onerror = () =>
                    console.error("Google Maps API failed to load.");
            }
        };

        loadGoogleMapsAPI();
    }, [apiKey]);

    useEffect(() => {
        let isMounted = true;

        if (isMounted && isApiLoaded && !CustomOverlay) {
            // Define CustomOverlay class here
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
                        const point =
                            overlayProjection.fromLatLngToDivPixel(
                                markerPosition,
                            );

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

        if (isMounted && isApiLoaded) {
            const newMap = new window.google.maps.Map(
                document.getElementById("map"),
                mapConfig,
            );
            setMap(newMap);
        }

        return () => {
            isMounted = false;
        };
    }, [isApiLoaded, mapConfig]);

    return { map, CustomOverlay };
};
