import React, { useState } from 'react';
import { Button, Dropdown, DropdownButton, OverlayTrigger, Tooltip } from 'react-bootstrap';
import { FaHandPaper } from 'react-icons/fa';
import TowerSelectionModal from './MapsComponents/TowerSelectionModal';
import MarkerConfigModal from './MapsComponents/MarkerConfigModal';
import MarkerManager from './MapsComponents/MarkerManager';
import ImportTowersModal from '../Components/TowersComponents/TowerImportModal';

const FloatingButton = ({map}) => {
  const [showTowerModal, setShowTowerModal] = useState(false);
  const [showMarkerConfigModal, setShowMarkerConfigModal] = useState(false);
  const [showManager, setShowManager] = useState(false);
  const [towerImportModalShow, setTowerImportModalShow] = useState(false)

  const handleShowTowerModal = () => {
    setShowTowerModal(true);
    setShowMarkerConfigModal(false);
  };

  const handleShowMarkerConfigModal = () => {
    setShowMarkerConfigModal(true);
    setShowTowerModal(false);
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

  const handleShowImportTowerModal = () => {
    setTowerImportModalShow(true);
  };

  const handleCloseImportTowerModal = () => {
    setTowerImportModalShow(false);
  };

  return (
    <div>
      <OverlayTrigger placement="right" overlay={<Tooltip id="tooltip">Menu de Opções</Tooltip>}>
        <DropdownButton
          variant="primary"
          className="position-absolute top-50 start-50 translate-middle"
          style={{
            left: '50px',
            zIndex: 1000,
          }}
          title={<FaHandPaper size={20} />}
          id="dropdown-menu"
        >
          <Dropdown.Item onClick={handleShowTowerModal}>Selecionar Torre</Dropdown.Item>
          <Dropdown.Item onClick={handleShowManager}>Configurar Marcador - Atividade</Dropdown.Item>
          <Dropdown.Item onClick={handleShowImportTowerModal}>Importar Estruturas/Produção</Dropdown.Item>
        </DropdownButton>
      </OverlayTrigger>

      {/* Renderize os modais condicionalmente com base nos estados showTowerModal e showMarkerConfigModal */}
      <TowerSelectionModal rMap={map} show={showTowerModal} onClose={handleCloseModals} />
      {/* <MarkerConfigModal show={showMarkerConfigModal} onHide={handleCloseModals} onSave={() => {}} /> */}
      <MarkerManager show={showManager} onHide={handleCloseManager}/>
      {/* Renderize os modais condicionalmente com base nos estados showTowerModal e showMarkerConfigModal */}
      <ImportTowersModal show={towerImportModalShow} onHide={handleCloseImportTowerModal} />
    </div>
  );
};

export default FloatingButton;
