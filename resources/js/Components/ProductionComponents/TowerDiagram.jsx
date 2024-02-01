import React, { useState, useEffect } from "react";
import axios from "../../Components/axiosInstance";
import Select from "react-select";
import { Card, Form, Row, Col, Button } from "react-bootstrap";
import OverlayTrigger from "react-bootstrap/OverlayTrigger";
import Tooltip from "react-bootstrap/Tooltip";
import "../css/Diagrama.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEye, faEyeSlash } from "@fortawesome/free-solid-svg-icons";
import TowerFreeReportGraphCompare from "./TowerFreeReportComponents/TowerFreeReportGraphCompare";
import DiagramTowerDetails from "../ProductionComponents/Diagram/DiagramTowerDetails";
import DiagramLatestProductionsByDate from "./Diagram/DiagramLatestProductionsByDate";
import "bootstrap/dist/css/bootstrap.min.css";

const TowerDiagram = () => {
    const [towerData, setTowerData] = useState(null);
    const [projects, setProjects] = useState([]);
    const [selectedProject, setSelectedProject] = useState(null);
    const [startDate, setStartDate] = useState("");
    const [errors, setErrors] = useState({});
    const [loading, setLoading] = useState(false);
    const [isCheckboxChecked, setIsCheckboxChecked] = useState(false);
    const [productionData, setProductionData] = useState([]);
    const [showLegend, setShowLegend] = useState(true);
    const [impediments, setImpediments] = useState([]);
    const [showDiagramDetails, setShowDiagramDetails] = useState(false);
    const [selectedTower, setSelectedTower] = useState(null);
    const [showDiagramDate, setShowDiagramDate] = useState(false);
    const [checkboxes, setCheckboxes] = useState({
        emphasizeProduction: false,
        showReceivedTowers: false,
    });

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
                .post(`/api/diagram`, {
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

    useEffect(() => {
        if (selectedProject) {
            const fetchData = async () => {
                try {
                    const endpoint = selectedProject.label
                        ? `/api/production/getLatestProduction/${selectedProject.label}`
                        : `/api/production/getLatestProduction`;
                    const response = await axios.get(endpoint);
                    setProductionData(response.data);
                } catch (error) {
                    console.error("Error fetching production data:", error);
                }
            };

            const fetchImpedimentsData = async () => {
                try {
                    const response = await axios.get(
                        `/api/diagram/getImpedimentsbytype/${selectedProject.label}`,
                    );
                    setImpediments(response.data);
                } catch (error) {
                    console.error("Error fetching production data:", error);
                }
            };

            fetchData();
            fetchImpedimentsData();
        }
    }, [selectedProject]);

    const handleSelectChange = (selectedOption) => {
        setSelectedProject(selectedOption);
    };

    const handleCheckboxChange = (e) => {
        const { name, checked } = e.target;
        setCheckboxes((prevCheckboxes) => ({
            ...prevCheckboxes,
            [name]: checked,
        }));
    };

    const handleShowDetails = (e) => {
        setSelectedTower(e);
        // console.log(e);
    };

    const handleCloseDetails = () => {
        setSelectedTower(null);
    };

    const handleShowDateModal = () => {
        setShowDiagramDate(true);
    };

    const handleCloseDateModal = () => {
        setShowDiagramDate(false);
    };

    function formatDate(dateString) {
        const dateObj = new Date(dateString);
        const day = dateObj.getDate().toString().padStart(2, "0");
        const month = (dateObj.getMonth() + 1).toString().padStart(2, "0");
        const year = dateObj.getFullYear().toString();
        return `${day}/${month}/${year}`;
    }

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
                            <Form.Group controlId="checkboxControl">
                                <Form.Check
                                    type="checkbox"
                                    name="emphasizeProduction"
                                    label="Dar ênfase no que foi produzido após a data de verificação."
                                    checked={checkboxes.emphasizeProduction}
                                    onChange={handleCheckboxChange}
                                />
                            </Form.Group>
                            <Form.Group controlId="checkboxControl">
                                <Form.Check
                                    type="checkbox"
                                    name="showReceivedTowers"
                                    label="Mostrar torres recebidas."
                                    checked={checkboxes.showReceivedTowers}
                                    onChange={handleCheckboxChange}
                                />
                            </Form.Group>
                            </Col>
                        </Row>
                        {startDate !== "" && (
                            <>
                                <br />
                                <Row>
                                    <hr></hr>
                                    <Col>
                                        <Button
                                            variant="primary"
                                            onClick={handleShowDateModal}
                                        >
                                            Ver relatório de data de verificação
                                        </Button>
                                    </Col>
                                </Row>
                            </>
                        )}
                    </Form>
                    <DiagramLatestProductionsByDate
                        show={showDiagramDate}
                        handleClose={handleCloseDateModal}
                        project={selectedProject}
                        startdate={startDate}
                    />
                </Card.Body>
            </Card>

            <Card className="my-4">
                <Card.Body>
                    <div className="d-flex justify-content-between">
                        <Card.Title>Legenda</Card.Title>
                        <button onClick={() => setShowLegend(!showLegend)}>
                            <FontAwesomeIcon
                                icon={showLegend ? faEye : faEyeSlash}
                            />
                        </button>
                    </div>
                    <hr />
                    {showLegend && (
                        <Row>
                            <Col md={6}>
                                <div className="table-container">
                                    <table className="table">
                                        <thead>
                                            <tr>
                                                <th>Nome</th>
                                                <th></th>
                                                <th>Previsto</th>
                                                <th>Realizado</th>
                                                <th>Falta</th>
                                                <th>Avanço %</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {productionData.map(
                                                (item, index) => (
                                                    <tr key={index}>
                                                        <td>
                                                            {item.activitie}
                                                        </td>
                                                        <td>
                                                            <img
                                                                src={`storage/${item.icon}`}
                                                                alt={
                                                                    item.activitie
                                                                }
                                                                width={40}
                                                                height={40}
                                                            />
                                                        </td>
                                                        <td>{item.previous}</td>
                                                        <td>{item.executed}</td>
                                                        <td>
                                                            {item.noExecuted}
                                                        </td>
                                                        <td>
                                                            {item.avcPercent}
                                                        </td>
                                                    </tr>
                                                ),
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                            </Col>

                            {impediments && impediments.length > 0 && (
                                <Col
                                    md={6}
                                    className="d-flex align-items-start"
                                >
                                    <TowerFreeReportGraphCompare
                                        categories={[
                                            impediments[0].type + " [Liberado]",
                                            impediments[0].type +
                                                " [Não Liberado]",
                                            impediments[1].type + " [Liberado]",
                                            impediments[1].type +
                                                " [Não Liberado]",
                                            impediments[2].type + " [Liberado]",
                                            impediments[2].type +
                                                " [Não Liberado]",
                                        ]}
                                        quantities={[
                                            impediments[0].released,
                                            impediments[0].notreleased,
                                            impediments[1].released,
                                            impediments[1].notreleased,
                                            impediments[2].released,
                                            impediments[2].notreleased,
                                        ]}
                                        colors={[
                                            "#008000",
                                            "#FF5733",
                                            "#008000",
                                            "#FF5733",
                                            "#008000",
                                            "#FF5733",
                                        ]}
                                        name="Status Ambiental"
                                    />
                                </Col>
                            )}
                        </Row>
                    )}
                </Card.Body>
            </Card>

            {towerData && (
                <Card className="my-4 diagram-card">
                    <Card.Body>
                        <Card.Title>Diagrama de produção</Card.Title>
                        <hr />
                        <div className="tower-container d-flex flex-wrap">
                            {towerData.map((tower, index) => (
                                <div
                                    key={index}
                                    className={`tower-wrapper mb-4 mx-2 ${
                                        index % 15 === 14 ? "fill-space" : ""
                                    }`}
                                >
                                    <div className="impediment-row d-flex">
                                        {tower.impediments &&
                                            tower.impediments.map(
                                                (
                                                    impediment,
                                                    impedimentIndex,
                                                ) => (
                                                    <OverlayTrigger
                                                        key={impedimentIndex}
                                                        placement="top"
                                                        overlay={
                                                            <Tooltip>
                                                                {
                                                                    impediment.ImpedimentType
                                                                }
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
                                                                marginRight:
                                                                    "4.5px",
                                                                fontSize:
                                                                    "0.8em",
                                                                padding: "2px",
                                                                marginBottom:
                                                                    "2px",
                                                            }}
                                                        >
                                                            <div className="square-content d-flex align-items-center justify-content-center">
                                                                {impediment.ImpedimentType.charAt(
                                                                    0,
                                                                )}
                                                            </div>
                                                        </div>
                                                    </OverlayTrigger>
                                                ),
                                            )}
                                    </div>
                                    <div className="number-square bg-secondary text-white mb-2">
                                        {tower.tower.Number +
                                            "-" +
                                            tower.tower.Name}
                                    </div>
                                    {tower.latestactivity &&
                                        tower.latestactivity.activitie !==
                                            null && (
                                            <div
                                                className={`tower-square p-3 border bg-light cursor-pointer ${
                                                    tower.latestactivity.inPeriod && checkboxes.emphasizeProduction
                                                        ? "highlight"
                                                        : tower.tower.ReceiveDate !== "" && checkboxes.showReceivedTowers
                                                        ? "highlight-received-tower"
                                                        : "cursor-pointer"
                                                }`}
                                            >
                                                <OverlayTrigger
                                                    placement="top"
                                                    overlay={
                                                        <Tooltip>
                                                            {tower.latestactivity.activitie} - Executado em: {tower.latestactivity.date}
                                                            {tower.tower.ReceiveDate && `Data de Recebimento Estrutura: ${formatDate(tower.tower.ReceiveDate)}`}
                                                        </Tooltip>
                                                    }
                                                >
                                                    <div>
                                                        <img
                                                            src={
                                                                tower
                                                                    .latestactivity
                                                                    .icon
                                                            }
                                                            alt="Latest Activity"
                                                            className="img-fluid"
                                                            onClick={() =>
                                                                handleShowDetails(
                                                                    tower,
                                                                )
                                                            }
                                                        />
                                                    </div>
                                                </OverlayTrigger>
                                                {/* <DiagramTowerDetails show={showDiagramDetails} onClose={handleCloseDetails} /> */}
                                            </div>
                                        )}
                                </div>
                            ))}
                        </div>
                    </Card.Body>
                </Card>
            )}
            <DiagramTowerDetails
                infos={selectedTower}
                handleClose={handleCloseDetails}
            />
        </>
    );
};

export default TowerDiagram;
