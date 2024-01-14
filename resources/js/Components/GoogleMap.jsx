import { useEffect, useState } from "react";
// import axios from "axios";
import MarkerModal from "../Components/GoogleMapMarkerModal";
import GoogleMapMarkerAnotherModal from "../Components/GoogleMapMarkerAnotherModal";
import FloatingButton from "./FloatingButton";
import { ProgressBar, Spinner } from "react-bootstrap"; // Import ProgressBar from react-bootstrap
import "bootstrap/dist/css/bootstrap.min.css";
import UtmConverter from "./Converters/UtmConverter";
import "./css/Spinner.css";
import "../Components/css/GoogleMaps.css";
import axios from '../Components/axiosInstance';

const GoogleMap = () => {
    const [markerData, setMarkerData] = useState(null);
    const [selectedMarker, setSelectedMarker] = useState(null);
    const [map, setMap] = useState(null);
    const [loading, setLoading] = useState(true); // Set initial loading state to true
    const [tooltipVisible, setTooltipVisible] = useState(false);
    const [tooltipPosition, setTooltipPosition] = useState({ x: 0, y: 0 });
    const [actualCoordinate, setActualCoordinate] = useState({
        x: 0,
        y: 0,
        zone: 0,
    });

    const [lastestCalledCoordinate, setLastestCalledCoordinate] = useState({
        x: 0,
        y: 0,
        zone: 0,
    });

    const [currentCalledLatLng, setCurrentCalledLatLng] = useState({
        lat: 0,
        lng: 0,
    });
    const [firstCalledLatLng, setFirstCalledLatLng] = useState({
        lat: 0,
        lng: 0,
    });
    const [lastestCalledLatLng, setLastestCalledLatLng] = useState({
        lat: 0,
        lng: 0,
    });

    const [isFetchingData, setIsFetchingData] = useState(false);

    const [updDistance, setUpdDistance] = useState(0);

    const [isDebugMode, setIsDebugMode] = useState(false);

    const mapType = localStorage.getItem("mapType")
        ? localStorage.getItem("mapType")
        : "hybrid";
    const labelColor = localStorage.getItem("currentLabelMapColor")
        ? localStorage.getItem("currentLabelMapColor")
        : "white";

    const [currentZoom, setCurrentZoom] = useState(15); // Define o nível de zoom inicial

    const [allPointsLoaded, setAllPointsLoaded] = useState(true);

    let mouseLatLng = null;
    const radius = 30000;

    useEffect(() => {
        loadGoogleMapScript();

        setIsFetchingData(true);

        fetchMarkerData(0, 0, radius, false).then(() => {
                    setIsFetchingData(false);
                });
    }, []);

    // useEffect(() => {
    //     if(allPointsLoaded === true){
    //         if(!isFetchingData){
    //             setIsFetchingData(true);
    //             console.log(isFetchingData)

    //             fetchMarkerData(0, 0, radius, allPointsLoaded)
    //             .then(() => {
    //                 setIsFetchingData(false);
    //             });
    //         }
    //     }
    // }, [allPointsLoaded]);


    useEffect(() => {
        if (markerData) {
            initMap();
        }
    }, [markerData]);

    useEffect(() => {
        setTimeout(() => {
            setLoading(false);
        }, 5000);
    }, [map, markerData]);

    // update Map Coordinates

    useEffect(() => {

        if (radius - updDistance >= 25000 && updDistance > 0 && allPointsLoaded === false) {
            if (!isFetchingData) {
                // Defina isFetchingData como true para indicar que a solicitação está em andamento
                setIsFetchingData(true);

                // Execute a solicitação e, em seguida, defina isFetchingData como false quando estiver concluída
                fetchNewMarkerData(
                    actualCoordinate.x,
                    actualCoordinate.y,
                    radius,
                    false,
                ).then(() => {
                    setUpdDistance(0);
                    setIsFetchingData(false);
                });
            }
        }

        if (updDistance > radius + 10000) {
            if (!isFetchingData) {
                // Defina isFetchingData como true para indicar que a solicitação está em andamento
                setIsFetchingData(true);

                // Execute a solicitação e, em seguida, defina isFetchingData como false quando estiver concluída
                fetchNewMarkerData(
                    actualCoordinate.x,
                    actualCoordinate.y,
                    radius,
                    false,
                ).then(() => {
                    setUpdDistance(0);
                    setIsFetchingData(false);
                });
            }
        }
    }, [
        updDistance,
        actualCoordinate,
        lastestCalledCoordinate,
        isFetchingData,
        firstCalledLatLng,
        lastestCalledLatLng,
    ]);
    //////////////////////////////////////

    const initMap = () => {
        if (
            !markerData ||
            !Array.isArray(markerData) ||
            markerData.length === 0
        ) {
            // Marker data not available or not in the expected format
            return;
        }

        class CustomOverlay extends google.maps.OverlayView {
            constructor(marker, icons, map) {
                super();
                this.marker = marker;
                this.icons = icons;
                this.map = map;
                this.div = null;
                this.setMap(map);
            }

            onAdd() {
                this.div = document.createElement("div");
                this.div.style.position = "absolute";
                this.div.style.display = "none";
                this.div.innerHTML = this.icons;

                const panes = this.getPanes();
                panes.overlayMouseTarget.appendChild(this.div);
            }

            draw() {
                const overlayProjection = this.getProjection();
                const markerPosition = this.marker.getPosition();
                const point =
                    overlayProjection.fromLatLngToDivPixel(markerPosition);

                this.div.style.left = point.x + "px";
                this.div.style.top = point.y + 40 + "px"; // Adjust the value to position the overlay below the marker
            }

            onRemove() {
                if (this.div) {
                    this.div.parentNode.removeChild(this.div);
                    this.div = null;
                }
            }
        }

        // Map initialization logic
        const map = new window.google.maps.Map(document.getElementById("map"), {
            center: {
                lat: currentCalledLatLng.lat,
                lng: currentCalledLatLng.lng,
            },
            zoom: currentZoom,
            gestureHandling: "greedy",
            mapTypeId:
                mapType === "hybrid"
                    ? google.maps.MapTypeId.SATELLITE
                    : google.maps.MapTypeId.ROADMAP,
        });

        setMap(map);

        // Create a polyline based on marker positions
        const polylinePath = markerData.map(
            (markerInfo) => markerInfo.position,
        );

        const polyline = new window.google.maps.Polyline({
            path: polylinePath,
            geodesic: true,
            strokeColor: "#FF0000",
            strokeOpacity: 1.0,
            strokeWeight: 2,
        });

        // Set the polyline on the map
        polyline.setMap(map);

        // Add markers based on fetched data
        markerData.forEach((markerInfo, index) => {
            const defaultIcon = "";

            const impedimentIcon = {
                url:
                    markerInfo.impediment_icon &&
                    markerInfo.impediment_icon.icon
                        ? markerInfo.impediment_icon.icon
                        : defaultIcon,
                scaledSize: new google.maps.Size(40, 40),
                labelOrigin: new google.maps.Point(100, 20),
                labelAnchor: new google.maps.Point(100, 20),
            };

            const icon = {
                url:
                    markerInfo.config_icon && markerInfo.config_icon.icon
                        ? markerInfo.config_icon.icon
                        : defaultIcon,
                scaledSize: (markerInfo.type === 0) ? new google.maps.Size(40, 40) : new google.maps.Size(80, 80),
                labelOrigin: new google.maps.Point(100, 20),
                labelAnchor: new google.maps.Point(100, 20),
            };

            const formattedPercentage = markerInfo.avc.toLocaleString(
                undefined,
                {
                    style: "percent",
                    minimumFractionDigits: 2,
                },
            );

            const label = {
                text: markerInfo.label.text + " - " + formattedPercentage,
                color: labelColor,
                fontSize: "12px",
                fontWeight: "bold",
                labelOrigin: new google.maps.Point(100, 20),
                labelAnchor: new google.maps.Point(100, 20),
            };

            const marker = new window.google.maps.Marker({
                position: markerInfo.position,
                label: label,
                draggable: markerInfo.draggable,
                map: map,
                title: markerInfo.label.text,
                icon:
                    impedimentIcon.url !== ""
                        ? impedimentIcon
                        : icon.url == ""
                          ? ""
                          : icon,
            });

            let iconsHTML = null;

            if (markerInfo.iconsbarImpediment) {
                if (markerInfo.iconsbarImpediment) {
                    iconsHTML = '<div class="icons-bar">';

                    markerInfo.iconsbarImpediment.forEach((impediment) => {
                        iconsHTML += `<div class="icon-box">
                                <img src="${impediment.icon}" />
                                <div class="icon-date">${impediment.impedimentType}</div>
                            </div>`;
                    });

                    iconsHTML += "</div>";
                }
            } else {
                if (markerInfo.iconsbarActivity) {
                    iconsHTML = '<div class="icons-bar">';

                    markerInfo.iconsbarActivity.forEach((activity) => {
                        iconsHTML += `<div class="icon-box">
                                <img src="${activity.icon}" />
                                <div class="icon-date">${activity.date}</div>
                            </div>`;
                    });

                    iconsHTML += "</div>";
                }
            }

            // Create the custom overlay
            const customOverlay = new CustomOverlay(marker, iconsHTML, map);

            // Adiciona um InfoWindow vazio ao marcador
            const infowindow = new google.maps.InfoWindow();
            infowindow.setOptions({ disableAutoPan: true });

            // Adiciona ouvinte de evento para exibir o InfoWindow no mouseover
            marker.addListener("mouseover", function () {
                // Define HTML content for the custom overlay
                customOverlay.div.style.display = "block";

                // Obtém a última atividade realizada
                const lastActivity = markerInfo.config_icon.activitie
                    ? `<br><b>Última Atividade:</b> ${markerInfo.config_icon.activitie}`
                    : "";

                // Verifica se há impedimentos e constrói o conteúdo
                let impedimentosInfo = "";
                if (
                    markerInfo.Impediments &&
                    markerInfo.Impediments.length > 0
                ) {
                    impedimentosInfo = "<br><b>Impedimentos:</b>";
                    markerInfo.Impediments.forEach((impedimento) => {
                        impedimentosInfo += `<br>- ${
                            impedimento.ImpedimentType +
                            ": " +
                            impedimento.Status
                        }`; // Altere para o campo correto do seu objeto impedimento
                    });
                }

                let receiveStatusInfo = "";
                receiveStatusInfo =
                    "<br><b>Solicitação de Compra Estrutura:</b>";

                if (markerInfo.SolicitationDate !== "")
                    receiveStatusInfo += `<br>- Solicitado em: ${markerInfo.SolicitationDate}`;

                if (markerInfo.ReceiveDate !== "")
                    receiveStatusInfo += `<br>- Recebida em: ${markerInfo.ReceiveDate}`;

                if (markerInfo.PreviousReceiveDate !== "")
                    receiveStatusInfo += `<br>- Previsão de entrega: ${markerInfo.PreviousReceiveDate}`;

                receiveStatusInfo += `<br>- Status: ${markerInfo.ReceiveStatus}`;

                // Atualiza o conteúdo do InfoWindow com as informações formatadas
                if(markerInfo.type === 0){
                    infowindow.setContent(
                        `<b>Torre:</b> ${markerInfo.label.text}${lastActivity}${impedimentosInfo}${receiveStatusInfo}`,
                    );
                }

                if(markerInfo.type === 1){
                    infowindow.setContent(
                        `<b>${markerInfo.name}</b>`,
                    );
                }


                // Abre o InfoWindow
                infowindow.open(map, marker);
            });

            // Adiciona ouvinte de evento para fechar o InfoWindow no mouseout
            marker.addListener("mouseout", function () {
                infowindow.close();

                customOverlay.div.style.display = "none";
            });

            // Add a listener for dragend event
            marker.addListener("dragend", () => {
                onMarkerDragEnd(marker, index);
            });

            // Add a listener for click event
            marker.addListener("click", () => {
                onMarkerClick(markerInfo);
            });

            map.addListener("mousemove", (event) => {
                const mouseX = event.pixel.x;
                const mouseY = event.pixel.y;

                mouseLatLng = event.latLng;

                const result = UtmConverter.convertLatLngToUtm(
                    parseFloat(event.latLng.lat()),
                    parseFloat(event.latLng.lng()),
                );

                setCurrentCalledLatLng({
                    lat: parseFloat(event.latLng.lat()),
                    lng: parseFloat(event.latLng.lng()),
                });

                // console.log(currentCalledLatLng)

                // console.log(result)
                setActualCoordinate({
                    x: parseFloat(result.easting.toFixed(2)),
                    y: parseFloat(result.northing.toFixed(2)),
                    zone: getUtmZone(
                        parseFloat(event.latLng.lat()),
                        parseFloat(event.latLng.lng()),
                    ),
                });

                // Update tooltip position
                setTooltipPosition({ x: mouseX + 180, y: mouseY - 30 });

                // Show tooltip
                setTooltipVisible(true);

                // Clear previous timer
                clearTimeout(map.tooltipTimer);

                // Set timer to hide tooltip after 5 seconds
                map.tooltipTimer = setTimeout(() => {
                    setTooltipVisible(false);
                }, 5000);

                let latestCoordinateSaved = {
                    easting: lastestCalledCoordinate.x,
                    northing: lastestCalledCoordinate.y,
                    zone: lastestCalledCoordinate.zone,
                };

                let currentCoordinateSaved = {
                    easting: parseFloat(result.easting),
                    northing: parseFloat(result.northing),
                    zone: getUtmZone(
                        parseFloat(event.latLng.lat()),
                        parseFloat(event.latLng.lng()),
                    ),
                };

                const distance = calculateUtmDistance(
                    latestCoordinateSaved,
                    currentCoordinateSaved,
                );

                setUpdDistance(distance);

                if (isDebugMode) console.log(distance, updDistance);
            });

            google.maps.event.addListener(
                map,
                "maptypeid_changed",
                function () {
                    var currentMapType = map.getMapTypeId();

                    if (currentMapType === "hybrid") {
                        localStorage.setItem("currentLabelMapColor", "white");
                        localStorage.setItem("mapType", currentMapType);
                    } else if (currentMapType === "sattelite") {
                        localStorage.setItem("currentLabelMapColor", "white");
                        localStorage.setItem("mapType", currentMapType);
                    } else {
                        localStorage.setItem("currentLabelMapColor", "black");
                        localStorage.setItem("mapType", currentMapType);
                    }
                    window.location.reload();
                },
            );

            map.addListener('zoom_changed', () => {
                setCurrentZoom(map.getZoom());
                if(map.getZoom() <= 11){
                    setAllPointsLoaded(true);
                }else{
                    // setAllPointsLoaded(false);
                }
            });

        });
    };

    const onMarkerClick = (markerInfo) => {
        setSelectedMarker(markerInfo);
    };

    const onMarkerDragEnd = (marker, index) => {
        console.log(
            "Marker dragged:",
            marker.getPosition().lat(),
            marker.getPosition().lng(),
        );
    };

    const handleCloseModal = () => {
        setSelectedMarker(null);
    };

    const fetchMarkerData = async (coordinateX, coordinateY, radius, getAllPoints) => {
        await axios
            .get("/api/get-coordinates")
            .then((response) => {
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

                setMarkerData(response.data);
            })
            .catch((error) => {
                console.error("Error fetching marker data:", error);
        });
    };

    // const fetchMarkerData = async (coordinateX, coordinateY, radius, getAllPoints) => {
    //     const payload = {
    //         inputX: coordinateX,
    //         inputY: coordinateY,
    //         radius: radius,
    //         getAllPoints: getAllPoints,
    //     };

    //     if(getAllPoints === false){
    //         await axios
    //         .post("/api/get-coordinatesbyrange", payload)
    //         .then((response) => {
    //             const latestItem = response.data[response.data.length - 1];

    //             setLastestCalledCoordinate({
    //                 x: parseFloat(latestItem.position.utmx),
    //                 y: parseFloat(latestItem.position.utmy),
    //                 zone: latestItem.position.zone,
    //             });

    //             setCurrentCalledLatLng({
    //                 lat: response.data[0].position.lat,
    //                 lng: response.data[0].position.lng,
    //             });

    //             setFirstCalledLatLng({
    //                 lat: response.data[0].position.lat,
    //                 lng: response.data[0].position.lng,
    //             });

    //             setLastestCalledLatLng({
    //                 lat: latestItem.position.lat,
    //                 lng: latestItem.position.lng,
    //             });

    //             setMarkerData(response.data);
    //         })
    //         .catch((error) => {
    //             console.error("Error fetching marker data:", error);
    //         });

    //     }else{

    //         await axios
    //         .get("/api/get-coordinates")
    //         .then((response) => {
    //             const latestItem = response.data[response.data.length - 1];

    //             setLastestCalledCoordinate({
    //                 x: parseFloat(latestItem.position.utmx),
    //                 y: parseFloat(latestItem.position.utmy),
    //                 zone: latestItem.position.zone,
    //             });

    //             setCurrentCalledLatLng({
    //                 lat: response.data[0].position.lat,
    //                 lng: response.data[0].position.lng,
    //             });

    //             setFirstCalledLatLng({
    //                 lat: response.data[0].position.lat,
    //                 lng: response.data[0].position.lng,
    //             });

    //             setLastestCalledLatLng({
    //                 lat: latestItem.position.lat,
    //                 lng: latestItem.position.lng,
    //             });

    //             setMarkerData(response.data);
    //         })
    //         .catch((error) => {
    //             console.error("Error fetching marker data:", error);
    //         });
    //     }
    // };

    const fetchNewMarkerData = async (
        coordinateX,
        coordinateY,
        radius,
        getAllPoints,
    ) => {

        const adjustedRadius = radius * Math.pow(2, 15 - currentZoom);

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

                setLastestCalledCoordinate({
                    x: parseFloat(latestItem.position.utmx),
                    y: parseFloat(latestItem.position.utmy),
                    zone: latestItem.position.zone,
                });

                setFirstCalledLatLng({
                    lat: lastestCalledLatLng.lat,
                    lng: lastestCalledLatLng.lng,
                });

                setLastestCalledLatLng({
                    lat: latestItem.position.lat,
                    lng: latestItem.position.lng,
                });

                const newData = response.data;

                setMarkerData(newData);

                let lat = lastestCalledLatLng.lat;
                let lng = lastestCalledLatLng.lng;
                map.panTo({ lat, lng });
                map.setZoom(10);
            })
            .catch((error) => {
                // Handle any errors here
                console.error("Error fetching marker data:", error);
            });
    };


    function getUtmZone(latitude, longitude) {
        // Calculate the standard UTM zone
        let zone = Math.floor((longitude + 180) / 6) + 1;

        // Special zones for Svalbard and Norway
        if (
            latitude >= 56 &&
            latitude < 64 &&
            longitude >= 3 &&
            longitude < 12
        ) {
            zone = 32; // Special zone for Norway
        } else if (latitude >= 72 && latitude < 84) {
            if (longitude >= 0 && longitude < 9) {
                zone = 31;
            } else if (longitude >= 9 && longitude < 21) {
                zone = 33;
            } else if (longitude >= 21 && longitude < 33) {
                zone = 35;
            } else if (longitude >= 33 && longitude < 42) {
                zone = 37; // Special zones for Svalbard
            }
        }

        if (latitude < 0) {
            zone = zone * -1;
        }

        return zone;
    }

    const calculateUtmDistance = (utmCoord1, utmCoord2) => {
        // Desestruturação dos pontos UTM
        const { easting: x1, northing: y1, zone: zone1 } = utmCoord1;
        const { easting: x2, northing: y2, zone: zone2 } = utmCoord2;

        // Verifica se ambos os pontos estão na mesma zona UTM
        if (zone1 !== zone2) {
            return 0;
        }

        // Calcula a diferença nas coordenadas leste (x) e norte (y)
        const dx = x2 - x1;
        const dy = y2 - y1;

        // Calcula a distância Euclidiana
        return Math.sqrt(dx * dx + dy * dy);
    };

    const loadGoogleMapScript = async () => {
        if (window.google && window.google.maps) {
            initMap();
            return;
        }

        const apiKey = "AIzaSyC3to6HjzBwPXLDL7VyOD_uLj9_TQTyGAg";
        const script = document.createElement("script");
        script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&callback=initMap`;
        script.async = true;
        script.defer = true;

        window.initMap = initMap;

        document.head.appendChild(script);

        return () => {
            document.head.removeChild(script);
        };
    };

    return (
        <div>
            {loading && (
                <ProgressBar now={100} animated label="Loading Map..." />
            )}{" "}
            {/* Display progress bar while loading */}
            {isFetchingData && (
                <div className="centered-spinner">
                    {allPointsLoaded ? <strong>Estamos carregando todos os objetos do mapa, aguarde...</strong> : <></>}
                    <Spinner animation="border" variant="primary" />
                </div>
            )}
            <div id="map" style={{ height: "100vh", width: "100%" }} />
            {tooltipVisible && (
                <div
                    style={{
                        position: "absolute",
                        left: `${tooltipPosition.x}px`,
                        top: `${tooltipPosition.y}px`,
                        background: "white",
                        padding: "5px",
                        border: "1px solid #ccc",
                        borderRadius: "4px",
                        boxShadow: "0 0 5px rgba(0, 0, 0, 0.2)",
                        zIndex: "1000",
                    }}
                >
                    Coordenadas: {actualCoordinate.x}, {actualCoordinate.y}
                </div>
            )}
            {selectedMarker && selectedMarker.type === 0 ?
            <MarkerModal
                markerInfo={selectedMarker}
                onClose={handleCloseModal}
            />
            :
            <GoogleMapMarkerAnotherModal
                markerInfo={selectedMarker}
                onClose={handleCloseModal}
            />
            }
            <FloatingButton
                map={map}
                setMarkerData={setMarkerData}
                currentCalledLatLng={
                    currentCalledLatLng
                        ? currentCalledLatLng
                        : firstCalledLatLng
                }
            />
        </div>
    );
};

export default GoogleMap;
