function getUtmZone(latitude, longitude) {
    // Calculate the standard UTM zone
    let zone = Math.floor((longitude + 180) / 6) + 1;

    // Special zones for Svalbard and Norway
    if (latitude >= 56 && latitude < 64 && longitude >= 3 && longitude < 12) {
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

export default getUtmZone;
