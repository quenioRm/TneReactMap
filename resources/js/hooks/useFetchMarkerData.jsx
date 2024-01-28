import { useState, useEffect, useRef } from "react";
import axios from "../Components/axiosInstance";

const useFetchMarkerData = () => {
    const [markerData, setMarkerData] = useState([]);
    const [isDataFetchedSuccessfully, setIsDataFetchedSuccessfully] =
        useState(false);
    const [error, setError] = useState(null);
    const [latestCalledCoordinate, setLastestCalledCoordinate] = useState({});
    const [currentCalledLatLng, setCurrentCalledLatLng] = useState({});
    const [firstCalledLatLng, setFirstCalledLatLng] = useState({});
    const [latestCalledLatLng, setLastestCalledLatLng] = useState({});
    const [mapConfig, setMapConfig] = useState({
        center: { lat: 0, lng: 0 },
        zoom: 15,
    });

    const retryTimeoutRef = useRef(null);

    const mapType = localStorage.getItem("mapType") || "hybrid";

    const fetchAllMarkerData = async () => {
        if (isDataFetchedSuccessfully) {
            // Se os dados já foram buscados com sucesso, não faça nada.
            return;
        }

        try {
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
                gestureHandling: "greedy",
                mapTypeId:
                    mapType === "hybrid"
                        ? google.maps.MapTypeId.SATELLITE
                        : google.maps.MapTypeId.ROADMAP,
            });

            setMarkerData(response.data);
            setIsDataFetchedSuccessfully(true); // Indica sucesso na requisição
            setError(null); // Limpa qualquer erro anterior
        } catch (err) {
            setError(err);
            console.error("Error fetching marker data:", err);
            // Tenta novamente após 3 segundos se a requisição anterior falhou
            retryTimeoutRef.current = setTimeout(fetchAllMarkerData, 3000);
        }
    };

    useEffect(() => {
        fetchAllMarkerData();
        // Função de limpeza para cancelar a re-tentativa se o componente for desmontado
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
