import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import { Head } from "@inertiajs/react";
import { PageProps } from "@/types";
import GoogleMap from "../Components/GoogleMapMain";
import useFetchMarkerData from "../hooks/useFetchMarkerData";
import DashboardHeader from "./DashboardHeader";

export default function Dashboard({ auth }: PageProps) {

    const {
        markerData,
        latestCalledCoordinate,
        currentCalledLatLng,
        firstCalledLatLng,
        latestCalledLatLng,
        mapConfig,
        error,
    } = useFetchMarkerData();

    return (
        <AuthenticatedLayout
            user={auth.user}
            header={<DashboardHeader title="Controle TNE" />}
        >
            <Head title="Mapa de Acompanhamento" />

            <GoogleMap
                mapConfig={mapConfig}
                latestCalledCoordinate={latestCalledCoordinate}
                currentCalledLatLng={currentCalledLatLng}
                firstCalledLatLng={firstCalledLatLng}
                latestCalledLatLng={latestCalledLatLng}
                markersData={markerData}
                error={error}
            />
        </AuthenticatedLayout>
    );
}
