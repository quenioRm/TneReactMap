function calculateUtmDistance(utmCoord1, utmCoord2) {
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
}

export default calculateUtmDistance;
