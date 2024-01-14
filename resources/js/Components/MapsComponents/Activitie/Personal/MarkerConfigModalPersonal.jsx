import React, { useState, useEffect } from "react";
import { Modal, Button, Form, Dropdown } from "react-bootstrap";

const MarkerConfigModalPersonal = ({
    show,
    onHide,
    onSave,
    onUpdate,
    editedMarker,
    errors,
}) => {
    const [id, setId] = useState("");
    const [activity, setActivity] = useState("");
    const [previouscount, setPreviouscount] = useState("");
    const [lenPercent, setLenPercent] = useState("");
    const [icon, setIcon] = useState("");
    const [selectedUnity, setSelectedUnity] = useState(
        editedMarker ? editedMarker.unity || "" : "",
    );

    useEffect(() => {
        if (editedMarker) {
            setId(editedMarker.id || "");
            setActivity(editedMarker.activity || "");
            setSelectedUnity(editedMarker.unity || "");
            setPreviouscount(editedMarker.previouscount || "");
            setLenPercent(editedMarker.lenPercent || "");
            setIcon(editedMarker.icon || "");
        } else {
            setId("");
            setActivity("");
            setSelectedUnity("");
            setPreviouscount("");
            setLenPercent("");
            setIcon("");
        }
    }, [editedMarker, show]);

    const handleSave = () => {
        if (editedMarker) {
            // Se estiver editando, envie o ID
            onUpdate({
                id,
                activity,
                unity: selectedUnity,
                previouscount,
                lenPercent,
                icon,
            });
        } else {
            onSave({
                activity,
                unity: selectedUnity,
                previouscount,
                lenPercent,
                icon,
            });
        }
        if (!errors) {
            onHide();
        }
    };

    return (
        <Modal show={show} onHide={onHide}>
            <Modal.Header closeButton>
                <Modal.Title>
                    {editedMarker ? "Editar" : "Adicionar"} Atividade
                </Modal.Title>
            </Modal.Header>
            <Modal.Body>
                <Form>
                    <Form.Group controlId="formActivity">
                        <Form.Label>Nome da Atividade</Form.Label>
                        <Form.Control
                            type="text"
                            name="activity"
                            placeholder="Nome da Atividade"
                            value={activity}
                            onChange={(e) => setActivity(e.target.value)}
                            className={
                                errors &&
                                errors.error &&
                                errors.error.activity !== undefined
                                    ? "is-invalid"
                                    : "is-valid"
                            }
                        />
                        {errors &&
                        errors.error &&
                        errors.error.activity !== undefined ? (
                            <div className="invalid-feedback">
                                {errors.error.activity}
                            </div>
                        ) : (
                            <></>
                        )}
                    </Form.Group>

                    <Form.Group controlId="formUnity">
                        <Form.Label>Unidade</Form.Label>
                        <Dropdown>
                            <Dropdown.Toggle
                                variant="success"
                                id="dropdown-unity"
                                className={
                                    errors &&
                                    errors.error &&
                                    errors.error.unity !== undefined
                                        ? "is-invalid"
                                        : "is-valid"
                                }
                            >
                                {selectedUnity
                                    ? selectedUnity
                                    : "Selecione Unidade"}
                            </Dropdown.Toggle>

                            <Dropdown.Menu>
                                <Dropdown.Item
                                    onClick={() => setSelectedUnity("Km")}
                                >
                                    Km
                                </Dropdown.Item>
                                <Dropdown.Item
                                    onClick={() => setSelectedUnity("M")}
                                >
                                    M
                                </Dropdown.Item>
                                <Dropdown.Item
                                    onClick={() => setSelectedUnity("M2")}
                                >
                                    M2
                                </Dropdown.Item>
                                <Dropdown.Item
                                    onClick={() => setSelectedUnity("M3")}
                                >
                                    M3
                                </Dropdown.Item>
                                <Dropdown.Item
                                    onClick={() => setSelectedUnity("KG")}
                                >
                                    KG
                                </Dropdown.Item>
                                <Dropdown.Item
                                    onClick={() => setSelectedUnity("TON")}
                                >
                                    TON
                                </Dropdown.Item>
                            </Dropdown.Menu>
                            {errors &&
                            errors.error &&
                            errors.error.unity !== undefined ? (
                                <div className="invalid-feedback">
                                    {errors.error.unity}
                                </div>
                            ) : (
                                <></>
                            )}
                        </Dropdown>
                    </Form.Group>

                    <Form.Group controlId="formActivity">
                        <Form.Label>Quantidade (Prevista)</Form.Label>
                        <Form.Control
                            type="text"
                            name="previouscount"
                            placeholder="Quantidade (Prevista)"
                            value={previouscount}
                            onChange={(e) => setPreviouscount(e.target.value)}
                            className={
                                errors &&
                                errors.error &&
                                errors.error.previouscount !== undefined
                                    ? "is-invalid"
                                    : "is-valid"
                            }
                        />
                        {errors &&
                        errors.error &&
                        errors.error.previouscount !== undefined ? (
                            <div className="invalid-feedback">
                                {errors.error.previouscount}
                            </div>
                        ) : (
                            <></>
                        )}
                    </Form.Group>

                    <Form.Group controlId="formActivity">
                        <Form.Label>%Avanço da Atividade</Form.Label>
                        <Form.Control
                            type="text"
                            name="lenPercent"
                            placeholder="%Avanço da Atividade"
                            value={lenPercent}
                            onChange={(e) => setLenPercent(e.target.value)}
                            className={
                                errors &&
                                errors.error &&
                                errors.error.lenPercent !== undefined
                                    ? "is-invalid"
                                    : "is-valid"
                            }
                        />
                        {errors &&
                        errors.error &&
                        errors.error.lenPercent !== undefined ? (
                            <div className="invalid-feedback">
                                {errors.error.lenPercent}
                            </div>
                        ) : (
                            <></>
                        )}
                    </Form.Group>

                    <Form.Group controlId="formCustomIcon">
                        <Form.Label>Ícone Personalizado</Form.Label>
                        <Form.Control
                            type="file"
                            name="icon"
                            accept=".png, .jpg, .jpeg, .gif"
                            onChange={(e) => setIcon(e.target.files[0])}
                            className={
                                errors &&
                                errors.error &&
                                errors.error.icon !== undefined
                                    ? "is-invalid"
                                    : "is-valid"
                            }
                        />
                        {errors &&
                        errors.error &&
                        errors.error.icon !== undefined ? (
                            <div className="invalid-feedback">
                                {errors.error.icon}
                            </div>
                        ) : (
                            <></>
                        )}
                    </Form.Group>
                </Form>
            </Modal.Body>
            <Modal.Footer>
                {/* <Button variant="secondary" onClick={onHide}>
                    Close
                </Button> */}
                <Button variant="primary" onClick={handleSave}>
                    Salvar
                </Button>
            </Modal.Footer>
        </Modal>
    );
};

export default MarkerConfigModalPersonal;
