import React, { useState, useEffect, useRef } from "react";
import { Modal, Button, Form } from "react-bootstrap";
import { Typeahead } from "react-bootstrap-typeahead";
import axios from "../../Components/axiosInstance";

const TowerSelectionModal = ({ rMap, show, onClose }) => {
    const [towers, setTowers] = useState([]);
    const [selectedTower, setSelectedTower] = useState([]);
    const typeaheadRef = useRef();

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

    const handleInputChange = () => {
        // Limpar a seleção ao entrar novamente no input
        setSelectedTower([]);
    };

    const handleTowerSelect = () => {
        if (selectedTower.length > 0) {
            let utmx = selectedTower[0].tower.CoordinateX;
            let utmy = selectedTower[0].tower.CoordinateY;
            let zone = selectedTower[0].tower.Zone;

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
                <Modal.Title>Selecione uma Torre / Subestação / Outro Ponto</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                <Form>
                    <Form.Group controlId="formTower">
                        <Form.Label>Selecione uma Torre / Subestação / Outro Ponto</Form.Label>
                        <Typeahead
                            ref={typeaheadRef}
                            id="towerTypeahead"
                            labelKey={(option) => `${option.name}`}
                            options={towers}
                            selected={selectedTower}
                            onChange={(selected) => setSelectedTower(selected)}
                            onFocus={handleInputChange}
                            placeholder="Digite para buscar..."
                        />
                    </Form.Group>
                </Form>
            </Modal.Body>
            <Modal.Footer>
                <Button variant="primary" onClick={handleTowerSelect}>
                    Ir
                </Button>
            </Modal.Footer>
        </Modal>
    );
};

export default TowerSelectionModal;
