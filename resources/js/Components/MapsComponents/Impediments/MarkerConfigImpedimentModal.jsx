import React, { useState, useEffect } from "react";
import { Modal, Button, Form, Dropdown } from "react-bootstrap";

const MarkerConfigImpedimentModal = ({
    show,
    onHide,
    onSave,
    onUpdate,
    editedMarker,
}) => {
    const [id, setImpedimentId] = useState("");
    const [impedimentType, setImpedimentType] = useState("");
    const [status, setStatus] = useState("");
    const [isBlocked, setIsBlocked] = useState("");
    const [icon, setIcon] = useState("");

    useEffect(() => {
        if (editedMarker) {
            setImpedimentId(editedMarker.id || "");
            setImpedimentType(editedMarker.ImpedimentType || "");
            setStatus(editedMarker.Status || "");
            setIcon(editedMarker.Icon || "");
            setIsBlocked(editedMarker.IsBlocked || "");
        } else {
            setImpedimentId("");
            setImpedimentType("");
            setStatus("");
            setIcon("");
            setIsBlocked(0);
        }
    }, [editedMarker, show]);

    const handleSave = () => {
        if (editedMarker) {
            onUpdate({ id, impedimentType, status, icon, isBlocked });
        } else {
            onSave({ impedimentType, status, icon, isBlocked });
        }
        onHide();
    };

    return (
        <Modal show={show} onHide={onHide}>
            <Modal.Header closeButton>
                <Modal.Title>
                    {editedMarker ? "Editar" : "Adicionar"} Marcador
                </Modal.Title>
            </Modal.Header>
            <Modal.Body>
                <Form>
                    <Form.Group controlId="formiImpedimentType">
                        <Form.Label>Tipo de Impedimento</Form.Label>
                        <Dropdown>
                            <Dropdown.Toggle
                                variant="success"
                                id="dropdown-unidade"
                            >
                                {impedimentType
                                    ? impedimentType
                                    : "Selecione o tipo de impedimento"}
                            </Dropdown.Toggle>

                            <Dropdown.Menu>
                                <Dropdown.Item
                                    onClick={() =>
                                        setImpedimentType("Fundiário")
                                    }
                                >
                                    Fundiário
                                </Dropdown.Item>
                                <Dropdown.Item
                                    onClick={() =>
                                        setImpedimentType("Arqueologia")
                                    }
                                >
                                    Arqueologia
                                </Dropdown.Item>
                                <Dropdown.Item
                                    onClick={() => setImpedimentType("Projeto")}
                                >
                                    Projeto
                                </Dropdown.Item>
                            </Dropdown.Menu>
                        </Dropdown>
                    </Form.Group>

                    <Form.Group controlId="formiImpedimentType">
                        <Form.Label>Status do impedimento</Form.Label>
                        <Dropdown>
                            <Dropdown.Toggle
                                variant="success"
                                id="dropdown-unidade"
                            >
                                {status
                                    ? status
                                    : "Selecione o status do impedimento"}
                            </Dropdown.Toggle>

                            <Dropdown.Menu>
                                <Dropdown.Item
                                    onClick={() => setStatus("Liberado")}
                                >
                                    Liberado
                                </Dropdown.Item>
                                <Dropdown.Item
                                    onClick={() => setStatus("Em Negociação")}
                                >
                                    Em Negociação
                                </Dropdown.Item>
                                <Dropdown.Item
                                    onClick={() => setStatus("Judicial")}
                                >
                                    Judicial
                                </Dropdown.Item>
                                <Dropdown.Item
                                    onClick={() => setStatus("Á Prospectar")}
                                >
                                    Á Prospectar
                                </Dropdown.Item>
                                <Dropdown.Item
                                    onClick={() =>
                                        setStatus("Sitio Arqueologico")
                                    }
                                >
                                    Sitio Arqueologico
                                </Dropdown.Item>
                                <Dropdown.Item
                                    onClick={() => setStatus("Não Liberado")}
                                >
                                    Não Liberrado
                                </Dropdown.Item>
                            </Dropdown.Menu>
                        </Dropdown>
                    </Form.Group>

                    <Form.Group controlId="formCustomIcon">
                        <Form.Label>Ícone Personalizado</Form.Label>
                        <Form.Control
                            type="file"
                            name="icon"
                            accept=".png, .jpg, .jpeg, .gif"
                            onChange={(e) => setIcon(e.target.files[0])}
                        />
                    </Form.Group>

                    <Form.Group controlId="formIsBlocked">
                        <Form.Label>Impede atividades na estrutura?</Form.Label>
                        <Dropdown>
                            <Dropdown.Toggle
                                variant="success"
                                id="dropdown-unidade"
                            >
                                {isBlocked ? isBlocked : "Selecione"}
                            </Dropdown.Toggle>

                            <Dropdown.Menu>
                                <Dropdown.Item
                                    onClick={() => setIsBlocked("Não")}
                                >
                                    Não
                                </Dropdown.Item>
                                <Dropdown.Item
                                    onClick={() => setIsBlocked("Sim")}
                                >
                                    Sim
                                </Dropdown.Item>
                            </Dropdown.Menu>
                        </Dropdown>
                    </Form.Group>
                </Form>
            </Modal.Body>
            <Modal.Footer>
                <Button variant="secondary" onClick={onHide}>
                    Fechar
                </Button>
                <Button variant="primary" onClick={handleSave}>
                    Salvar
                </Button>
            </Modal.Footer>
        </Modal>
    );
};

export default MarkerConfigImpedimentModal;
