import React, { useState, useEffect } from "react";
import { Modal, Button, Container, Row, Col } from "react-bootstrap";
import MarkerConfigImpedimentModal from "./MarkerConfigImpedimentModal";
import MarkerListImpediment from "./MarkerListImpediment";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
// import axios from "axios";
import axios from "../../../Components/axiosInstance";

const MarkerManagerImpediment = ({ show, onHide }) => {
    const [editedMarker, setEditedMarker] = useState(null);
    const [markers, setMarkers] = useState([]);
    const [configModalShow, setConfigModalShow] = useState(false);

    useEffect(() => {
        // Fetch markers when the component mounts
        fetchMarkers();
    }, []);

    const handleShowModal = (marker) => {
        setEditedMarker(marker);
        setConfigModalShow(true);
    };

    const handleCloseModal = () => {
        setEditedMarker(null);
        setConfigModalShow(false);
    };

    // Function to fetch markers from the API
    const fetchMarkers = async () => {
        try {
            const response = await axios.get("/api/markersimpediments");
            setMarkers(response.data);
        } catch (error) {
            console.error("Error fetching markers:", error);
        }
    };

    const handleSaveMarker = async ({
        impedimentType,
        status,
        icon,
        isBlocked,
    }) => {
        try {
            const formData = new FormData();
            formData.append("ImpedimentType", impedimentType);
            formData.append("Status", status);
            formData.append("Icon", icon);
            formData.append("IsBlocked", isBlocked);

            const response = await axios.post(
                "/api/markersimpediments",
                formData,
            );

            if (!response.data) {
                throw new Error("Erro ao salvar o marcador");
            }

            updateMarkersList(response.data);
            toast.success("Marcador salvo com sucesso");
        } catch (error) {
            console.error("Erro ao salvar o marcador:", error.message);
            toast.error("Erro ao salvar o marcador: " + error.message);
        }
    };

    const handleUpdateMarker = async ({
        id,
        impedimentType,
        status,
        icon,
        isBlocked,
    }) => {
        try {
            const formData = new FormData();
            formData.append("_method", "PUT");
            formData.append("ImpedimentType", impedimentType);
            formData.append("Status", status);
            formData.append("IsBlocked", isBlocked);

            // If a new icon is provided, add it to the FormData
            if (icon instanceof File) {
                formData.append("Icon", icon);
            }

            const response = await axios.post(
                `/api/markersimpediments/${id}`,
                formData,
            );

            if (response.status === 200) {
                const data = response.data;
                updateMarkersList(data);
                toast.success("Marcador atualizado com sucesso!");
            } else {
                toast.error(response.statusText);
                throw new Error("Erro ao atualizar o marcador");
            }
        } catch (error) {
            toast.error(error.message);
        }
    };

    const updateMarkersList = (newMarker) => {
        // Check if the new marker already exists in the list by ID
        const isMarkerAlreadyExists = markers.some(
            (marker) => marker.id === newMarker.id,
        );

        // If the marker does not exist, add it to the list
        if (!isMarkerAlreadyExists) {
            setMarkers((prevMarkers) => [...prevMarkers, newMarker]);
        } else {
            // If the marker already exists, update the list
            setMarkers((prevMarkers) =>
                prevMarkers.map((marker) =>
                    marker.id === newMarker.id ? newMarker : marker,
                ),
            );
        }
    };

    const handleDeleteMarker = async (id) => {
        try {
            const response = await axios.delete(
                `/api/markersimpediments/${id}`,
            );

            if (response.status === 200) {
                setMarkers((prevMarkers) =>
                    prevMarkers.filter((m) => m.id !== id),
                );
                toast.success("Deletado com sucesso!");
                handleCloseModal(); // Close modal after successful deletion
            } else {
                throw new Error("Failed to delete marker");
            }
        } catch (error) {
            toast.error("Error deleting marker: " + error.message);
        }
    };

    return (
        <>
            <Modal show={show} onHide={onHide} size="lg">
                <Modal.Header closeButton>
                    <Modal.Title>
                        Gerenciar Marcadores - Impedimentos
                    </Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Container>
                        <Row className="mb-3">
                            <Col>
                                <Button
                                    variant="primary"
                                    onClick={() => handleShowModal(null)}
                                >
                                    Adicionar Marcador
                                </Button>
                            </Col>
                        </Row>
                        <Row>
                            <Col>
                                <MarkerListImpediment
                                    markers={markers}
                                    onEdit={handleShowModal}
                                    onDelete={handleDeleteMarker}
                                />
                            </Col>
                        </Row>
                    </Container>
                    <MarkerConfigImpedimentModal
                        show={configModalShow}
                        onHide={handleCloseModal}
                        onSave={handleSaveMarker}
                        onUpdate={handleUpdateMarker}
                        editedMarker={editedMarker}
                    />
                </Modal.Body>
                <ToastContainer />
            </Modal>
        </>
    );
};

export default MarkerManagerImpediment;
