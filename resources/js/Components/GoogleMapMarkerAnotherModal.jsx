import React, { useState, useEffect } from "react";
import {
    Modal,
    Table,
    Tabs,
    Tab,
    Pagination,
    Button,
    Row,
    Col,
    Container,
} from "react-bootstrap";
import Gallery from "react-image-gallery";
import "react-image-gallery/styles/css/image-gallery.css";
// import axios from "axios";
import axios from "../Components/axiosInstance";
import ImageUploadButton from "./ImageUploadButton";
import "../Components/css/uploadImages.css";
import Swal from "sweetalert2";
import getPermissionsFromLocalStorage from "../Components/Functions/getPermissionsFromLocalStorage";
import MarkerManagerPersonal from "../Components/MapsComponents/Activitie/Personal/MarkerManagerPersonal";

const GoogleMapMarkerAnotherModal = ({ markerInfo, onClose }) => {
    const [towerImages, setTowerImages] = useState([]);
    const [towerProduction, setTowerProduction] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState("info");
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage] = useState(5);
    const [currentImageIndex, setCurrentImageIndex] = useState(0);
    const [permission, setPermission] = useState(false);

    useEffect(() => {
        if (markerInfo) {
            setPermission(getPermissionsFromLocalStorage("isWriter"));
        }
    }, [markerInfo]);

    useEffect(() => {
        if (markerInfo) {
            fetchTowerImages();
        }
    }, [markerInfo]);

    const fetchTowerImages = async () => {
        try {
            const response = await axios.get(
                `/api/get-towerimages/${markerInfo.name}`,
            );
            setTowerImages(response.data.files);
            setLoading(false);
        } catch (error) {
            console.error("Error fetching tower images:", error);
        }
    };

    const images = towerImages.map((image) => ({
        original: image,
        thumbnail: image,
    }));

    const handleTabSelect = (tab) => {
        setActiveTab(tab);
        fetchTowerImages();
    };

    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentItems = towerProduction.slice(
        indexOfFirstItem,
        indexOfLastItem,
    );

    const paginate = (pageNumber) => setCurrentPage(pageNumber);

    const handleImageUpload = async (files) => {
        try {
            const formData = new FormData();
            formData.append("towerId", markerInfo.name);

            for (const file of files) {
                formData.append("images[]", file);
            }

            await axios.post("/api/upload-images", formData);

            // Atualize a lista de imagens após o upload
            fetchTowerImages();
        } catch (error) {
            console.error("Error uploading images:", error);
        }
    };

    const handleImageDelete = () => {
        const updatedImages = [...towerImages];

        Swal.fire({
            title: "Você tem certeza?",
            text: "Você não poderá reverter isso!",
            icon: "warning",
            showCancelButton: true,
            confirmButtonColor: "#3085d6",
            cancelButtonColor: "#d33",
            confirmButtonText: "Sim, exclua-o!",
        }).then((result) => {
            if (result.isConfirmed) {
                // Obtenha a imagem atual que está sendo visualizada
                const imageUrlToDelete = updatedImages[currentImageIndex];
                axios
                    .post("/api/delete-gallery-image-all", {
                        image_url: imageUrlToDelete,
                    })
                    .then((response) => {
                        if (response.status === 200) {
                            // Remova a imagem excluída da lista
                            updatedImages.splice(currentImageIndex, 1);
                            setTowerImages(updatedImages);

                            Swal.fire({
                                title: "Excluída!",
                                text: response.data.message,
                                icon: "success",
                            });

                            // Verifique se a imagem atual não existe mais na lista
                            if (currentImageIndex >= updatedImages.length) {
                                setCurrentImageIndex(
                                    Math.max(updatedImages.length - 1, 0),
                                );
                            }
                        } else {
                            Swal.fire({
                                title: "Erro!",
                                text: response.data.message,
                                icon: "error",
                            });
                        }
                    })
                    .catch((error) => {
                        console.error("Erro ao excluir imagem:", error);
                        Swal.fire({
                            title: "Erro!",
                            text: "Ocorreu um erro ao excluir o arquivo.",
                            icon: "error",
                        });
                    });
            }
        });
    };

    return (
        <Modal show={markerInfo !== null} onHide={onClose} size="xl">
            <Modal.Header closeButton>
                <Modal.Title>
                    {markerInfo ? markerInfo.label.text : ""}
                </Modal.Title>
            </Modal.Header>
            <Modal.Body>
                {markerInfo ? (
                    <div>
                        <Tabs activeKey={activeTab} onSelect={handleTabSelect}>
                            <Tab eventKey="info" title="Info">
                                <br />
                                <h5>Dados da Básicos</h5>
                                <Table striped bordered hover>
                                    <thead>
                                        <tr>
                                            <th>Nome</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        <tr>
                                            <td>{markerInfo.name}</td>
                                        </tr>
                                    </tbody>
                                </Table>

                                <h5>Posição da UTM</h5>
                                <Table striped bordered hover>
                                    <thead>
                                        <tr>
                                            <th>X</th>
                                            <th>Y</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        <tr>
                                            <td>{markerInfo.position.utmx}</td>
                                            <td>{markerInfo.position.utmy}</td>
                                        </tr>
                                    </tbody>
                                </Table>
                            </Tab>

                            <Tab eventKey="production" title="Produção">
                                <MarkerManagerPersonal
                                    show={true}
                                    onHide={() => {}}
                                    permission={permission}
                                    markerInfo={markerInfo}
                                />
                            </Tab>

                            <Tab eventKey="gallery" title="Galeria">
                                {loading ? (
                                    <p>Loading images...</p>
                                ) : (
                                    <>
                                        {images.length > 0 && (
                                            <div>
                                                <Gallery
                                                    items={images}
                                                    onSlide={(currentIndex) =>
                                                        setCurrentImageIndex(
                                                            currentIndex,
                                                        )
                                                    }
                                                />
                                                <div>
                                                    <button
                                                        onClick={
                                                            handleImageDelete
                                                        }
                                                        className="btn btn-danger"
                                                        style={{
                                                            marginTop: "10px",
                                                        }}
                                                    >
                                                        Deletar imagem
                                                    </button>
                                                </div>
                                                <hr />
                                            </div>
                                        )}
                                        <hr />
                                        {/* Botão de upload */}
                                        {/* <Container>
                                            <Row>
                                                <Col className="text-right">
                                                    <ImageUploadButton
                                                        onUpload={
                                                            handleImageUpload
                                                        }
                                                    />
                                                </Col>
                                            </Row>
                                        </Container> */}
                                    </>
                                )}
                            </Tab>
                        </Tabs>
                    </div>
                ) : null}
            </Modal.Body>
            <Modal.Footer>{/* ... (Footer content) */}</Modal.Footer>
        </Modal>
    );
};

export default GoogleMapMarkerAnotherModal;
