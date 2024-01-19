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
import GaleryImagesFromTower from '../Components/GaleryImagesFromTower';
import toTitleCase from './Functions/toTitle';

const GoogleMapMarkerModal = ({ markerInfo, onClose }) => {
    const [towerImages, setTowerImages] = useState([]);
    const [towerProduction, setTowerProduction] = useState([]);
    const [towerAVC, setTowerAVC] = useState(0);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState("info");
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage] = useState(5);
    const [currentImageIndex, setCurrentImageIndex] = useState(0);
    const [showModal, setShowModal] = useState(false);
    const [selectedAcitivity, setSelectedAcitivity] = useState({});

    useEffect(() => {
        if (markerInfo) {
            fetchTowerImages();
            fetchTowerProduction();
            fetchTowerAVC();
        }
    }, [markerInfo]);

    const fetchTowerImages = async () => {
        try {
            const response = await axios.get(
                `/api/get-towerimages/${markerInfo.label.towerId}`,
            );
            setTowerImages(response.data.files);
            setLoading(false);
        } catch (error) {
            console.error("Error fetching tower images:", error);
        }
    };

    const fetchTowerProduction = async () => {
        try {
            const response = await axios.get(
                `/api/get-towerproduction/${markerInfo.label.towerId}/${markerInfo.label.project}`,
            );
            setTowerProduction(response.data);
        } catch (error) {
            console.error("Error fetching tower production:", error);
        }
    };

    const fetchTowerAVC = async () => {
        try {
            const response = await axios.get(
                `/api/get-avc/${markerInfo.label.towerId}/${markerInfo.label.project}`,
            );
            setTowerAVC(response.data);
        } catch (error) {
            console.error("Error fetching tower production:", error);
        }
    };

    const images = towerImages.map((image) => ({
        original: image,
        thumbnail: image,
    }));

    const formattedPercentage = towerAVC.toLocaleString(undefined, {
        style: "percent",
        minimumFractionDigits: 2,
    });

    const handleTabSelect = (tab) => {
        setActiveTab(tab);
    };

    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentItems = towerProduction.slice(
        indexOfFirstItem,
        indexOfLastItem,
    );

    const handleShowModal = (activity) => {
        setSelectedAcitivity(activity)
        setShowModal(true);
    }

    const handleCloseModal = () => {
        setShowModal(false);
    }

    const paginate = (pageNumber) => setCurrentPage(pageNumber);

    const handleImageUpload = async (files) => {
        try {
            const formData = new FormData();
            formData.append("towerId", markerInfo.label.towerId);

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
        <Modal show={markerInfo !== null} onHide={onClose} size="lg">
            <Modal.Header closeButton>
                <Modal.Title>
                    {markerInfo
                        ? markerInfo.label.text +
                          " - " +
                          markerInfo.label.project
                        : ""}
                </Modal.Title>
            </Modal.Header>
            <Modal.Body>
                {markerInfo ? (
                    <div>
                        <Tabs activeKey={activeTab} onSelect={handleTabSelect}>
                            <Tab eventKey="info" title="Info">
                                <br />
                                <h5>Dados da Estrutura</h5>
                                <Table striped bordered hover>
                                    <thead>
                                        <tr>
                                            <th>LT - Trecho</th>
                                            <th>Número</th>
                                            <th>Nome</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        <tr>
                                            <td>{markerInfo.label.project}</td>
                                            <td>
                                                {markerInfo.label.oringalNumber}
                                            </td>
                                            <td>
                                                {markerInfo.label.originalName}
                                            </td>
                                        </tr>
                                    </tbody>
                                </Table>
                                <h5>Impedimentos</h5>
                                <Table striped bordered hover>
                                    <thead>
                                        <tr>
                                            <th>Tipo de Impedimento</th>
                                            <th>Status</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {markerInfo.Impediments.map(
                                            (impediment, index) => (
                                                <tr key={index}>
                                                    <td>
                                                        {
                                                            impediment.ImpedimentType
                                                        }
                                                    </td>
                                                    <td>{impediment.Status}</td>
                                                </tr>
                                            ),
                                        )}
                                    </tbody>
                                </Table>
                                <h5>Recebimento</h5>
                                <Table striped bordered hover>
                                    <thead>
                                        <tr>
                                            <th>Data Solicitação</th>
                                            <th>Data Recebimento</th>
                                            <th>
                                                Data Prevista Recebimento
                                                Fornecedor
                                            </th>
                                            <th>Status</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        <tr>
                                            <td>
                                                {markerInfo.SolicitationDate}
                                            </td>
                                            <td>{markerInfo.ReceiveDate}</td>
                                            <td>
                                                {markerInfo.PreviousReceiveDate}
                                            </td>
                                            <td>{markerInfo.ReceiveStatus}</td>
                                        </tr>
                                    </tbody>
                                </Table>
                                <h5>Posição da Estrutura</h5>
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
                                <div>
                                    <Table striped bordered hover>
                                        <thead>
                                            <tr>
                                                <th>
                                                    %Avanço na estrutura :{" "}
                                                    {formattedPercentage}
                                                </th>
                                            </tr>
                                        </thead>
                                        <tbody></tbody>
                                    </Table>
                                    <Table striped bordered hover>
                                        <thead>
                                            <tr>
                                                <th>Atividade</th>
                                                <th>Icone</th>
                                                <th>Data de execução</th>
                                                <th>Ações</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {currentItems.map(
                                                (tower, index) => (
                                                    <tr key={index}>
                                                        <td>
                                                            {toTitleCase(tower.activitie)}
                                                        </td>
                                                        <td>
                                                            <img
                                                                src={tower.icon}
                                                                alt={
                                                                    tower.activitie
                                                                }
                                                                width={30}
                                                                height={30}
                                                            />
                                                        </td>
                                                        <td>{tower.date}</td>
                                                        <td>
                                                        <Button variant="primary" onClick={() => handleShowModal(tower)} >
                                                            Ver / Anexar Imagem
                                                        </Button>
                                                        </td>
                                                    </tr>
                                                ),
                                            )}
                                        </tbody>
                                    </Table>
                                    <Pagination>
                                        {Array.from({
                                            length: Math.ceil(
                                                towerProduction.length /
                                                    itemsPerPage,
                                            ),
                                        }).map((_, index) => (
                                            <Pagination.Item
                                                key={index}
                                                active={
                                                    index + 1 === currentPage
                                                }
                                                onClick={() =>
                                                    paginate(index + 1)
                                                }
                                            >
                                                {index + 1}
                                            </Pagination.Item>
                                        ))}
                                    </Pagination>
                                </div>
                            </Tab>

                            <Tab eventKey="gallery" title="Galeria">
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
                                                {/* <hr /> */}
                                            </div>
                                        )}
                                        {/* <hr /> */}
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
            <GaleryImagesFromTower markerInfo={markerInfo} towerProduction={selectedAcitivity} show={showModal} onClose={handleCloseModal}/>
            <Modal.Footer>{/* ... (Footer content) */}</Modal.Footer>
        </Modal>
    );
};

export default GoogleMapMarkerModal;
