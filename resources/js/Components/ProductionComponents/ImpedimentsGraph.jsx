import React, { useState, useEffect } from "react";
import axios from "../../Components/axiosInstance";
import Select from "react-select";
import TowerFreeReportGraph from "./TowerFreeReportComponents/TowerFreeReportGraph";
import TowerFreeReportGraphCompare from "./TowerFreeReportComponents/TowerFreeReportGraphCompare";
import { Card, Form, Row, Col, Button } from "react-bootstrap";

const COLORS = ["#006400", "#FF0000"]; // Verde escuro para "Liberado" e Vermelho para "Não Liberado"

const ImpedimentsGraph = () => {
    const [reportData, setReportData] = useState([]);
    const [selectedProject, setSelectedProject] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [projects, setProjects] = useState([]);

    useEffect(() => {
        axios
            .get("/api/towers/getuniqueprojects")
            .then((response) => {
                const projectOptions = response.data.map((project) => ({
                    value: project.id,
                    label: project.name,
                }));
                setProjects(projectOptions);
                setLoading(false);
            })
            .catch((error) => {
                console.error("Error fetching projects from the API:", error);
            });
    }, []);

    useEffect(() => {
        const fetchData = async () => {
            try {
                let endpoint = ''
                if(selectedProject.value === ''){
                    endpoint = `/api/towers/getImpedimentsbytype`
                }else{
                    endpoint = `/api/towers/getImpedimentsbytype/${selectedProject.label}`
                }

                const response = await axios.get(
                    endpoint,
                );

                const data = Object.values(response.data); // Assuming the API returns an object
                setReportData(data);

            } catch (err) {
                setError(err);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [selectedProject]);

    const handleSelectChange = (selectedOption) => {
        setSelectedProject(selectedOption);
    };

    if (loading) {
        return <div className="text-center">Carregando...</div>;
    }

    // if (error) {
    //     return <div className="text-center">Erro: {error.message}</div>;
    // }

    return (
        <div>
            {/* Second Card: Selected Project */}
            <Card className="mt-3">
                <Card.Header className="text-center">
                    Resumo de Liberação de Torres - Por Trecho
                </Card.Header>
                <Card.Body>
                    <div className="row mb-3"> {/* Adicionando margem inferior à div */}
                        <div className="col-8">
                            <Form.Label>Projeto/Trecho:</Form.Label>
                            <Select
                                className="custom-select-front"
                                value={selectedProject}
                                onChange={handleSelectChange}
                                options={[{ label: "Todos os projetos", value: "" }, ...projects]}
                                placeholder="Selecione um projeto"
                            />
                        </div>
                    </div>

                    {selectedProject && reportData && reportData.length > 0 && (
                        <>
                        <div className="row">
                            {reportData.map((item, index) => (
                                <div key={index} className="col mb-3"> {/* Adicionando margem inferior à coluna */}
                                    <TowerFreeReportGraph
                                        data={[
                                            {
                                                name: "Liberado",
                                                y: item.released,
                                            },
                                            {
                                                name: "Não Liberado",
                                                y: item.notreleased,
                                            },
                                        ]}
                                        name={item.type}
                                        containerId={item.type + '-chart'} // ID exclusivo para o segundo gráfico
                                    />
                                </div>

                            ))}
                        </div>

                            <div className="row">
                            <Col

                                className="d-flex align-items-start"
                            >
                                <TowerFreeReportGraphCompare
                                    categories={[
                                        reportData[0].type + " [Liberado]",
                                        reportData[0].type +
                                            " [Não Liberado]",
                                        reportData[1].type + " [Liberado]",
                                        reportData[1].type +
                                            " [Não Liberado]",
                                        reportData[2].type + " [Liberado]",
                                        reportData[2].type +
                                            " [Não Liberado]",
                                    ]}
                                    quantities={[
                                        reportData[0].released,
                                        reportData[0].notreleased,
                                        reportData[1].released,
                                        reportData[1].notreleased,
                                        reportData[2].released,
                                        reportData[2].notreleased,
                                    ]}
                                    colors={[
                                        "#008000",
                                        "#FF5733",
                                        "#008000",
                                        "#FF5733",
                                        "#008000",
                                        "#FF5733",
                                    ]}
                                    name="Status Geral"
                                />
                            </Col>
                            </div>
                        </>
                    )}
                </Card.Body>
            </Card>
            <br />
        </div>
    );
};

export default ImpedimentsGraph;
