import React, { useState } from "react";
import {
    Button,
    Dropdown,
    DropdownButton,
    OverlayTrigger,
    Tooltip,
} from "react-bootstrap";
import TowerSelectionModal from "./MapsComponents/TowerSelectionModal";
import MarkerManager from "./MapsComponents/Activitie/TransmissionLine/MarkerManager";
import ImportTowersModal from "../Components/TowersComponents/TowerImportModal";
import ImportImpedimentsModal from "../Components/TowersComponents/ImpedimentImportModal";
import MarkerManagerImpediment from "../Components/MapsComponents/Impediments/MarkerManagerImpediment";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faHandRock, faBars } from "@fortawesome/free-solid-svg-icons";
import AddMarkerModal from "./MapsComponents/PersonalMarker/AddMarkerModal";
import PersonalMarkerManager from "./MapsComponents/PersonalMarker/PersonalMarkerManager";
import MarkerManagerPersonal from "../Components/MapsComponents/Activitie/Personal/MarkerManagerPersonal";

const FloatingButton = ({
    map,
    setMarkerData,
    currentCalledLatLng,
    fetchNewMarkerData,
    allPointsLoaded,
    setActualCoordinate,
}) => {
    const [showTowerModal, setShowTowerModal] = useState(false);
    const [showMarkerConfigModal, setShowMarkerConfigModal] = useState(false);
    const [showManager, setShowManager] = useState(false);
    const [towerImportModalShow, setTowerImportModalShow] = useState(false);
    const [towerImpedimentImportModalShow, setImpedimentTowerImportModalShow] =
        useState(false);
    const [showManagerImpediment, setShowManagerImpediment] = useState(false);
    const [showAddMarkerModal, setShowAddMarkerModal] = useState(false);
    const [showAddPersonalActivity, setShowAddPersonalActivity] =
        useState(false);

    const handleShowTowerModal = () => {
        setShowTowerModal(true);
        setShowMarkerConfigModal(false);
    };

    const handleCloseModals = () => {
        setShowTowerModal(false);
        setShowMarkerConfigModal(false);
    };

    const handleShowManager = () => {
        setShowManager(true);
    };

    const handleCloseManager = () => {
        setShowManager(false);
    };

    const handleShowManageImpediment = () => {
        setShowManagerImpediment(true);
    };

    const handleCloseManagerImpediment = () => {
        setShowManagerImpediment(false);
    };

    const handleShowImportTowerModal = () => {
        setTowerImportModalShow(true);
    };

    const handleCloseImportTowerModal = () => {
        setTowerImportModalShow(false);
    };

    const handleShowImportImpedimentTowerModal = () => {
        setImpedimentTowerImportModalShow(true);
    };

    const handleCloseImportImpedimentTowerModal = () => {
        setImpedimentTowerImportModalShow(false);
    };

    const handleShowAddMarkerModal = () => {
        setShowAddMarkerModal(true);
    };

    const handleCloseAddMarkerModal = () => {
        setShowAddMarkerModal(false);
    };

    const handleShowAddPersonalActivity = () => {
        setShowAddPersonalActivity(true);
    };

    const handleClosePersonalActivity = () => {
        setShowAddPersonalActivity(false);
    };

    return (
        <div>
            <OverlayTrigger
                placement="right"
                overlay={<Tooltip id="tooltip">Menu de Opções</Tooltip>}
            >
                <DropdownButton
                    variant="primary"
                    className="position-absolute top-50 start-50 translate-middle"
                    style={{
                        left: "50px",
                        zIndex: 1000,
                    }}
                    title={<FontAwesomeIcon icon={faBars} />}
                    id="dropdown-menu"
                >
                    <Dropdown.Item onClick={handleShowTowerModal}>
                        Selecionar Ponto
                    </Dropdown.Item>
                    <Dropdown.Divider />
                    <Dropdown.Item onClick={handleShowManager}>
                        Configurar Marcador - Atividade [LT]
                    </Dropdown.Item>
                    <Dropdown.Item onClick={handleShowManageImpediment}>
                        Configurar Marcador - Impedimento [LT]
                    </Dropdown.Item>
                    <Dropdown.Item onClick={handleShowImportTowerModal}>
                        Importar Estruturas/Produção [LT]
                    </Dropdown.Item>
                    <Dropdown.Item
                        onClick={handleShowImportImpedimentTowerModal}
                    >
                        Importar Impedimentos Estruturas [LT]
                    </Dropdown.Item>
                    <Dropdown.Divider />
                    <Dropdown.Item onClick={handleShowAddMarkerModal}>
                        Adicionar Marcador Personalizado
                    </Dropdown.Item>
                    <Dropdown.Item onClick={handleShowAddPersonalActivity}>
                        Configurar Marcador - Atividade [Personalizados]
                    </Dropdown.Item>
                </DropdownButton>
            </OverlayTrigger>

            {/* Renderize os modais condicionalmente com base nos estados showTowerModal e showMarkerConfigModal */}
            <TowerSelectionModal
                rMap={map}
                show={showTowerModal}
                onClose={handleCloseModals}
                fetchNewMarkerData={fetchNewMarkerData}
                allPointsLoaded={allPointsLoaded}
                setActualCoordinate={setActualCoordinate}
            />
            {/* <MarkerConfigModal show={showMarkerConfigModal} onHide={handleCloseModals} onSave={() => {}} /> */}
            <MarkerManager show={showManager} onHide={handleCloseManager} />
            {/* Renderize os modais condicionalmente com base nos estados showTowerModal e showMarkerConfigModal */}
            <ImportTowersModal
                show={towerImportModalShow}
                onHide={handleCloseImportTowerModal}
            />
            {/*  */}
            <MarkerManagerImpediment
                show={showManagerImpediment}
                onHide={handleCloseManagerImpediment}
            />
            {/*  */}
            <ImportImpedimentsModal
                show={towerImpedimentImportModalShow}
                onHide={handleCloseImportImpedimentTowerModal}
            />

            <PersonalMarkerManager
                show={showAddMarkerModal}
                onHide={handleCloseAddMarkerModal}
            />
            <MarkerManagerPersonal
                show={showAddPersonalActivity}
                onHide={handleClosePersonalActivity}
            />
        </div>
    );
};

export default FloatingButton;
