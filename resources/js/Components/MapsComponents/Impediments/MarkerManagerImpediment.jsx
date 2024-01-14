import React, { useState, useEffect } from "react";
import { Modal, Button, Container, Row, Col } from "react-bootstrap";
import MarkerConfigImpedimentModal from "./MarkerConfigImpedimentModal";
import MarkerListImpediment from "./MarkerListImpediment";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
// import axios from "axios";
import axios from "../../../Components/axiosInstance";
import getFirstErrorMessage from "../../processLaravelErrors";
import Swal from "sweetalert2";

const MarkerManagerImpediment = ({ show, onHide }) => {
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
            setErrors({});
            setConfigModalShow(false);
        } catch (error) {
            const message = getFirstErrorMessage(error.response.data);
            // console.log(message)
            setErrors(error.response.data);
            // toast.error(message);
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
                setErrors({});
                setConfigModalShow(false);
            } else {
                toast.error(response.statusText);
                throw new Error("Erro ao atualizar o marcador");
            }
        } catch (error) {
            const message = getFirstErrorMessage(error.response.data);
            // console.log(message)
            setErrors(error.response.data);
            // toast.error(message);
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
                    const response = await axios.delete(
                        `/api/markersimpediments/${id}`,
                    );

                    if (response.status === 200 || response.status === 204) {
                        setMarkers((prevMarkers) =>
                            prevMarkers.filter((m) => m.id !== id),
                        );
                        toast.success("Excluído com sucesso!");

                        Swal.fire({
                            title: "Excluído!",
                            text: "Seu registro foi excluído.",
                            icon: "success",
                        });
                        // handleCloseModal();
                    } else {
                        throw new Error("Falha ao excluir");
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
                        errors={errors}
                    />
                </Modal.Body>
                <ToastContainer />
            </Modal>
        </>
    );
};

export default MarkerManagerImpediment;
