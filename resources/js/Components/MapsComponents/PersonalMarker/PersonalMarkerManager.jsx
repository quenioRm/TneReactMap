import React, { useState, useEffect } from "react";
import { Modal, Button, Container, Row, Col } from "react-bootstrap";
import PersonalMarkerConfigModal from "./PersonalMarkerConfigModal";
import PersonalMarkerList from "./PersonalMarkerList";
import { ToastContainer, toast } from "react-toastify";
// import TowerImportModal from "../../../TowersComponents/TowerImportModal";
import "react-toastify/dist/ReactToastify.css";
// import axios from "axios";
import axios from "../../../Components/axiosInstance";
import getFirstErrorMessage from "../../processLaravelErrors";

const PersonalMarkerManager = ({ show, onHide }) => {
    const [editedMarker, setEditedMarker] = useState(null);
    const [personalMarkers, setPersonalMarkers] = useState([]);
    const [configModalShow, setConfigModalShow] = useState(false);
    const [errors, setErrors] = useState({});

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
            const response = await axios.get("/api/personalmarkers");
            // console.log(response.data);
            setPersonalMarkers(response.data);
        } catch (error) {
            console.error("Error fetching personalmarkers:", error);
            toast.error(error.message);
        }
    };

    const handleSaveMarker = async ({
        name,
        coordinateX,
        coordinateY,
        zone,
        type,
        icon,
    }) => {
        try {
            const formData = new FormData();
            formData.append("name", name);
            formData.append("coordinateX", coordinateX);
            formData.append("coordinateY", coordinateY);
            formData.append("zone", zone);
            formData.append("type", type);
            formData.append("icon", icon);

            const response = await axios.post("/api/personalmarkers", formData);

            if (!response.data) {
                handleSuccessMessage();
                throw new Error("Erro ao salvar o marcador");
            }

            updateMarkersList(response.data);
            toast.success("Marcador salvo com sucesso");
        } catch (error) {
            const message = getFirstErrorMessage(error.response.data);
            console.log(message);
            setErrors(error.response.data);
            toast.error(message);
        }
    };

    const handleUpdateMarker = async ({
        id,
        name,
        coordinateX,
        coordinateY,
        zone,
        type,
        icon,
    }) => {
        try {
            const formData = new FormData();
            formData.append("_method", "PUT");
            formData.append("name", name);
            formData.append("coordinateX", coordinateX);
            formData.append("coordinateY", coordinateY);
            formData.append("zone", zone);
            formData.append("type", type);

            if (icon instanceof File) {
                formData.append("icon", icon);
            }

            const response = await axios.post(
                `/api/personalmarkers/${id}`,
                formData,
            );

            if (!response.data) {
                toast.error("Erro ao atualizar o marcador");
                throw new Error("Erro ao atualizar o marcador");
            }

            updateMarkersList(response.data);
            toast.success("Marcador atualizado com sucesso!");
        } catch (error) {
            const message = getFirstErrorMessage(error.response.data);
            console.log(message);
            setErrors(error.response.data);
            toast.error(message);
        }
    };

    const updateMarkersList = (newMarker) => {
        // Verifica se o novo marcador já existe na lista pelo ID
        const isMarkerAlreadyExists = personalMarkers.some(
            (personalMarker) => personalMarker.id === newMarker.id,
        );

        // Se o marcador não existir, adicione-o à lista
        if (!isMarkerAlreadyExists) {
            setPersonalMarkers((prevMarkers) => [...prevMarkers, newMarker]);
        } else {
            // Se o marcador já existir, atualize a lista
            setPersonalMarkers((prevMarkers) =>
                prevMarkers.map((marker) =>
                    marker.id === newMarker.id ? newMarker : marker,
                ),
            );
        }
    };

    const handleDeleteMarker = async (id) => {
        try {
            const response = await axios.delete(`/api/personalmarkers/${id}`);

            if (response.status !== 200) {
                throw new Error("Failed to delete marker");
            }

            setPersonalMarkers((prevMarkers) =>
                prevMarkers.filter((m) => m.id !== id),
            );
            toast.success("Deletado com sucesso!");
            handleCloseModal(); // Close modal after successful deletion
        } catch (error) {
            console.error("Error deleting marker:", error);
            toast.error("Error deleting marker: " + error.message);
        }
    };

    return (
        <>
            <Modal show={show} onHide={onHide} size="lg">
                <Modal.Header closeButton>
                    <Modal.Title>
                        Gerenciar Marcadores - Personalizados
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
                                <PersonalMarkerList
                                    markers={personalMarkers}
                                    onEdit={handleShowModal}
                                    onDelete={handleDeleteMarker}
                                />
                            </Col>
                        </Row>
                    </Container>
                    <PersonalMarkerConfigModal
                        show={configModalShow}
                        onHide={handleCloseModal}
                        onSave={handleSaveMarker}
                        onUpdate={handleUpdateMarker}
                        editedMarker={editedMarker}
                        errors={errors}
                    />
                </Modal.Body>
                <ToastContainer />
            </Modal>
        </>
    );
};

export default PersonalMarkerManager;
