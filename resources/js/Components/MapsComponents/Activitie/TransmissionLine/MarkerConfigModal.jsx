import React, { useState, useEffect } from "react";
import { Modal, Button, Form, Dropdown } from "react-bootstrap";
import ImageUploadButton from "../../../ImageUploadButton";

const MarkerConfigModal = ({
    show,
    onHide,
    onSave,
    onUpdate,
    editedMarker,
    errors,
}) => {
    const [id, setAtividadeId] = useState("");
    const [atividade, setAtividade] = useState("");
    const [icone, setIcone] = useState("");
    const [selectedMarker, setSelectedMarker] = useState("");
    const [selectedUnidade, setSelectedUnidade] = useState(
        editedMarker ? editedMarker.unidade || "" : "",
    );
    const [googleIcons] = useState([
        /* Adicione aqui os ícones do Google */
    ]);

    useEffect(() => {
        if (editedMarker) {
            setAtividadeId(editedMarker.id || "");
            setAtividade(editedMarker.atividade || "");
            setIcone(editedMarker.icone || "");
            setSelectedMarker(editedMarker.selectedMarker || "");
            setSelectedUnidade(editedMarker.unidade || "");
        } else {
            setAtividade("");
            setIcone("");
            setSelectedMarker("");
        }
    }, [editedMarker, show]);

    const handleSave = () => {
        if (editedMarker) {
            onUpdate({ id, atividade, icone, unidade: selectedUnidade });
        } else {
            onSave({ atividade, icone, unidade: selectedUnidade });
        }
        if (!errors) {
            onHide();
        }
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
                    <Form.Group controlId="formAtividade">
                        <Form.Label>Nome da Atividade</Form.Label>
                        <Form.Control
                            type="text"
                            name="atividade"
                            placeholder="Digite a atividade"
                            value={atividade}
                            onChange={(e) => setAtividade(e.target.value)}
                            className={
                                errors &&
                                errors.error &&
                                errors.error.atividade !== undefined
                                    ? "is-invalid"
                                    : "is-valid"
                            }
                        />
                        {errors &&
                        errors.error &&
                        errors.error.atividade !== undefined ? (
                            <div className="invalid-feedback">
                                {errors.error.atividade}
                            </div>
                        ) : (
                            <></>
                        )}
                    </Form.Group>

                    <Form.Group controlId="formUnidade">
                        <Form.Label>Unidade</Form.Label>
                        <Dropdown>
                            <Dropdown.Toggle
                                variant="success"
                                id="dropdown-unidade"
                                className={
                                    errors &&
                                    errors.error &&
                                    errors.error.unidade !== undefined
                                        ? "is-invalid"
                                        : "is-valid"
                                }
                            >
                                {selectedUnidade
                                    ? selectedUnidade
                                    : "Selecione a unidade"}
                            </Dropdown.Toggle>

                            <Dropdown.Menu>
                                <Dropdown.Item
                                    onClick={() => setSelectedUnidade("Torre")}
                                >
                                    Torre
                                </Dropdown.Item>
                                <Dropdown.Item
                                    onClick={() => setSelectedUnidade("Km")}
                                >
                                    Km
                                </Dropdown.Item>
                            </Dropdown.Menu>
                            {errors &&
                            errors.error &&
                            errors.error.unidade !== undefined ? (
                                <div className="invalid-feedback">
                                    {errors.error.unidade}
                                </div>
                            ) : (
                                <></>
                            )}
                        </Dropdown>
                    </Form.Group>

                    <Form.Group controlId="formCustomIcon">
                        <Form.Label>Ícone Personalizado</Form.Label>
                        <Form.Control
                            type="file"
                            name="icone"
                            accept=".png, .jpg, .jpeg, .gif"
                            onChange={(e) => setIcone(e.target.files[0])}
                            className={
                                errors &&
                                errors.error &&
                                errors.error.icone !== undefined
                                    ? "is-invalid"
                                    : "is-valid"
                            }
                        />
                        {errors &&
                        errors.error &&
                        errors.error.icone !== undefined ? (
                            <div className="invalid-feedback">
                                {errors.error.icone}
                            </div>
                        ) : (
                            <></>
                        )}
                    </Form.Group>

                    {selectedMarker === "google-marker" && (
                        <Form.Group controlId="formGoogleIcons">
                            <Form.Label>
                                Selecione um ícone do Google
                            </Form.Label>
                            <Dropdown>
                                <Dropdown.Toggle
                                    variant="success"
                                    id="dropdown-google-icons"
                                >
                                    {icone ? icone : "Selecione um ícone"}
                                </Dropdown.Toggle>

                                <Dropdown.Menu>
                                    {googleIcons.map((googleIcon, index) => (
                                        <Dropdown.Item
                                            key={index}
                                            onClick={() => setIcone(googleIcon)}
                                        >
                                            {googleIcon.name}
                                        </Dropdown.Item>
                                    ))}
                                </Dropdown.Menu>
                            </Dropdown>
                        </Form.Group>
                    )}
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

export default MarkerConfigModal;
