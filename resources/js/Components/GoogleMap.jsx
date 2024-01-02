    // resources/js/components/GoogleMap.js
    import React, { useEffect, useState } from 'react';
    import axios from 'axios';
    import MarkerModal from '../Components/GoogleMapMarkerModal';
    import TowerSelectButton from './MapsComponents/TowerSelectButton';
    import FloatingButton from './FloatingButton';
    import { ProgressBar } from 'react-bootstrap'; // Import ProgressBar from react-bootstrap
    import 'bootstrap/dist/css/bootstrap.min.css';
    import UtmConverter from './Converters/UtmConverter';

    const GoogleMap = () => {
    const [markerData, setMarkerData] = useState(null);
    const [selectedMarker, setSelectedMarker] = useState(null);
    const [map, setMap] = useState(null);
    const [loading, setLoading] = useState(true); // Set initial loading state to true
    const [tooltipVisible, setTooltipVisible] = useState(false);
    const [tooltipPosition, setTooltipPosition] = useState({ x: 0, y: 0 });
    const [actualCoordinate, setActualCoordinate] = useState({ x: 0, y: 0 });

    useEffect(() => {
        loadGoogleMapScript();
        fetchMarkerData();
    }, []);

    useEffect(() => {
        if (markerData) {
        initMap();
        }
    }, [markerData]);

    useEffect(() => {
        setTimeout(() => {
            setLoading(false);
        }, 20000);
    }, [map, markerData])

    const initMap = () => {
        if (!markerData || !Array.isArray(markerData) || markerData.length === 0) {
        // Marker data not available or not in the expected format
        return;
        }

        // Map initialization logic
        const map = new window.google.maps.Map(document.getElementById('map'), {
        center: { lat: markerData[0].position.lat, lng: markerData[0].position.lng },
        zoom: 15,
        gestureHandling: 'greedy'
        });

        setMap(map);

        // Add markers based on fetched data
        markerData.forEach((markerInfo, index) => {

        const defaultIcon = '';

        const impedimentIcon = {
            url: markerInfo.impediment_icon && markerInfo.impediment_icon.icon ? markerInfo.impediment_icon.icon : defaultIcon,
            scaledSize: new google.maps.Size(40, 40),
            labelOrigin: new google.maps.Point(82,20),
            labelAnchor: new google.maps.Point(82, 20),
        }

        const icon = {
            url: markerInfo.config_icon && markerInfo.config_icon.icon ? markerInfo.config_icon.icon : defaultIcon,
            scaledSize: new google.maps.Size(40, 40),
            labelOrigin: new google.maps.Point(82,20),
            labelAnchor: new google.maps.Point(82, 20),
        };


        const label = {
            text: markerInfo.label.text,
            color: 'black',
            fontSize: '12px',
            fontWeight: 'bold',
            labelOrigin: new google.maps.Point(82, 20),
            labelAnchor: new google.maps.Point(82, 20),
        };


        const marker = new window.google.maps.Marker({
            position: markerInfo.position,
            label: label,
            draggable: markerInfo.draggable,
            map: map,
            title: markerInfo.label.text,
            icon: (impedimentIcon.url !== '') ? impedimentIcon : icon.url == '' ? '' : icon
        });

        // Adiciona um InfoWindow vazio ao marcador
            const infowindow = new google.maps.InfoWindow();
            infowindow.setOptions({ disableAutoPan: true });

            // Adiciona ouvinte de evento para exibir o InfoWindow no mouseover
            marker.addListener('mouseover', function () {
                // Obtém a última atividade realizada
                const lastActivity = markerInfo.config_icon.activitie ? `<br><b>Última Atividade:</b> ${markerInfo.config_icon.activitie}` : '';

                // Verifica se há impedimentos e constrói o conteúdo
                let impedimentosInfo = '';
                if (markerInfo.Impediments && markerInfo.Impediments.length > 0) {
                    impedimentosInfo = '<br><b>Impedimentos:</b>';
                    markerInfo.Impediments.forEach(impedimento => {
                        impedimentosInfo += `<br>- ${impedimento.ImpedimentType + ': ' + impedimento.Status}`; // Altere para o campo correto do seu objeto impedimento
                    });
                }

                let receiveStatusInfo = '';
                receiveStatusInfo = '<br><b>Solicitação de Compra Estrutura:</b>';

                if(markerInfo.SolicitationDate !== '')
                    receiveStatusInfo += `<br>- Solicitado em: ${markerInfo.SolicitationDate}`;

                if(markerInfo.ReceiveDate !== '')
                    receiveStatusInfo += `<br>- Recebida em: ${markerInfo.ReceiveDate}`;

                if(markerInfo.PreviousReceiveDate !== '')
                    receiveStatusInfo += `<br>- Previsão de entrega: ${markerInfo.PreviousReceiveDate}`;

                receiveStatusInfo += `<br>- Status: ${markerInfo.ReceiveStatus}`;

                // Atualiza o conteúdo do InfoWindow com as informações formatadas
                infowindow.setContent(`<b>Torre:</b> ${markerInfo.label.text}${lastActivity}${impedimentosInfo}${receiveStatusInfo}`);

                // Abre o InfoWindow
                infowindow.open(map, marker);
            });

            // Adiciona ouvinte de evento para fechar o InfoWindow no mouseout
            marker.addListener('mouseout', function () {
                infowindow.close();
            });

        // Add a listener for dragend event
        marker.addListener('dragend', () => {
            onMarkerDragEnd(marker, index);
        });

        // Add a listener for click event
        marker.addListener('click', () => {
            onMarkerClick(markerInfo);
        });


        map.addListener('mousemove', (event) => {
            const mouseX = event.pixel.x;
            const mouseY = event.pixel.y;

            // Update Coordinate
            // const coordinates = convertLatLongToUTM(event.latLng.lat(), event.latLng.lng());
            // console.log(coordinates);
            const result = UtmConverter.convertLatLngToUtm(parseFloat(event.latLng.lat()), parseFloat(event.latLng.lng()));
            // console.log(result)
            setActualCoordinate({ x: result.easting.toFixed(2), y: result.northing.toFixed(2) });

            // Update tooltip position
            setTooltipPosition({ x: mouseX + 10, y: mouseY - 20 });

            // Show tooltip
            setTooltipVisible(true);

            // Clear previous timer
            clearTimeout(map.tooltipTimer);

            // Set timer to hide tooltip after 5 seconds
            map.tooltipTimer = setTimeout(() => {
            setTooltipVisible(false);
            }, 5000);
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
        const response = await axios.get('/api/get-coordinates');
        setMarkerData(response.data);
        } catch (error) {
        console.error('Error fetching marker data:', error);
        }
    };

    const loadGoogleMapScript = async () => {
        if (window.google && window.google.maps) {
        initMap();
        return;
        }

        const apiKey = 'AIzaSyC3to6HjzBwPXLDL7VyOD_uLj9_TQTyGAg';
        const script = document.createElement('script');
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
        {loading && <ProgressBar now={100} animated label="Loading Map..." />} {/* Display progress bar while loading */}
        <div id="map" style={{ height: '100vh', width: '100%' }} />

        {tooltipVisible && (
            <div
            style={{
                position: 'absolute',
                left: `${tooltipPosition.x}px`,
                top: `${tooltipPosition.y}px`,
                background: 'white',
                padding: '5px',
                border: '1px solid #ccc',
                borderRadius: '4px',
                boxShadow: '0 0 5px rgba(0, 0, 0, 0.2)',
                zIndex: '1000',
            }}
            >
            Coordenadas: {actualCoordinate.x}, {actualCoordinate.y}
            </div>
        )}


        <MarkerModal markerInfo={selectedMarker} onClose={handleCloseModal} />
        <FloatingButton map={map} />
        </div>
    );
    };

    export default GoogleMap;
