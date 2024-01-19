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
import axios from "./axiosInstance";
import ImageUploadButton from "./ImageUploadButton";
import "../Components/css/uploadImages.css";
import Swal from "sweetalert2";

const GaleryImagesFromPersonal = ({ markerInfo, towerProduction, show, onClose }) => {
    const [towerImages, setTowerImages] = useState([]);
    const [loading, setLoading] = useState(true);
    const [currentImageIndex, setCurrentImageIndex] = useState(0);

    useEffect(() => {
        if (markerInfo && towerProduction) {
            fetchTowerImages();
        }
    }, [markerInfo, towerProduction]);

    const fetchTowerImages = async () => {
        try {
            const response = await axios.get(
                `/api/get-towerimages-with-activity/${markerInfo.name}/${towerProduction.id}`,
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


    const handleImageUpload = async (files) => {
        try {
            const formData = new FormData();
            formData.append("towerId", markerInfo.name);
            formData.append("activityId", towerProduction.id);

            for (const file of files) {
                formData.append("images[]", file);
            }

            await axios.post("/api/upload-images-with-activity", formData);

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
                    .post("/api/delete-gallery-image-with-activity", {
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
                                    Math.max(updatedImages.length - 1, 0)
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
        <Modal show={show} onHide={onClose} size="lg">
            <Modal.Header closeButton>
                <Modal.Title>
                    {markerInfo
                        ? markerInfo.label.text +
                          " - " +
                          towerProduction.activity
                        : ""}
                </Modal.Title>
            </Modal.Header>
            <Modal.Body>
                    <div>
                    {loading ? (
                        <p>Loading tower images...</p>
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
                            <Container>
                                <Row>
                                    <Col className="text-right">
                                        <ImageUploadButton
                                            onUpload={
                                                handleImageUpload
                                            }
                                        />
                                    </Col>
                                </Row>
                            </Container>
                        </>
                    )}
                    </div>
            </Modal.Body>
            <Modal.Footer>{/* ... (Footer content) */}</Modal.Footer>
        </Modal>
    );
};

export default GaleryImagesFromPersonal;
