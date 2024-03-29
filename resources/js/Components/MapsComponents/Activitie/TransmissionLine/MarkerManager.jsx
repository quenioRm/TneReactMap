import React, { useState, useEffect } from "react";
import { Modal, Button, Container, Row, Col } from "react-bootstrap";
import MarkerConfigModal from "./MarkerConfigModal";
import MarkerList from "./MarkerList";
import { ToastContainer, toast } from "react-toastify";
import TowerImportModal from "../../../TowersComponents/TowerImportModal";
import "react-toastify/dist/ReactToastify.css";
// import axios from "axios";
import axios from "../../../../Components/axiosInstance";
import getFirstErrorMessage from "../../../processLaravelErrors";
import Swal from "sweetalert2";

const MarkerManager = ({ show, onHide }) => {
    const [editedMarker, setEditedMarker] = useState(null);
    const [markers, setMarkers] = useState([]);
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
            const response = await axios.get("/api/markers");
            const data = response.data;
            setMarkers(data);
        } catch (error) {
            console.error("Error fetching markers:", error);
        }
    };

    const handleSaveMarker = async ({ atividade, icone, unidade }) => {
        try {
            const formData = new FormData();
            formData.append("atividade", atividade);
            formData.append("unidade", unidade);
            formData.append("icone", icone);

            const response = await axios.post("/api/markers", formData);

            if (response.status === 200 || response.status === 201) {
                const data = response.data;
                updateMarkersList(data);
                toast.success("Marcador salvo com sucesso");
                setErrors({});
                setConfigModalShow(false);
            } else {
                toast.error(response.statusText);
                throw new Error("Erro ao salvar");
            }
        } catch (error) {
            const message = getFirstErrorMessage(error.response.data);
            // console.log(message)
            setErrors(error.response.data);
            // toast.error(message);
        }
    };

    const handleUpdateMarker = async ({ id, atividade, icone, unidade }) => {
        try {
            const formData = new FormData();
            formData.append("_method", "PUT");
            formData.append("atividade", atividade);
            formData.append("unidade", unidade);

            if (icone instanceof File) {
                formData.append("icone", icone);
            }

            const response = await axios.post(`/api/markers/${id}`, formData);

            if (response.status === 200) {
                const data = response.data;
                updateMarkersList(data);
                toast.success("Marcador atualizado com sucesso!");
                setErrors({});
                setConfigModalShow(false);
            } else {
                toast.error(response.statusText);
                throw new Error("Erro ao atualizar");
            }
        } catch (error) {
            const message = getFirstErrorMessage(error.response.data);
            // console.log(message)
            setErrors(error.response.data);
            // toast.error(message);
        }
    };

    const updateMarkersList = (newMarker) => {
        // Verifica se o novo marcador já existe na lista pelo ID
        const isMarkerAlreadyExists = markers.some(
            (marker) => marker.id === newMarker.id,
        );

        // Se o marcador não existir, adicione-o à lista
        if (!isMarkerAlreadyExists) {
            setMarkers((prevMarkers) => [...prevMarkers, newMarker]);
        } else {
            // Se o marcador já existir, atualize a lista
            setMarkers((prevMarkers) =>
                prevMarkers.map((marker) =>
                    marker.id === newMarker.id ? newMarker : marker,
                ),
            );
        }
    };

    const handleDeleteMarker = async (id) => {
        try {
            Swal.fire({
                title: "Tem certeza?",
                text: "Você não poderá reverter isso!",
                icon: "warning",
                showCancelButton: true,
                confirmButtonColor: "#3085d6",
                cancelButtonColor: "#d33",
                confirmButtonText: "Sim, exclua!",
            }).then(async (result) => {
                if (result.isConfirmed) {
                    const response = await axios.delete(`/api/markers/${id}`);

                    if (response.status === 200 || response.status === 204) {
                        setMarkers((prevMarkers) =>
                            prevMarkers.filter((m) => m.id !== id),
                        );
                        toast.success("Deletado com sucesso!");
                        handleCloseModal();
                    } else {
                        throw new Error("Failed to delete marker");
                    }
                }
            });
        } catch (error) {
            toast.error(error.message);
        }
    };

    return (
        <>
            <Modal show={show} onHide={onHide} size="lg">
                <Modal.Header closeButton>
                    <Modal.Title>Gerenciar Marcadores - Atividades</Modal.Title>
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
                                <MarkerList
                                    markers={markers}
                                    onEdit={handleShowModal}
                                    onDelete={handleDeleteMarker}
                                />
                            </Col>
                        </Row>
                    </Container>
                    <MarkerConfigModal
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

export default MarkerManager;
