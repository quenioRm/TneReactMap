import React, { useState, useEffect } from "react";
import axios from "axios";
import { Container, Row, Col, Table, Spinner, Form } from "react-bootstrap";

const ProductionTableDailyTable = () => {
    const [productionData, setProductionData] = useState([]);
    const [selectedProject, setSelectedProject] = useState("");
    const [startDate, setStartDate] = useState("");
    const [finishDate, setFinishDate] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [uniqueProjects, setUniqueProjects] = useState([]);

    const handleProjectChange = (e) => {
        setSelectedProject(e.target.value);
    };

    useEffect(() => {
        setIsLoading(true); // Activate loading state
        const fetchProjects = async () => {
            try {
                const response = await axios.get(
                    "/api/towers/getuniqueprojects",
                ); // Your provided API endpoint
                setUniqueProjects(response.data); // Update uniqueProjects state
            } catch (error) {
                console.error("Error fetching unique projects:", error);
            }
            setIsLoading(false); // Deactivate loading state
        };

        fetchProjects();
    }, []);

    useEffect(() => {
        if (startDate && finishDate) {
            setIsLoading(true);
            const fetchData = async () => {
                try {
                    const endpoint = selectedProject
                        ? `/api/production/getperiodProduction/${startDate}/${finishDate}/${selectedProject}`
                        : `/api/production/getperiodProduction/${startDate}/${finishDate}/`;
                    const response = await axios.get(endpoint);
                    setProductionData(response.data);
                } catch (error) {
                    console.error("Error fetching production data:", error);
                }
                setIsLoading(false);
            };

            fetchData();
        }
    }, [selectedProject, startDate, finishDate]);

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
            <Row className="mb-3">
                {/* Project Dropdown */}
                <Col md={4}>
                    <Form.Group controlId="projectDropdown">
                        <Form.Label>Selecione o Projeto:</Form.Label>
                        <Form.Control
                            as="select"
                            onChange={handleProjectChange}
                            value={selectedProject}
                        >
                            <option value="">Todos os Projetos</option>
                            {uniqueProjects.map((project) => (
                                <option key={project} value={project}>
                                    {project}
                                </option>
                            ))}
                        </Form.Control>
                    </Form.Group>
                </Col>

                {/* Start Date Input */}
                <Col md={4}>
                    <Form.Group controlId="startDate">
                        <Form.Label>Data Inicial</Form.Label>
                        <Form.Control
                            type="date"
                            required
                            onChange={(e) => setStartDate(e.target.value)}
                        />
                    </Form.Group>
                </Col>

                {/* Finish Date Input */}
                <Col md={4}>
                    <Form.Group controlId="finishDate">
                        <Form.Label>Data Final</Form.Label>
                        <Form.Control
                            type="date"
                            required
                            onChange={(e) => setFinishDate(e.target.value)}
                        />
                    </Form.Group>
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
                            src={activity.icon}
                            alt={activity.activitie}
                            style={{ width: "50px", height: "50px" }}
                        />
                    </Col>
                    <Col md={10}>
                        <p>Previous: {activity.previous}</p>
                        <p>Executed: {activity.executed}</p>
                        <p>No Executed: {activity.noExecuted}</p>
                        <p>AVC Percent: {activity.avcPercent}</p>
                    </Col>
                    <Col md={12}>
                        <h3>Daily Production:</h3>
                        <Table striped bordered hover>
                            <thead>
                                <tr>
                                    <th>Date</th>
                                    <th>Executed</th>
                                </tr>
                            </thead>
                            <tbody>
                                {Object.entries(activity.dailyProduction).map(
                                    ([date, executed], subindex) => (
                                        <tr key={subindex}>
                                            <td>{date}</td>
                                            <td>{executed}</td>
                                        </tr>
                                    ),
                                )}
                            </tbody>
                        </Table>
                    </Col>
                </Row>
            ))}
        </Container>
    );
};

export default ProductionTableDailyTable;
