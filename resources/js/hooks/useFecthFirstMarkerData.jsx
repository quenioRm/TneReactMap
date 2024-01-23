import { useState, useEffect } from "react";
// import axios from 'axios';
import axios from "../Components/axiosInstance";

/**
 * Custom hook to fetch marker data from an API.
 */
const useFecthFirstMarkerData = () => {
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

    const mapType = localStorage.getItem("mapType")
        ? localStorage.getItem("mapType")
        : "hybrid";

    const fetchFirstMarkerData = async (
        coordinateX,
        coordinateY,
        radius,
        getAllPoints,
    ) => {

        const payload = {
            inputX: coordinateX,
            inputY: coordinateY,
            radius: radius,
            getAllPoints: getAllPoints,
        };

        await axios
            .post("/api/get-coordinatesbyrange", payload)
            .then((response) => {
                const latestItem = response.data[response.data.length - 1];

                setMapConfig({
                    center: {
                        lat: response.data[0].position.lat,
                        lng: response.data[0].position.lng,
                    },
                    zoom: 15,
                    gestureHandling: "greedy",
                    mapTypeId:
                        mapType === "hybrid"
                            ? google.maps.MapTypeId.SATELLITE
                            : google.maps.MapTypeId.ROADMAP,
                });

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

                setMarkerData(response.data);
            })
            .catch((error) => {
                console.error("Error fetching marker data:", error);
            });
    };

    useEffect(() => {
        fetchFirstMarkerData(0, 0, 10000, false);
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

export default useFecthFirstMarkerData;
