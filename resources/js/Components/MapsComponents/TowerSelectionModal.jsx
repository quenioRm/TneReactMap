import React, { useState, useEffect } from "react";
import { Modal, Button, Form } from "react-bootstrap";
import { Typeahead } from "react-bootstrap-typeahead";
import axios from "../../Components/axiosInstance";

const TowerSelectionModal = ({
    rMap,
    show,
    onClose,
    fetchNewMarkerData,
    allPointsLoaded,
    setActualCoordinate,
}) => {
    const [towers, setTowers] = useState([]);
    const [selectedTower, setSelectedTower] = useState([]);

    useEffect(() => {
        const fetchTowers = async () => {
            try {
                const response = await axios.get("/api/towers/gettowers");
                const data = response.data;
                setTowers(data);
            } catch (error) {
                console.error("Erro ao buscar torres:", error);
            }
        };

        fetchTowers();
    }, []);

    const handleTowerSelect = () => {
        if (selectedTower.length > 0) {
            let utmx = selectedTower[0].tower.CoordinateX;
            let utmy = selectedTower[0].tower.CoordinateY;
            let zone = selectedTower[0].tower.Zone;

            setActualCoordinate({
                x: parseFloat(utmx),
                y: parseFloat(utmy),
                zone: parseFloat(zone),
            });

            goToCoordinate(
                selectedTower[0].position.lat,
                selectedTower[0].position.lng,
            );

            onClose();
        }
    };

    const goToCoordinate = (lat, lng) => {
        if (rMap) {
            rMap.panTo({ lat, lng });
            rMap.setZoom(15); // Set the desired zoom level
        }
    };

    return (
        <Modal show={show} onHide={onClose}>
            <Modal.Header closeButton>
                <Modal.Title>Selecione uma Torre</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                <Form>
                    <Form.Group controlId="formTower">
                        <Form.Label>Selecione uma Torre</Form.Label>
                        <Typeahead
                            id="towerTypeahead"
                            labelKey={(option) => `${option.name}`}
                            options={towers}
                            selected={selectedTower}
                            onChange={(selected) => setSelectedTower(selected)}
                            placeholder="Digite para buscar..."
                        />
                    </Form.Group>
                </Form>
            </Modal.Body>
            <Modal.Footer>
                {/* <Button variant="secondary" onClick={onClose}>
          Fechar
        </Button> */}
                <Button variant="primary" onClick={handleTowerSelect}>
                    Ir
                </Button>
            </Modal.Footer>
        </Modal>
    );
};

export default TowerSelectionModal;
