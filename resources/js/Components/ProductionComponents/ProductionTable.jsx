import React, { useEffect, useState } from "react";
import axios from "axios";
import {
    Button,
    Container,
    Row,
    Col,
    Form,
    Spinner,
    Table,
    Dropdown,
} from "react-bootstrap";
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer,
    LabelList,
} from "recharts";

const ProductionTable = () => {
    const [productionData, setProductionData] = useState([]);
    const [selectedProject, setSelectedProject] = useState("");
    const [uniqueProjects, setUniqueProjects] = useState([]);
    const [isLoading, setIsLoading] = useState(false); // Estado para controlar o carregamento
    const [showGraph, setShowGraph] = useState(false); // Novo estado para controlar a exibição do gráfico
    const [visibleActivities, setVisibleActivities] = useState({}); // Novo estado para controlar a visibilidade das atividades

    // Fetch unique projects for populating the dropdown
    useEffect(() => {
        setIsLoading(true); // Ativa o estado de carregamento
        const fetchProjects = async () => {
            try {
                const response = await axios.get(
                    "/api/towers/getuniqueprojects",
                );
                setUniqueProjects(response.data);
                console.log(response.data);
            } catch (error) {
                console.error("Error fetching unique projects:", error);
            }
            setIsLoading(false); // Desativa o estado de carregamento
        };

        fetchProjects();
    }, []);

    // Fetch production data whenever selectedProject changes
    useEffect(() => {
        setIsLoading(true); // Ativa o estado de carregamento
        const fetchData = async () => {
            try {
                const endpoint = selectedProject
                    ? `/api/production/getLatestProduction/${selectedProject}`
                    : `/api/production/getLatestProduction`;
                const response = await axios.get(endpoint);
                setProductionData(response.data);
                // Atualiza o estado de visibilidade para as novas atividades
                const newVisibleActivities = {};
                response.data.forEach((item) => {
                    if (visibleActivities[item.activitie] === undefined) {
                        newVisibleActivities[item.activitie] = true; // Define as novas atividades como visíveis por padrão
                    } else {
                        newVisibleActivities[item.activitie] =
                            visibleActivities[item.activitie];
                    }
                });
                setVisibleActivities(newVisibleActivities);
            } catch (error) {
                console.error("Error fetching production data:", error);
            }
            setIsLoading(false); // Desativa o estado de carregamento
        };

        fetchData();
    }, [selectedProject]);

    // Atualiza o projeto selecionado
    const handleProjectChange = (e) => {
        setSelectedProject(e.target.value);
    };

    // Função para alternar entre visualização de tabela e gráfico
    const toggleGraph = () => {
        setShowGraph(!showGraph);
    };

    // Função para alternar a visibilidade da atividade
    const toggleActivityVisibility = (activity) => {
        setVisibleActivities({
            ...visibleActivities,
            [activity]: !visibleActivities[activity],
        });
    };

    const renderCustomLegend = (props) => {
        const { payload } = props;

        return (
            <ul
                style={{
                    display: "flex",
                    justifyContent: "center", // This will center the legend items
                    alignItems: "center", // This ensures vertical alignment
                    listStyle: "none",
                    margin: 0,
                    padding: 0,
                }}
            >
                {payload.map((entry, index) => (
                    <li
                        key={`item-${index}`}
                        style={{
                            display: "flex",
                            alignItems: "center", // Aligns the text and color box
                            marginRight: 10, // Adds some space between legend items
                        }}
                    >
                        <svg width="14" height="14" style={{ marginRight: 5 }}>
                            <rect
                                width="14"
                                height="14"
                                style={{ fill: entry.color }}
                            />
                        </svg>
                        <span style={{ color: entry.color }}>
                            {entry.value === "executed"
                                ? "Realizado"
                                : entry.value}
                        </span>
                    </li>
                ))}
            </ul>
        );
    };

    // Filtra os dados para incluir apenas as atividades visíveis
    const filteredData = productionData.filter(
        (item) => visibleActivities[item.activitie],
    );

    return (
        <Container fluid>
            <Row className="mb-3">
                <Col>
                    <h2>Relatório Geral de Produção</h2>
                </Col>
            </Row>
            <Row className="mb-3">
                <Col>
                    <Form>
                        <Form.Group controlId="projectDropdown">
                            <Form.Label>Selecione o Projeto:</Form.Label>
                            <Form.Control
                                as="select"
                                onChange={handleProjectChange}
                                value={selectedProject}
                            >
                                <option value="">Todos os Projetos</option>
                                {uniqueProjects.map((project) => (
                                    <option
                                        key={project.id}
                                        value={project.name}
                                    >
                                        {project.name}
                                    </option>
                                ))}
                            </Form.Control>
                        </Form.Group>
                    </Form>
                </Col>
            </Row>
            {isLoading ? (
                // Barra de carregamento
                <div
                    className="d-flex justify-content-center align-items-center"
                    style={{ minHeight: "100vh" }}
                >
                    <Spinner animation="border" role="status">
                        <span className="visually-hidden">Carregando...</span>
                    </Spinner>
                </div>
            ) : (
                <>
                    {showGraph && (
                        <Dropdown className="mb-3">
                            <Dropdown.Toggle
                                variant="success"
                                id="dropdown-basic"
                            >
                                Selecionar Atividades
                            </Dropdown.Toggle>

                            <Dropdown.Menu>
                                {Object.keys(visibleActivities).length > 0 ? (
                                    Object.keys(visibleActivities).map(
                                        (activity) => (
                                            <Dropdown.Item
                                                key={activity}
                                                onClick={() =>
                                                    toggleActivityVisibility(
                                                        activity,
                                                    )
                                                }
                                            >
                                                <Form.Check
                                                    type="checkbox"
                                                    id={`check-${activity}`}
                                                    label={activity}
                                                    checked={
                                                        visibleActivities[
                                                            activity
                                                        ]
                                                    }
                                                />
                                            </Dropdown.Item>
                                        ),
                                    )
                                ) : (
                                    <Dropdown.Item>
                                        Nenhuma atividade disponível
                                    </Dropdown.Item>
                                )}
                            </Dropdown.Menu>
                        </Dropdown>
                    )}

                    <Button onClick={toggleGraph} className="mb-3">
                        {showGraph ? "Mostrar Tabela" : "Mostrar Gráfico"}
                    </Button>

                    {showGraph ? (
                        // Conteúdo do Gráfico com container responsivo
                        <ResponsiveContainer width="95%" height={400}>
                            <BarChart data={filteredData}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis
                                    dataKey="activitie"
                                    style={{ fontSize: "8px" }}
                                />
                                <YAxis />
                                <Tooltip />
                                <Legend content={renderCustomLegend} />
                                <Bar
                                    dataKey="executed"
                                    fill="#82ca9d"
                                    name="Realizado"
                                >
                                    <LabelList
                                        dataKey="executed"
                                        position="top"
                                    />
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    ) : (
                        // Conteúdo da Tabela
                        <Row>
                            <Col>
                                <Table striped bordered hover>
                                    <thead>
                                        <tr>
                                            <th>Atividade</th>
                                            <th>Unidade</th>
                                            <th>Ícone</th>
                                            <th>Previsto</th>
                                            <th>Realizado</th>
                                            <th>À Executar</th>
                                            <th>% Avanço</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {productionData.map((data, index) => (
                                            <tr key={index}>
                                                <td>{data.activitie}</td>
                                                <td>{data.unity}</td>
                                                <td>
                                                    <img
                                                        src={`storage/${data.icon}`}
                                                        alt={data.activitie}
                                                        width={30}
                                                        height={30}
                                                    />
                                                </td>
                                                <td>{data.previous}</td>
                                                <td>{data.executed}</td>
                                                <td>{data.noExecuted}</td>
                                                <td>{data.avcPercent}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </Table>
                            </Col>
                        </Row>
                    )}
                </>
            )}
        </Container>
    );
};

export default ProductionTable;
