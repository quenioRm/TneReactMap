import React, { useRef, useState, useEffect } from "react";
import { Modal, Button, Form, Row, Col } from "react-bootstrap";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTimes, faPaperPlane } from "@fortawesome/free-solid-svg-icons";
import "../css/ButtonColor.css";
import Select from "react-select";
import axios from "../../Components/axiosInstance";

const RouteCreatorModal = ({
    show,
    handleClose,
    map,
    setDirectionsResponse,
}) => {
    const [distance, setDistance] = useState(0);
    const [duration, setDuration] = useState(0);
    const [towers, setTowers] = useState([]);
    const [selectedOrigin, setSelectedOrigin] = useState(null);
    const [selectedDestination, setSelectedDestination] = useState(null);

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

    const calculateRoute = () => {
        if (!selectedOrigin || !selectedDestination || !map) {
            return; // Não calcular se as torres ou mapa não estiverem definidos
        }

        const DirectionsService = new window.google.maps.DirectionsService();
        DirectionsService.route(
            {
                origin: new window.google.maps.LatLng(
                    selectedOrigin.position.lat,
                    selectedOrigin.position.lng,
                ),
                destination: new window.google.maps.LatLng(
                    selectedDestination.position.lat,
                    selectedDestination.position.lng,
                ),
                travelMode: window.google.maps.TravelMode.DRIVING,
            },
            (result, status) => {
                if (status === window.google.maps.DirectionsStatus.OK) {
                    setDirectionsResponse(result);
                    setDistance(result.routes[0].legs[0].distance.text);
                    setDuration(result.routes[0].legs[0].duration.text);
                } else {
                    console.error(
                        "Não foi possível obter as direções:",
                        result,
                    );
                }
            },
        );
    };

    const clearRoute = () => {
        setSelectedOrigin(null);
        setSelectedDestination(null);
        setDirectionsResponse(null);
        setDistance(0);
        setDuration(0);
    };

    const goToFinalCoordinate = () => {
        if (selectedDestination && map) {
            const finalDestination = new window.google.maps.LatLng(
                selectedDestination.position.lat,
                selectedDestination.position.lng,
            );
            map.panTo(finalDestination);
            map.setZoom(15);
        }
    };

    return (
        <Modal show={show} onHide={handleClose} size="xl" centered>
            <Modal.Header closeButton>
                <Modal.Title>Configurar Rota</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                <Form>
                    <Row>
                        <Col>
                            <Form.Group controlId="originSelect">
                                <Select
                                    options={towers.map((tower) => ({
                                        value: tower,
                                        label: tower.name,
                                    }))}
                                    onChange={(option) =>
                                        setSelectedOrigin(option.value)
                                    }
                                    value={
                                        selectedOrigin
                                            ? {
                                                  value: selectedOrigin,
                                                  label: selectedOrigin.name,
                                              }
                                            : null
                                    }
                                    placeholder={"Origem"}
                                />
                            </Form.Group>
                        </Col>
                        <Col>
                            <Form.Group controlId="destinationSelect">
                                <Select
                                    options={towers.map((tower) => ({
                                        value: tower,
                                        label: tower.name,
                                    }))}
                                    onChange={(option) =>
                                        setSelectedDestination(option.value)
                                    }
                                    value={
                                        selectedDestination
                                            ? {
                                                  value: selectedDestination,
                                                  label: selectedDestination.name,
                                              }
                                            : null
                                    }
                                    placeholder={"Destino"}
                                />
                            </Form.Group>
                        </Col>
                        <Col xs="auto">
                            <Button
                                className="pink-button"
                                onClick={calculateRoute}
                            >
                                Calcular Rota
                            </Button>
                        </Col>
                        <Col xs="auto">
                            <Button
                                variant="outline-secondary"
                                onClick={clearRoute}
                            >
                                <FontAwesomeIcon icon={faTimes} />
                            </Button>
                        </Col>
                    </Row>
                </Form>
                <Row className="mt-3">
                    <Col>
                        <span>Distância: {distance}</span>
                    </Col>
                    <Col>
                        <span>Duração: {duration}</span>
                    </Col>
                    <Col xs="auto">
                        <Button
                            variant="outline-secondary"
                            onClick={goToFinalCoordinate}
                        >
                            <FontAwesomeIcon icon={faPaperPlane} />
                        </Button>
                    </Col>
                </Row>
            </Modal.Body>
        </Modal>
    );
};

export default RouteCreatorModal;
