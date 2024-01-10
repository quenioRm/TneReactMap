import React, { useState, useEffect } from "react";
import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer,
} from "recharts";
import {
    Form,
    Col,
    Container,
    Row,
    Button,
    Table,
    Pagination,
    FormControl,
    InputGroup,
} from "react-bootstrap";

const TowerStatusChart = () => {
    const [uniqueProjects, setProjects] = useState([]);
    const [selectedProject, setSelectedProject] = useState("");
    const [chartData, setChartData] = useState([]);
    const [showTable, setShowTable] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage] = useState(5);
    const [showLines, setShowLines] = useState({
        predictedReceiveCountAcum: true,
        solicitationsAcum: true,
        receivesAcum: true,
    });

    useEffect(() => {
        // Faça a solicitação à API para obter a lista de projetos
        fetch("/towers/getuniqueprojects")
            .then((response) => response.json())
            .then((data) => {
                // Armazene a lista de projetos no estado
                setProjects(data);
            })
            .catch((error) => {
                console.error("Erro ao buscar projetos da API:", error);
            });
    }, []);

    useEffect(() => {
        // Faça a solicitação à API para obter os dados do gráfico quando selectedProject mudar ou ao iniciar o componente
        if (selectedProject || selectedProject === "") {
            fetch(`/towers/gettowerssolicitations/${selectedProject || ""}`)
                .then((response) => response.json())
                .then((data) => {
                    // Armazene os dados do gráfico no estado
                    setChartData(data);
                    // console.log(data)
                })
                .catch((error) => {
                    console.error(
                        "Erro ao buscar dados do gráfico da API:",
                        error,
                    );
                });
        }
    }, [selectedProject]);

    const handleProjectChange = (event) => {
        // Atualize o estado do projeto selecionado quando o usuário fizer uma seleção
        setSelectedProject(event.target.value);
    };

    const toggleTable = () => {
        setShowTable(!showTable);
    };

    const calculatePercentage = (received, predicted) => {
        if (predicted === 0) {
            return "0%";
        }
        const percentage = (received / predicted) * 100;
        return `${percentage.toFixed(2)}%`;
    };

    const toggleLine = (lineKey) => {
        setShowLines((prevState) => ({
            ...prevState,
            [lineKey]: !prevState[lineKey],
        }));
    };

    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentItems = chartData.slice(indexOfFirstItem, indexOfLastItem);

    const paginate = (pageNumber) => {
        setCurrentPage(pageNumber);
    };

    return (
        <Container>
            <br />
            <Row>
                {selectedProject ? (
                    <h4>
                        Gráfico de Status de Recebimento de Estruturas -{" "}
                        {selectedProject}
                    </h4>
                ) : (
                    <h4>Gráfico de Status de Recebimento de Estruturas</h4>
                )}
            </Row>
            <Row>
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
                <Col md={1}>
                    <Button onClick={toggleTable}>
                        {showTable ? "Esconder Tabela" : "Mostrar Tabela"}
                    </Button>
                </Col>
                <Col md={8}>
                    <InputGroup className="mb-3">
                        <Col md={2}>
                            <Form.Check
                                type="checkbox"
                                label="Previsão de Recebimento"
                                checked={showLines.predictedReceiveCountAcum}
                                onChange={() =>
                                    toggleLine("predictedReceiveCountAcum")
                                }
                            />
                        </Col>
                        <Col md={2}>
                            <Form.Check
                                type="checkbox"
                                label="Solicitações"
                                checked={showLines.solicitationsAcum}
                                onChange={() => toggleLine("solicitationsAcum")}
                            />
                        </Col>
                        <Form.Check
                            type="checkbox"
                            label="Recebimentos"
                            checked={showLines.receivesAcum}
                            onChange={() => toggleLine("receivesAcum")}
                        />
                    </InputGroup>
                </Col>
            </Row>
            {selectedProject && <p>Projeto selecionado: {selectedProject}</p>}

            <ResponsiveContainer width="100%" height={400}>
                <LineChart
                    data={chartData}
                    margin={{
                        top: 20,
                        right: 30,
                        left: 20,
                        bottom: 5,
                    }}
                >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" style={{ fontSize: "10px" }} />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    {showLines.predictedReceiveCountAcum && (
                        <Line
                            type="monotone"
                            dataKey="predictedReceiveCountAcum"
                            name="Previsão de Recebimento"
                            stroke="#FFA500" // Laranja
                        />
                    )}
                    {showLines.solicitationsAcum && (
                        <Line
                            type="monotone"
                            dataKey="solicitationsAcum"
                            name="Solicitações"
                            stroke="#8884d8"
                        />
                    )}
                    {showLines.receivesAcum && (
                        <Line
                            type="monotone"
                            dataKey="receivesAcum"
                            name="Recebimentos"
                            stroke="#82ca9d"
                        />
                    )}
                </LineChart>
            </ResponsiveContainer>

            {showTable && (
                <div>
                    <h4>Valores Acumulados Mês a Mês</h4>
                    <Table striped bordered hover>
                        <thead>
                            <tr>
                                <th>Mês</th>
                                <th>Solicitações</th>
                                <th>Recebimentos</th>
                                <th>Previsão de Recebimento</th>
                                <th>% Recebida</th>
                            </tr>
                        </thead>
                        <tbody>
                            {currentItems.map((row, index) => (
                                <tr key={index}>
                                    <td>{row.month}</td>
                                    <td>{row.solicitationsAcum}</td>
                                    <td>{row.receivesAcum}</td>
                                    <td>{row.predictedReceiveCountAcum}</td>
                                    <td>
                                        {calculatePercentage(
                                            row.receivesAcum,
                                            row.predictedReceiveCountAcum,
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </Table>
                </div>
            )}

            {showTable && (
                <Pagination>
                    {Array.from({
                        length: Math.ceil(chartData.length / itemsPerPage),
                    }).map((_, index) => (
                        <Pagination.Item
                            key={index}
                            active={index + 1 === currentPage}
                            onClick={() => paginate(index + 1)}
                        >
                            {index + 1}
                        </Pagination.Item>
                    ))}
                </Pagination>
            )}
        </Container>
    );
};

export default TowerStatusChart;
