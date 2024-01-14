import React, { useState, useEffect } from "react";
import { Modal, Button, Form, Dropdown } from "react-bootstrap";

const PersonalMarkerConfigModal = ({
    show,
    onHide,
    onSave,
    onUpdate,
    editedMarker,
    errors,
}) => {
    const [id, setId] = useState("");
    const [name, setName] = useState("");
    const [coordinateX, setCoordinateX] = useState("");
    const [coordinateY, setCoordinateY] = useState("");
    const [zone, setZone] = useState("");
    const [type, setType] = useState("");
    const [icon, setIcon] = useState("");

    useEffect(() => {
        console.log(errors);
    }, [errors]);

    useEffect(() => {
        if (editedMarker) {
            setId(editedMarker.id || "");
            setName(editedMarker.name || "");
            setCoordinateX(editedMarker.coordinateX || "");
            setCoordinateY(editedMarker.coordinateY || "");
            setZone(editedMarker.zone || "");
            setType(editedMarker.type || "");
            setIcon(editedMarker.icon || "");
        } else {
            setId("");
            setName("");
            setCoordinateX("");
            setCoordinateY("");
            setZone("");
            setType("");
            setIcon("");
        }
    }, [editedMarker, show]);

    const handleSave = () => {
        if (editedMarker) {
            onUpdate({ id, name, coordinateX, coordinateY, zone, type, icon });
        } else {
            onSave({ name, coordinateX, coordinateY, zone, type, icon });
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
                    <Form.Group controlId="formName">
                        <Form.Label>Nome</Form.Label>
                        <Form.Control
                            type="text"
                            placeholder="Nome"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            className={
                                errors &&
                                errors.error &&
                                errors.error.name !== undefined
                                    ? "is-invalid"
                                    : "is-valid"
                            }
                        />
                        {errors &&
                        errors.error &&
                        errors.error.name !== undefined ? (
                            <div className="invalid-feedback">
                                {errors.error.name}
                            </div>
                        ) : (
                            <></>
                        )}
                    </Form.Group>

                    <Form.Group controlId="formCoordinateX">
                        <Form.Label>Coordenada X</Form.Label>
                        <Form.Control
                            type="text"
                            placeholder="Coordenada X"
                            value={coordinateX}
                            onChange={(e) => setCoordinateX(e.target.value)}
                            className={
                                errors &&
                                errors.error &&
                                errors.error.coordinateX !== undefined
                                    ? "is-invalid"
                                    : "is-valid"
                            }
                        />
                        {errors &&
                        errors.error &&
                        errors.error.coordinateX !== undefined ? (
                            <div className="invalid-feedback">
                                {errors.error.coordinateX}
                            </div>
                        ) : (
                            <></>
                        )}
                    </Form.Group>

                    <Form.Group controlId="formCoordinateY">
                        <Form.Label>Coordenada Y</Form.Label>
                        <Form.Control
                            type="text"
                            placeholder="Coordenada Y"
                            value={coordinateY}
                            onChange={(e) => setCoordinateY(e.target.value)}
                            className={
                                errors &&
                                errors.error &&
                                errors.error.coordinateY !== undefined
                                    ? "is-invalid"
                                    : "is-valid"
                            }
                        />
                        {errors &&
                        errors.error &&
                        errors.error.coordinateY !== undefined ? (
                            <div className="invalid-feedback">
                                {errors.error.coordinateY}
                            </div>
                        ) : (
                            <></>
                        )}
                    </Form.Group>

                    <Form.Group controlId="formZone">
                        <Form.Label>Zona</Form.Label>
                        <Form.Control
                            type="text"
                            placeholder="Zona"
                            value={zone}
                            onChange={(e) => setZone(e.target.value)}
                            className={
                                errors &&
                                errors.error &&
                                errors.error.zone !== undefined
                                    ? "is-invalid"
                                    : "is-valid"
                            }
                        />
                        {errors &&
                        errors.error &&
                        errors.error.zone !== undefined ? (
                            <div className="invalid-feedback">
                                {errors.error.zone}
                            </div>
                        ) : (
                            <></>
                        )}
                    </Form.Group>

                    <Form.Group controlId="formType">
                        <Form.Label>Tipo</Form.Label>
                        <Dropdown>
                            <Dropdown.Toggle
                                variant="success"
                                id="dropdown-type"
                                className={
                                    errors &&
                                    errors.error &&
                                    errors.error.type !== undefined
                                        ? "is-invalid"
                                        : "is-valid"
                                }
                            >
                                {type ? type : "Selecione o tipo"}
                            </Dropdown.Toggle>

                            <Dropdown.Menu>
                                <Dropdown.Item
                                    onClick={() =>
                                        setType("Representa Atividades")
                                    }
                                >
                                    Representa Atividades
                                </Dropdown.Item>
                                <Dropdown.Item
                                    onClick={() =>
                                        setType("Não representa Atividades")
                                    }
                                >
                                    Não representa Atividades
                                </Dropdown.Item>
                            </Dropdown.Menu>
                            {errors &&
                            errors.error &&
                            errors.error.type !== undefined ? (
                                <div className="invalid-feedback">
                                    {errors.error.type}
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

export default PersonalMarkerConfigModal;
