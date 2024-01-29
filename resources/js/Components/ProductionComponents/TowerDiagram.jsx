import React, { useState, useEffect } from "react";
import axios from "../../Components/axiosInstance";
import Select from "react-select";
import { Card, Form, Row, Col } from "react-bootstrap";
import OverlayTrigger from "react-bootstrap/OverlayTrigger";
import Tooltip from "react-bootstrap/Tooltip";
import "../css/Diagrama.css";

const TowerDiagram = () => {
    const [towerData, setTowerData] = useState(null);
    const [projects, setProjects] = useState([]);
    const [selectedProject, setSelectedProject] = useState(null);
    const [startDate, setStartDate] = useState("");
    const [errors, setErrors] = useState({});
    const [loading, setLoading] = useState(false);
    const [isCheckboxChecked, setIsCheckboxChecked] = useState(false);

    useEffect(() => {
        axios
            .get("/api/towers/getuniqueprojects")
            .then((response) => {
                const projectOptions = response.data.map((project) => ({
                    value: project.id,
                    label: project.name,
                }));
                setProjects(projectOptions);
            })
            .catch((error) => {
                console.error("Error fetching projects from the API:", error);
            });
    }, []);

    useEffect(() => {
        if (selectedProject) {
            setLoading(true);
            axios
                .post(`/api/test`, {
                    projectName: selectedProject.label,
                    startDate,
                })
                .then((response) => {
                    setTowerData(response.data);
                    setLoading(false);
                })
                .catch((error) => {
                    console.error("Error fetching tower data:", error);
                    setLoading(false);
                });
        } else {
            setTowerData(null);
        }
    }, [selectedProject, startDate]);

    const handleSelectChange = (selectedOption) => {
        setSelectedProject(selectedOption);
    };

    const handleCheckboxChange = (e) => {
        setIsCheckboxChecked(e.target.checked);
    };

    if (loading) {
        return (
            <div
                className="d-flex justify-content-center align-items-center"
                style={{ height: "100vh" }}
            >
                <div className="spinner-border" role="status">
                    <span className="sr-only">Loading...</span>
                </div>
            </div>
        );
    }

    return (
        <>
            <Card className="my-4">
                <Card.Body>
                    <Card.Title>Selecione as opções para filtro</Card.Title>
                    <Form>
                        <Row>
                            <Col md={4}>
                                <Form.Group>
                                    <Form.Label>Projeto/Trecho:</Form.Label>
                                    <Select
                                        className="custom-select-front"
                                        value={selectedProject}
                                        onChange={handleSelectChange}
                                        options={projects}
                                        placeholder="Select a Project"
                                    />
                                </Form.Group>
                            </Col>
                            <Col md={4}>
                                <Form.Group controlId="startDate">
                                    <Form.Label>Data de verificação</Form.Label>
                                    <Form.Control
                                        type="date"
                                        required
                                        value={startDate}
                                        onChange={(e) =>
                                            setStartDate(e.target.value)
                                        }
                                        className={
                                            errors &&
                                            errors.error &&
                                            errors.error.startDate !== undefined
                                                ? "is-invalid"
                                                : "is-valid"
                                        }
                                    />
                                    {errors &&
                                        errors.error &&
                                        errors.error.startDate !==
                                            undefined && (
                                            <div className="invalid-feedback">
                                                {errors.error.startDate}
                                            </div>
                                        )}
                                </Form.Group>
                            </Col>
                            <Col md={4} className="d-flex align-items-center">
                                {" "}
                                {/* Adjusted for alignment */}
                                <Form.Group controlId="checkboxControl">
                                    <Form.Check
                                        type="checkbox"
                                        label="Dar enfase no que foi produzido após a data de corte"
                                        checked={isCheckboxChecked}
                                        onChange={handleCheckboxChange}
                                    />
                                </Form.Group>
                            </Col>
                        </Row>
                    </Form>
                </Card.Body>
            </Card>

            {towerData && (
                <div className="tower-container d-flex flex-wrap">
                    {towerData.map((tower, index) => (
                        <div key={index} className="tower-wrapper mb-4 mx-2">
                            {/* Display all impediments in a single row */}
                            <div className="impediment-row d-flex">
                                {tower.impediments &&
                                    tower.impediments.map(
                                        (impediment, impedimentIndex) => (
                                            <OverlayTrigger
                                                key={impedimentIndex}
                                                placement="top"
                                                overlay={
                                                    <Tooltip>
                                                        {impediment.ImpedimentType}
                                                    </Tooltip>
                                                }
                                            >
                                                <div
                                                    className={`impediment-square text-white mr-1 ${
                                                        impediment.Status ===
                                                        "Liberado"
                                                            ? "bg-success cursor-pointer"
                                                            : "bg-danger cursor-pointer"
                                                    }`}
                                                    style={{
                                                        width: "27px",
                                                        marginRight: "4.5px",
                                                        fontSize: "0.8em",
                                                        padding: "2px",
                                                        marginBottom: "2px"
                                                    }}
                                                >
                                                    <div className="square-content d-flex align-items-center justify-content-center">
                                                        {impediment.ImpedimentType.charAt(0)}
                                                    </div>
                                                </div>
                                            </OverlayTrigger>
                                        ),
                                    )}
                            </div>
                            <div className="number-square bg-secondary text-white mb-2">
                                {tower.tower.Number + "-" + tower.tower.Name}
                            </div>
                            {tower.latestactivity &&
                                tower.latestactivity.activitie !== null && (
                                    <div
                                        className={`tower-square p-3 border bg-light cursor-pointer ${
                                            tower.latestactivity.inPeriod &&
                                            isCheckboxChecked
                                                ? "highlight"
                                                : "cursor-pointer"
                                        }`}
                                    >
                                        {/* Add Tooltip to the Image */}
                                        <OverlayTrigger
                                            placement="top"
                                            overlay={
                                                <Tooltip>
                                                    {tower.latestactivity
                                                        .activitie +
                                                        " - Executado em : " +
                                                        tower.latestactivity
                                                            .date}
                                                </Tooltip>
                                            }
                                        >
                                            <img
                                                src={tower.latestactivity.icon}
                                                alt="Latest Activity"
                                                className="img-fluid"
                                            />
                                        </OverlayTrigger>
                                    </div>
                                )}
                        </div>
                    ))}
                </div>
            )}
        </>
    );
};

export default TowerDiagram;
