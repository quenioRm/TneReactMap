import '../css/GoogleMap.css'
/**
 * Creates a Google Maps Marker icon.
 * @param {Object} markerInfo Information about the marker.
 * @returns {Object} Google Maps Icon object.
 */
export const createMarkerIcon = (markerInfo) => {
    const defaultIcon = ''; // Default icon URL

    // Construct the impedimentIcon
    const impedimentIcon = {
        url: markerInfo.impediment_icon && markerInfo.impediment_icon.icon
             ? markerInfo.impediment_icon.icon
             : defaultIcon,
        scaledSize: new window.google.maps.Size(40, 40),
        labelOrigin: new window.google.maps.Point(100, 20),
        labelAnchor: new window.google.maps.Point(100, 20),
    };

    // Use the impedimentIcon if it has a valid URL, otherwise fallback to config_icon or default
    return impedimentIcon.url !== defaultIcon ? impedimentIcon : {
        url: markerInfo.config_icon && markerInfo.config_icon.icon
             ? markerInfo.config_icon.icon
             : defaultIcon,
        scaledSize: markerInfo.type === 0
            ? new google.maps.Size(40, 40)
            : new google.maps.Size(80, 80), // Can be dynamic based on markerInfo
        labelOrigin: new window.google.maps.Point(100, 20),
    };
};

/**
 * Creates a label for a Google Maps Marker.
 * @param {Object} markerInfo Information about the marker.
 * @returns {Object} Google Maps Marker Label object.
 */
export const createMarkerLabel = (markerInfo) => {
    // Example label configuration - modify as needed
    return {
        text: markerInfo.label.text,
        color: 'black', // can be dynamic based on markerInfo
        fontSize: '12px',
        fontWeight: 'bold',
    };
};

/**
 * Prepares the HTML content for the CustomOverlay.
 * @param {Object} markerInfo Information about the marker.
 * @returns {string} HTML content for the CustomOverlay.
 */
const prepareOverlayContent = (markerInfo) => {
    let iconsHTML = '';

    if (markerInfo.iconsbarImpediment) {
        iconsHTML = '<div class="icons-bar">';
        markerInfo.iconsbarImpediment.forEach((impediment) => {
            iconsHTML += `<div class="icon-box">
                <img src="${impediment.icon}" />
                <div class="icon-date">${impediment.impedimentType}</div>
            </div>`;
        });
        iconsHTML += '</div>';
    } else if (markerInfo.iconsbarActivity) {
        iconsHTML = '<div class="icons-bar">';
        markerInfo.iconsbarActivity.forEach((activity) => {
            let additionalInfo = '';
            if (activity.type === 1) {
                const personalAvc = activity.avc.toLocaleString(undefined, {
                    style: 'percent',
                    minimumFractionDigits: 2,
                });
                additionalInfo = `<br>${personalAvc}`;
            }
            iconsHTML += `<div class="icon-box">
                <img src="${activity.icon}" />
                <div class="icon-date">${activity.date}${additionalInfo}</div>
            </div>`;
        });
        iconsHTML += '</div>';
    }

    return iconsHTML;
};


/**
 * Prepares the content for the InfoWindow.
 * @param {Object} markerInfo Information about the marker.
 * @returns {string} HTML content for the InfoWindow.
 */
const prepareInfoWindowContent = (markerInfo) => {
    let infoWindowContent = '';

    // adding last activity information
    const lastActivity = markerInfo.config_icon && markerInfo.config_icon.activitie
        ? `<br><b>Última Atividade:</b> ${markerInfo.config_icon.activitie}`
        : '';

    // adding impediment information
    let impedimentosInfo = '';
    if (markerInfo.Impediments && markerInfo.Impediments.length > 0) {
        impedimentosInfo = '<br><b>Impedimentos:</b>';
        markerInfo.Impediments.forEach((impedimento) => {
            impedimentosInfo += `<br>- ${impedimento.ImpedimentType}: ${impedimento.Status}`;
        });
    }

    // adding solicitation and receive status
    let receiveStatusInfo = '<br><b>Solicitação de Compra Estrutura:</b>';
    if (markerInfo.SolicitationDate !== '')
        receiveStatusInfo += `<br>- Solicitado em: ${markerInfo.SolicitationDate}`;
    if (markerInfo.ReceiveDate !== '')
        receiveStatusInfo += `<br>- Recebida em: ${markerInfo.ReceiveDate}`;
    if (markerInfo.PreviousReceiveDate !== '')
        receiveStatusInfo += `<br>- Previsão de entrega: ${markerInfo.PreviousReceiveDate}`;
    receiveStatusInfo += `<br>- Status: ${markerInfo.ReceiveStatus}`;

    // Combine all pieces of information
    infoWindowContent = `<b>Torre:</b> ${markerInfo.label.text}${lastActivity}${impedimentosInfo}${receiveStatusInfo}`;

    return infoWindowContent;
};
/**
 * Sets up event listeners for the marker.
 */
const setupMarkerEventListeners = (marker, customOverlay, infowindow, map, markerInfo) => {
    marker.addListener("mouseover", function () {
        customOverlay.div.style.display = "block";
        infowindow.setContent(prepareInfoWindowContent(markerInfo));
        infowindow.open(map, marker);
    });

    marker.addListener("mouseout", function () {
        infowindow.close();
        customOverlay.div.style.display = "none";
    });
};

/**
 * Creates a new Google Maps Marker.
 * @param {Object} map The Google Map instance.
 * @param {Object} markerInfo Information about the marker.
 * @returns {Object} The created Google Maps Marker object.
 */
export const createMarker = (map, markerInfo, CustomOverlay) => {
    const icon = createMarkerIcon(markerInfo);
    const label = createMarkerLabel(markerInfo);
    const marker = new window.google.maps.Marker({
        position: markerInfo.position,
        map: map,
        icon: icon,
        label: label,
        draggable: markerInfo.draggable || false,
        title: markerInfo.title || '',
    });

    const iconsHTML = prepareOverlayContent(markerInfo);
    const customOverlay = new CustomOverlay(marker, iconsHTML, map);
    const infowindow = new window.google.maps.InfoWindow({ disableAutoPan: true });

    setupMarkerEventListeners(marker, customOverlay, infowindow, map, markerInfo);
    return marker;
};

/**
 * Creates a polyline on the map based on the provided marker data.
 * @param {Object[]} markerData Array of marker data.
 * @param {Object} map The Google Map instance.
 * @returns {Object} The created Google Maps Polyline object.
 */
export const createPolyline = (markerData, map) => {
    const filteredMarkerData = markerData.filter(markerInfo => markerInfo.type === 0);
    const polylinePath = filteredMarkerData.map(markerInfo => markerInfo.position);

    const polyline = new window.google.maps.Polyline({
        path: polylinePath,
        geodesic: true,
        strokeColor: "#FF0000",
        strokeOpacity: 1.0,
        strokeWeight: 2,
    });

    polyline.setMap(map);
    return polyline;
};