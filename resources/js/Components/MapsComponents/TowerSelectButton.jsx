import React, { useState } from "react";
import { Button, OverlayTrigger, Tooltip } from "react-bootstrap";
import TowerSelectionModal from "./TowerSelectionModal";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faHandRock } from "@fortawesome/free-solid-svg-icons";

const TowerSelectButton = (rMap) => {
    const [showTowerModal, setShowTowerModal] = useState(null);

    const handleShowModal = () => {
        setShowTowerModal(true);
    };

    const handleCloseShowModal = () => {
        setShowTowerModal(false);
    };

    return (
        <div>
            <OverlayTrigger
                placement="right"
                overlay={<Tooltip id="tooltip">Selecione uma torre</Tooltip>}
            >
                <Button
                    variant="primary"
                    className="position-absolute top-50 start-50 translate-middle"
                    style={{
                        left: "50px",
                        zIndex: 1000,
                    }}
                    onClick={() => handleShowModal(true)} // Corrija este trecho para chamar handleShowModal no evento onClick
                >
                    <FontAwesomeIcon icon={faHandRock} />
                    Torre
                </Button>
            </OverlayTrigger>

            {/* Renderize o modal condicionalmente com base no estado showTowerModal */}
            <TowerSelectionModal
                rMap={rMap}
                show={showTowerModal}
                onClose={handleCloseShowModal}
            />
        </div>
    );
};

export default TowerSelectButton;
