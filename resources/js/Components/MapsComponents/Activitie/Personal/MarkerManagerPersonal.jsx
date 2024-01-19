import React, { useState, useEffect } from "react";
import { Modal, Button, Container, Row, Col } from "react-bootstrap";
import MarkerConfigModalPersonal from "./MarkerConfigModalPersonal";
import MarkerList from "./MarkerListPersonal";
import "react-toastify/dist/ReactToastify.css";
// import axios from "axios";
import axios from "../../../axiosInstance";
import getFirstErrorMessage from "../../../processLaravelErrors";
import Swal from "sweetalert2";
import MarkerImportPersonalProduction from './MarkerImportPersonalProduction';

const MarkerManagerPersonal = ({ show, onHide , permission, markerInfo }) => {
    const [editedMarker, setEditedMarker] = useState(null);
    const [markers, setMarkers] = useState([]);
    const [configModalShow, setConfigModalShow] = useState(false);
    const [errors, setErrors] = useState({});
    const [importModalShow, setImportgModalShow] = useState(false);
    const [markersProduction, setMarkersProduction] = useState([]);

    useEffect(() => {
        // Function to fetch markers from the API
        const fetchMarkers = async () => {
          try {
            if (markerInfo?.label?.id) { // Check if markerInfo and label exist before accessing id
              const response = await axios.get(`/api/personalmarkersactivity/getallbymarker/${markerInfo.label.id}`);
              const data = response.data;
              setMarkers(data);
            }
          } catch (error) {
            console.error("Error fetching markers:", error);
          }
        };

        const fetchMarkersProduction = async () => {
          try {
            if (markerInfo?.name) { // Check if markerInfo and name exist before making the request
              const response = await axios.get(`/api/personalmarkersactivity/getAllproductionsbymarker/${markerInfo.name}`);
              const data = response.data;
              setMarkersProduction(data);
            }
          } catch (error) {
            console.error("Error fetching markers:", error);
          }
        };

        fetchMarkers();
        fetchMarkersProduction();
      }, [markerInfo]);


    const handleShowModal = (marker) => {
        setEditedMarker(marker);
        setConfigModalShow(true);
    };

    const handleCloseModal = () => {
        setEditedMarker(null);
        setConfigModalShow(false);
    };

    const handleShowModalImport = () => {
        setImportgModalShow(true);
    };

    const handleCloseModalImport = () => {
        setImportgModalShow(false);
    };

    const handleSaveMarker = async ({
        activity,
        unity,
        previouscount,
        lenPercent,
        icon,
    }) => {
        try {
            const formData = new FormData();
            formData.append("personalMarkerId", markerInfo.label.id);
            formData.append("activity", activity);
            formData.append("unity", unity);
            formData.append("previouscount", previouscount);
            formData.append("lenPercent", lenPercent);
            formData.append("icon", icon);

            const response = await axios.post(
                "/api/personalmarkersactivity",
                formData,
            );

            if (response.status === 200 || response.status === 201) {
                const data = response.data;
                updateMarkersList(data);
                toast.success("Atividade salva com sucesso");
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

    const handleUpdateMarker = async ({
        id,
        activity,
        unity,
        previouscount,
        lenPercent,
        icon,
    }) => {
        try {
            const formData = new FormData();
            formData.append("_method", "PUT");
            formData.append("personalMarkerId", markerInfo.label.id);
            formData.append("activity", activity);
            formData.append("unity", unity);
            formData.append("previouscount", previouscount);
            formData.append("lenPercent", lenPercent);

            if (icon instanceof File) {
                formData.append("icon", icon);
            }

            const response = await axios.post(
                `/api/personalmarkersactivity/${id}`,
                formData,
            );

            if (response.status === 200 || response.status === 201) {
                const data = response.data;
                updateMarkersList(data);
                toast.success("Atualizado com sucesso!");
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
                    const response = await axios.delete(
                        `/api/personalmarkersactivity/${id}`,
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
            {/* <Modal show={show} onHide={onHide} size="lg">
                <Modal.Header closeButton>
                    <Modal.Title>
                        Gerenciar Marcadores Personalizados - Atividades
                    </Modal.Title>
                </Modal.Header>
                <Modal.Body> */}
                <br />
                    <Container>
                        {permission && (
                        <Row className="mb-3">
                            <Col className="col-3 col-span-2">
                                <Button
                                    variant="primary"
                                    onClick={() => handleShowModal(null)}
                                >
                                    Adicionar Marcador
                                </Button>
                            </Col>
                            <Col>
                                <Button
                                    variant="primary"
                                    onClick={() => handleShowModalImport()}
                                >
                                    Importar Produção
                                </Button>
                            </Col>
                        </Row>
                        )}
                        <Row>
                            <Col>
                                <MarkerList
                                    markers={markers}
                                    onEdit={handleShowModal}
                                    onDelete={handleDeleteMarker}
                                    permission={permission}
                                    production={markersProduction}
                                    markerInfo={markerInfo}
                                />
                            </Col>
                        </Row>
                    </Container>
                    <MarkerConfigModalPersonal
                        show={configModalShow}
                        onHide={handleCloseModal}
                        onSave={handleSaveMarker}
                        onUpdate={handleUpdateMarker}
                        editedMarker={editedMarker}
                        errors={errors}
                    />
                    <MarkerImportPersonalProduction
                        show={importModalShow}
                        onHide={handleCloseModalImport}/>
                {/* </Modal.Body>
                <ToastContainer />
            </Modal> */}
        </>
    );
};

export default MarkerManagerPersonal;
