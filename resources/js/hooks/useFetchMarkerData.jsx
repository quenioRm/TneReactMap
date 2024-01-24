import { useState, useEffect, useRef } from "react";
import axios from "../Components/axiosInstance";

/**
 * Custom hook to fetch marker data from an API and retry on failure every 3 seconds.
 */
const useFetchMarkerData = () => {
    const [markerData, setMarkerData] = useState([]);
    const [latestCalledCoordinate, setLastestCalledCoordinate] = useState({});
    const [currentCalledLatLng, setCurrentCalledLatLng] = useState({});
    const [firstCalledLatLng, setFirstCalledLatLng] = useState({});
    const [latestCalledLatLng, setLastestCalledLatLng] = useState({});
    const [error, setError] = useState(null);
    const [mapConfig, setMapConfig] = useState({
        center: { lat: 0, lng: 0 },
        zoom: 15,
    });

    const retryTimeoutRef = useRef(null);

    const fetchAllMarkerData = async () => {
        try {
            if (retryTimeoutRef.current) {
                clearTimeout(retryTimeoutRef.current);
            }

            const response = await axios.get("/api/get-coordinates");
            const latestItem = response.data[response.data.length - 1];

            setLastestCalledCoordinate({
                x: parseFloat(latestItem.position.utmx),
                y: parseFloat(latestItem.position.utmy),
                zone: latestItem.position.zone,
            });

            setCurrentCalledLatLng({
                lat: response.data[0].position.lat,
                lng: response.data[0].position.lng,
            });

            setFirstCalledLatLng({
                lat: response.data[0].position.lat,
                lng: response.data[0].position.lng,
            });

            setLastestCalledLatLng({
                lat: latestItem.position.lat,
                lng: latestItem.position.lng,
            });

            setMapConfig({
                center: {
                    lat: response.data[0].position.lat,
                    lng: response.data[0].position.lng,
                },
                zoom: 15,
            });

            setMarkerData(response.data);
            clearTimeout(retryTimeoutRef.current);
        } catch (err) {
            setError(err);
            console.error("Error fetching marker data:", err);

            retryTimeoutRef.current = setTimeout(fetchAllMarkerData, 3000);
        }
    };

    useEffect(() => {
        fetchAllMarkerData();

        return () => {
            if (retryTimeoutRef.current) {
                clearTimeout(retryTimeoutRef.current);
            }
        };
    }, []);

    return {
        markerData,
        latestCalledCoordinate,
        currentCalledLatLng,
        firstCalledLatLng,
        latestCalledLatLng,
        mapConfig,
        error,
    };
};

export default useFetchMarkerData;
