import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head } from '@inertiajs/react';
import { PageProps } from '@/types';
import GoogleMap from '../Components/GoogleMap';
import { Button } from 'react-bootstrap';
import { useState } from 'react';
import MarkerConfigModal from '../Components/MapsComponents/MarkerConfigModal';
import TowerSelectionModal from '../Components/MapsComponents/TowerSelectionModal';

export default function Dashboard({ auth }: PageProps) {

    const [showMarkerConfigModal, setShowMarkerConfigModal] = useState(false);
    const [showTowerSelectModal, setShowTowerSelectModal] = useState(false);
    const [currentCoordinates, setCurrentCoordinates] = useState({ lat: 0, lng: 0 });

    const handleOpenMarkerConfigModal = () => {
      setShowMarkerConfigModal(true);
    };

    const handleCloseMarkerConfigModal = () => {
      setShowMarkerConfigModal(false);
    };

    const handleOpenTowerSelect = () => {
        setShowTowerSelectModal(true);
    };

    const handleCloseTowerSelect = () => {
        setShowTowerSelectModal(false);
    };


    return (
        <AuthenticatedLayout
            user={auth.user}
            header={
                <div className="d-flex justify-content-between align-items-center">
                  <h2 className="font-weight-bold text-xl text-gray-800">Dashboard</h2>
                  {/* Adicione seus botões à direita aqui */}
                  <div className="d-flex">
                    {/* <Button variant="primary" className="mr-2" onClick={handleOpenMarkerConfigModal}>
                      Configurar Marcador
                    </Button> */}
                    {/* <Button variant="primary" className="mr-2" onClick={handleOpenTowerSelect}>
                      Buscar Estrutura
                    </Button> */}
                  </div>
                </div>
              }
        >
        <Head title="Dashboard" />
        {/*
            <div className="py-12">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                    <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg">
                        <div className="p-6 text-gray-900">You're logged in!</div>
                    </div>
                </div>
            </div> */}
        <GoogleMap />
        {/* <MarkerConfigModal show={showMarkerConfigModal} onHide={handleCloseMarkerConfigModal} onSave={undefined}  /> */}
        {/* <TowerSelectionModal show={showTowerSelectModal} onHide={handleCloseTowerSelect}  /> */}
        </AuthenticatedLayout>
    );
}
