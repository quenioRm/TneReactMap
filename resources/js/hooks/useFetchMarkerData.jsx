import { useState, useEffect } from "react";
// import axios from 'axios';
import axios from "../Components/axiosInstance";

/**
 * Custom hook to fetch marker data from an API.
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

    const mapType = localStorage.getItem("mapType")
        ? localStorage.getItem("mapType")
        : "hybrid";

    // useEffect(() => {
    //     if (navigator.geolocation && markerData.length === 0) {
    //         navigator.geolocation.getCurrentPosition(
    //             (position) => {
    //                 setMapConfig({
    //                     ...mapConfig,
    //                     center: {
    //                         lat: position.coords.latitude,
    //                         lng: position.coords.longitude,
    //                     },
    //                 });
    //             },
    //             (error) => {
    //                 console.error("Error getting location: ", error);
    //             }
    //         );
    //     } else {
    //         console.log("Geolocation is not supported by this browser.");
    //     }
    // }, [markerData]);

    const fetchAllMarkerData = async () => {
        try {
            const response = await axios.get("/api/get-coordinates");
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
        } catch (err) {
            setError(err);
            console.error("Error fetching marker data:", err);
        }
    };

    useEffect(() => {
        fetchAllMarkerData();
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
