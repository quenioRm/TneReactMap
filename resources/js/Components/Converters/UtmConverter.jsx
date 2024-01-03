class UtmConverter {
    // WGS 84 ellipsoid parameters
    a = 6378137.0;
    eccSquared = 0.0066943800229;

    toRadians(degrees) {
        return degrees * (Math.PI / 180);
    }

    convertLatLngToUtm(latitude, longitude) {
        const latRad = this.toRadians(latitude);
        const longRad = this.toRadians(longitude);

        const zoneNumber = Math.floor((longitude + 180) / 6) + 1;

        const longOrigin = (zoneNumber - 1) * 6 - 180 + 3;
        const longOriginRad = this.toRadians(longOrigin);

        const eccPrimeSquared = this.eccSquared / (1 - this.eccSquared);

        const N =
            this.a /
            Math.sqrt(
                1 - this.eccSquared * Math.sin(latRad) * Math.sin(latRad),
            );
        const T = Math.tan(latRad) * Math.tan(latRad);
        const C = eccPrimeSquared * Math.cos(latRad) * Math.cos(latRad);
        const A = Math.cos(latRad) * (longRad - longOriginRad);

        const M =
            this.a *
            ((1 -
                this.eccSquared / 4 -
                (3 * this.eccSquared * this.eccSquared) / 64 -
                (5 * this.eccSquared * this.eccSquared * this.eccSquared) /
                    256) *
                latRad -
                ((3 * this.eccSquared) / 8 +
                    (3 * this.eccSquared * this.eccSquared) / 32 +
                    (45 * this.eccSquared * this.eccSquared * this.eccSquared) /
                        1024) *
                    Math.sin(2 * latRad) +
                ((15 * this.eccSquared * this.eccSquared) / 256 +
                    (45 * this.eccSquared * this.eccSquared * this.eccSquared) /
                        1024) *
                    Math.sin(4 * latRad) -
                ((35 * this.eccSquared * this.eccSquared * this.eccSquared) /
                    3072) *
                    Math.sin(6 * latRad));

        const UTMEasting =
            0.9996 *
                N *
                (A +
                    ((1 - T + C) * A * A * A) / 6 +
                    ((5 - 18 * T + T * T + 72 * C - 58 * eccPrimeSquared) *
                        A *
                        A *
                        A *
                        A *
                        A) /
                        120) +
            500000.0;

        var UTMNorthing =
            0.9996 *
            (M +
                N *
                    Math.tan(latRad) *
                    ((A * A) / 2 +
                        ((5 - T + 9 * C + 4 * C * C) * A * A * A * A) / 24 +
                        ((61 -
                            58 * T +
                            T * T +
                            600 * C -
                            330 * eccPrimeSquared) *
                            A *
                            A *
                            A *
                            A *
                            A *
                            A) /
                            720));

        if (latitude < 0) {
            UTMNorthing += 10000000.0;
        }

        return { easting: UTMEasting, northing: UTMNorthing, zoneNumber };
    }
}

export default new UtmConverter();
