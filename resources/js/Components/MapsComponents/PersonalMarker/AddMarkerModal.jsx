import React, { useState } from "react";
import { Modal, Button, Form } from "react-bootstrap";

const AddMarkerModal = ({ show, handleClose }) => {
    const [markerName, setMarkerName] = useState("");
    const [coordinateX, setCoordinateX] = useState("");
    const [coordinateY, setCoordinateY] = useState("");
    const [selectedType, setSelectedType] = useState("");
    const [iconFile, setIconFile] = useState(null);

    const handleSubmit = async () => {
        const formData = new FormData();
        formData.append("name", markerName);
        formData.append("coordinateX", coordinateX);
        formData.append("coordinateY", coordinateY);
        formData.append("type", selectedType);

        if (iconFile) {
            formData.append("icon", iconFile);
        }

        try {
            const response = await fetch("YOUR_API_ENDPOINT", {
                method: "POST",
                body: formData,
            });

            if (response.ok) {
                console.log("Marker data submitted successfully");
                handleClose();
            } else {
                console.error("Submission failed");
            }
        } catch (error) {
            console.error("Error during submission:", error);
        }
    };

    return (
        <Modal show={show} onHide={handleClose}>
            <Modal.Header closeButton>
                <Modal.Title>Criar novo Marcador</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                <Form>
                    <Form.Group>
                        <Form.Label>Nome</Form.Label>
                        <Form.Control
                            type="text"
                            placeholder="Nome do marcador"
                            value={markerName}
                            onChange={(e) => setMarkerName(e.target.value)}
                        />
                    </Form.Group>
                    <hr />
                    <Form.Group>
                        <Form.Label>Coordenada [X]</Form.Label>
                        <Form.Control
                            type="text"
                            placeholder="Coordenada [X]"
                            value={coordinateX}
                            onChange={(e) => setCoordinateX(e.target.value)}
                        />
                    </Form.Group>
                    <Form.Group>
                        <Form.Label>Coordenada [Y]</Form.Label>
                        <Form.Control
                            type="text"
                            placeholder="Coordenada [Y]"
                            value={coordinateY}
                            onChange={(e) => setCoordinateY(e.target.value)}
                        />
                    </Form.Group>
                    <hr />
                    <Form.Group>
                        <Form.Label>Tipo</Form.Label>
                        <Form.Control
                            as="select"
                            value={selectedType}
                            onChange={(e) => setSelectedType(e.target.value)}
                        >
                            <option value="">Selecione</option>
                            <option value="1">Marker de Controle</option>
                            <option value="2">Marker Normal</option>
                        </Form.Control>
                    </Form.Group>
                    <hr />
                    <Form.Group>
                        <Form.Label>Icone</Form.Label>
                        <Form.Control
                            type="file"
                            onChange={(e) => setIconFile(e.target.files[0])}
                        />
                    </Form.Group>
                </Form>
            </Modal.Body>
            <Modal.Footer>
                <Button variant="primary" onClick={handleSubmit}>
                    Salvar
                </Button>
            </Modal.Footer>
        </Modal>
    );
};

export default AddMarkerModal;
