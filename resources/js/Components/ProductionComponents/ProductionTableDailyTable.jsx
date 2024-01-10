import React, { useState, useEffect } from "react";
import axios from "axios";
import {
    Container,
    Row,
    Col,
    Table,
    Spinner,
    Form,
    Button,
    Modal,
} from "react-bootstrap";
import moment from "moment";
import ProductionModalCompare from "../ProductionComponents/CompareProduction/ProductionModalCompare";

const ProductionTableDailyTable = () => {
    const today = new Date().toISOString().split("T")[0];
    const sevenDaysAgo = new Date(new Date().setDate(new Date().getDate() - 7))
        .toISOString()
        .split("T")[0];

    const [productionData, setProductionData] = useState([]);
    const [selectedProject, setSelectedProject] = useState(
        localStorage.getItem("selectedProject") || "",
    );
    const [startDate, setStartDate] = useState(
        localStorage.getItem("startDate") || sevenDaysAgo,
    );
    const [finishDate, setFinishDate] = useState(
        localStorage.getItem("finishDate") || today,
    );

    const [isLoading, setIsLoading] = useState(false);
    const [uniqueProjects, setUniqueProjects] = useState([]);
    const [visibleTables, setVisibleTables] = useState({});
    const [showModal, setShowModal] = useState(false);

    useEffect(() => {
        localStorage.setItem("selectedProject", selectedProject);
    }, [selectedProject]);

    useEffect(() => {
        localStorage.setItem("startDate", startDate);
    }, [startDate]);

    useEffect(() => {
        localStorage.setItem("finishDate", finishDate);
    }, [finishDate]);

    const toggleModal = () => {
        setShowModal(!showModal);
    };

    const handleProjectChange = (e) => {
        setSelectedProject(e.target.value);
    };

    const fetchProductionData = async () => {
        if (startDate && finishDate) {
            setIsLoading(true);
            try {
                const endpoint = selectedProject
                    ? `/production/getperiodProduction/${startDate}/${finishDate}/${selectedProject}`
                    : `/production/getperiodProduction/${startDate}/${finishDate}/`;
                const response = await axios.get(endpoint);
                setProductionData(response.data);
            } catch (error) {
                console.error("Error fetching production data:", error);
            }
            setIsLoading(false);
        }
    };

    const toggleVisibility = (index) => {
        setVisibleTables({
            ...visibleTables,
            [index]: !visibleTables[index],
        });
    };

    const calculateSum = (dailyProduction) => {
        return Object.values(dailyProduction).reduce(
            (sum, num) => sum + parseFloat(num),
            0,
        );
    };

    const calculateAverage = (dailyProduction) => {
        let sum = 0;
        let count = 0;
        Object.entries(dailyProduction).forEach(([date, executed]) => {
            if (new Date(date).getDay() !== 0) {
                sum += parseFloat(executed);
                count++;
            }
        });
        return count > 0 ? (sum / count).toFixed(2) : 0;
    };

    const getDayOfWeek = (date) => {
        const dayOfWeek = new Date(date).getDay();
        return isNaN(dayOfWeek)
            ? ""
            : [
                  "Domingo",
                  "Segunda",
                  "Terça",
                  "Quarta",
                  "Quinta",
                  "Sexta",
                  "Sábado",
              ][dayOfWeek];
    };

    useEffect(() => {
        setIsLoading(true);
        const fetchProjects = async () => {
            try {
                const response = await axios.get(
                    "/towers/getuniqueprojects",
                );
                setUniqueProjects(response.data);
            } catch (error) {
                console.error("Error fetching unique projects:", error);
            }
            setIsLoading(false);
        };
        fetchProjects();
    }, []);

    if (isLoading) {
        return (
            <div
                className="d-flex justify-content-center align-items-center"
                style={{ minHeight: "100vh" }}
            >
                <Spinner animation="border" />
            </div>
        );
    }

    return (
        <Container fluid>
            <br />
            {selectedProject ? <h4>Relatório de produção por perido - {selectedProject}</h4> : <h4>Relatório de produção por perido</h4>}
            <br />
            <Row>
                <Col>
                    <Button variant="primary" onClick={toggleModal}>
                        Mostrar Gráfico
                    </Button>
                </Col>
            </Row>

            <Row className="mb-3 align-items-end">
                {/* Project Dropdown */}
                <Col md={3}>
                    <Form.Group controlId="projectDropdown">
                        <Form.Label>Selecione o Projeto:</Form.Label>
                        <Form.Control
                            as="select"
                            onChange={handleProjectChange}
                            value={selectedProject}
                        >
                            <option value="">Todos os Projetos</option>
                            {uniqueProjects.map((project) => (
                                <option key={project.id} value={project.name}>
                                    {project.name}
                                </option>
                            ))}
                        </Form.Control>
                    </Form.Group>
                </Col>
                {/* Start Date Input */}
                <Col md={3}>
                    <Form.Group controlId="startDate">
                        <Form.Label>Data Inicial</Form.Label>
                        <Form.Control
                            type="date"
                            required
                            value={startDate}
                            onChange={(e) => setStartDate(e.target.value)}
                        />
                    </Form.Group>
                </Col>
                {/* Finish Date Input */}
                <Col md={3}>
                    <Form.Group controlId="finishDate">
                        <Form.Label>Data Final</Form.Label>
                        <Form.Control
                            type="date"
                            required
                            value={finishDate}
                            onChange={(e) => setFinishDate(e.target.value)}
                        />
                    </Form.Group>
                </Col>
                {/* Generate Report Button */}
                <Col md={3}>
                    <Button onClick={fetchProductionData} variant="primary">
                        Gerar Relatório
                    </Button>
                </Col>
            </Row>

            {productionData.map((activity, index) => (
                <Row
                    key={index}
                    className="mb-3 p-3"
                    style={{ borderBottom: "2px solid #eee" }}
                >
                    <Col md={12}>
                        <h2>
                            {activity.activitie} ({activity.unity})
                        </h2>
                    </Col>
                    <Col md={2}>
                        <img
                            src={`storage/${activity.icon}`}
                            alt={activity.activitie}
                            style={{ width: "50px", height: "50px" }}
                        />
                    </Col>
                    <Col md={10}>
                        <p>Previsto: {activity.previous}</p>
                        <p>Realizado: {activity.executed}</p>
                        <p>À Executar: {activity.noExecuted}</p>
                        <p>% Avanço: {activity.avcPercent}</p>
                    </Col>
                    <Col md={12}>
                        <h3>Produção Diária:</h3>
                        <Button
                            onClick={() => toggleVisibility(index)}
                            variant="secondary"
                            style={{ marginBottom: "10px" }}
                        >
                            {visibleTables[index] ? "Ocultar" : "Mostrar"}
                        </Button>
                        <Table striped bordered hover>
                            <thead>
                                <tr>
                                    <th>Dia da Semana</th>
                                    <th>Data</th>
                                    <th>Qtd Realizada Dia</th>
                                </tr>
                            </thead>
                            <tbody>
                                {Object.entries(activity.dailyProduction).map(
                                    ([date, executed], subindex) =>
                                        visibleTables[index] && (
                                            <tr key={subindex}>
                                                <td>{getDayOfWeek(date)}</td>
                                                <td>
                                                    {moment(date).format(
                                                        "DD-MM-YYYY",
                                                    )}
                                                </td>
                                                <td>
                                                    {executed !== 0
                                                        ? executed
                                                        : ""}
                                                </td>
                                            </tr>
                                        ),
                                )}
                                <tr>
                                    <td colSpan="2">
                                        <strong>Total</strong>
                                    </td>
                                    <td>
                                        <strong>
                                            {calculateSum(
                                                activity.dailyProduction,
                                            ).toFixed(2)}
                                        </strong>
                                    </td>
                                </tr>
                                <tr>
                                    <td colSpan="2">
                                        <strong>Produtividade Média</strong>
                                    </td>
                                    <td>
                                        <strong>
                                            {calculateAverage(
                                                activity.dailyProduction,
                                            )}
                                        </strong>
                                    </td>
                                </tr>
                            </tbody>
                        </Table>
                    </Col>
                </Row>
            ))}
            <>
                <ProductionModalCompare
                    uniqueProjects={uniqueProjects}
                    show={showModal}
                    handleClose={toggleModal}
                />
            </>
        </Container>
    );
};

export default ProductionTableDailyTable;
