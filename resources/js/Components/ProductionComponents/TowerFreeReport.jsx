import React, { useState, useEffect } from "react";
import axios from "../../Components/axiosInstance";
import Select from "react-select";
import { Card, Table } from "react-bootstrap";
import TowerFreeReportGraph from "./TowerFreeReportComponents/TowerFreeReportGraph";
import TowerFreeReportGraphCompare from "./TowerFreeReportComponents/TowerFreeReportGraphCompare";

const TowerFreeReport = () => {
    const [reportData, setReportData] = useState([]);
    const [selectedProjectData, setSelectedProjectData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [defaultOption, setDefaultOption] = useState(null);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await axios.get(
                    "/api/towers/gettotaltowerfreereport",
                );
                const data = Object.values(response.data); // Assuming the API returns an object
                setReportData(data);
                // Set the last option as the default selection
                if (data.length > 0) {
                    setDefaultOption({
                        label: data[data.length - 1].ProjectName,
                        value: data[data.length - 1].ProjectName,
                    });
                }
            } catch (err) {
                setError(err);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    const handleSelectProject = (selectedOption) => {
        setSelectedProjectData(
            reportData.find(
                (project) => project.ProjectName === selectedOption.value,
            ),
        );
    };

    useEffect(() => {
        handleSelectProject(defaultOption);
    }, [defaultOption]);

    const projectOptions = reportData.map((project) => ({
        label: project.ProjectName,
        value: project.ProjectName,
    }));

    if (loading) {
        return <div className="text-center">Carregando...</div>;
    }

    if (error) {
        return <div className="text-center">Erro: {error.message}</div>;
    }

    return (
        <div>
            {/* First Card: All Projects */}
            <Card>
                <Card.Header className="text-center">
                    Relatório de Liberação de Torres
                </Card.Header>
                <Card.Body>
                    <Table
                        striped
                        bordered
                        hover
                        size="sm"
                        className="text-center"
                    >
                        <thead>
                            <tr>
                                <th>Projeto</th>
                                <th>Total de Estruturas</th>
                                <th colSpan={2}>Fundação</th>
                                <th colSpan={2}>Eletromecânico</th>
                                <th colSpan={2}>
                                    Impedimentos Fundiários ou Arqueológicos
                                </th>
                                <th colSpan={2}>Engenharia (Resumo)</th>
                                <th colSpan={2}>Estruturas 100% Liberadas</th>
                            </tr>
                            <tr>
                                <th></th>
                                <th></th>
                                <th>Liberado</th>
                                <th>Não Liberado</th>
                                <th>Liberado</th>
                                <th>Não Liberado</th>
                                <th>Liberado</th>
                                <th>Não Liberado</th>
                                <th>Liberado</th>
                                <th>Não Liberado</th>
                                <th>Liberado</th>
                                <th>Não Liberado</th>
                            </tr>
                        </thead>
                        <tbody>
                            {reportData.map((project, index) => (
                                <tr key={index}>
                                    <td>{project.ProjectName}</td>
                                    <td>{project.TotalStructures}</td>
                                    <td>{project.FoundationReleased}</td>
                                    <td>{project.FoundationPending}</td>
                                    <td>{project.ElectromechanicalReleased}</td>
                                    <td>
                                        {project.ElectromechanicalNotReleased}
                                    </td>
                                    <td>{project.ImpedimentsReleased}</td>
                                    <td>{project.ImpedimentsNotReleased}</td>
                                    <td>{project.BothReleased}</td>
                                    <td>{project.BothNotReleased}</td>
                                    <td>{project.FullyReleased}</td>
                                    <td>{project.NotFullyReleased}</td>
                                </tr>
                            ))}
                        </tbody>
                    </Table>
                </Card.Body>
            </Card>

            {/* Second Card: Selected Project */}
            <Card className="mt-3">
                <Card.Header className="text-center">
                    Resumo de Liberação de Torres - Por Trecho
                </Card.Header>
                <Card.Body>
                    <div className="row">
                        <div className="col-8">
                            <Select
                                options={projectOptions}
                                value={
                                    selectedProjectData
                                        ? {
                                              label: selectedProjectData.ProjectName,
                                              value: selectedProjectData.ProjectName,
                                          }
                                        : defaultOption
                                }
                                onChange={handleSelectProject}
                                className="mb-3"
                                placeholder="Selecione um projeto..."
                            />
                        </div>
                    </div>
                    {selectedProjectData && (
                        <>
                            <Table
                                striped
                                bordered
                                hover
                                size="sm"
                                className="text-center"
                            >
                                <thead>
                                    <tr>
                                        <th>Projeto</th>
                                        <th>Total de Estruturas</th>
                                        <th colSpan={2}>Fundação</th>
                                        <th colSpan={2}>Eletromecânico</th>
                                        <th colSpan={2}>
                                            Impedimentos Fundiários ou
                                            Arqueológicos
                                        </th>
                                        <th colSpan={2}>Engenharia (Resumo)</th>
                                        <th colSpan={2}>
                                            Estruturas 100% Liberadas
                                        </th>
                                    </tr>
                                    <tr>
                                        <th></th>
                                        <th></th>
                                        <th>Liberado</th>
                                        <th>Não Liberado</th>
                                        <th>Liberado</th>
                                        <th>Não Liberado</th>
                                        <th>Liberado</th>
                                        <th>Não Liberado</th>
                                        <th>Liberado</th>
                                        <th>Não Liberado</th>
                                        <th>Liberado</th>
                                        <th>Não Liberado</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr>
                                        <td>
                                            {selectedProjectData.ProjectName}
                                        </td>
                                        <td>
                                            {
                                                selectedProjectData.TotalStructures
                                            }
                                        </td>
                                        <td>
                                            {
                                                selectedProjectData.FoundationReleased
                                            }
                                        </td>
                                        <td>
                                            {
                                                selectedProjectData.FoundationPending
                                            }
                                        </td>
                                        <td>
                                            {
                                                selectedProjectData.ElectromechanicalReleased
                                            }
                                        </td>
                                        <td>
                                            {
                                                selectedProjectData.ElectromechanicalNotReleased
                                            }
                                        </td>
                                        <td>
                                            {
                                                selectedProjectData.ImpedimentsReleased
                                            }
                                        </td>
                                        <td>
                                            {
                                                selectedProjectData.ImpedimentsNotReleased
                                            }
                                        </td>
                                        <td>
                                            {selectedProjectData.BothReleased}
                                        </td>
                                        <td>
                                            {
                                                selectedProjectData.BothNotReleased
                                            }
                                        </td>
                                        <td>
                                            {selectedProjectData.FullyReleased}
                                        </td>
                                        <td>
                                            {
                                                selectedProjectData.NotFullyReleased
                                            }
                                        </td>
                                    </tr>
                                    {/* Calculate and Display Percentage */}
                                    <tr>
                                        <td>%</td>
                                        <td></td>
                                        <td>
                                            {(
                                                (selectedProjectData.FoundationReleased /
                                                    selectedProjectData.TotalStructures) *
                                                100
                                            ).toFixed(2)}
                                            %
                                        </td>
                                        <td>
                                            {(
                                                (selectedProjectData.FoundationPending /
                                                    selectedProjectData.TotalStructures) *
                                                100
                                            ).toFixed(2)}
                                            %
                                        </td>
                                        <td>
                                            {(
                                                (selectedProjectData.ElectromechanicalReleased /
                                                    selectedProjectData.TotalStructures) *
                                                100
                                            ).toFixed(2)}
                                            %
                                        </td>
                                        <td>
                                            {(
                                                (selectedProjectData.ElectromechanicalNotReleased /
                                                    selectedProjectData.TotalStructures) *
                                                100
                                            ).toFixed(2)}
                                            %
                                        </td>
                                        <td>
                                            {(
                                                (selectedProjectData.ImpedimentsReleased /
                                                    selectedProjectData.TotalStructures) *
                                                100
                                            ).toFixed(2)}
                                            %
                                        </td>
                                        <td>
                                            {(
                                                (selectedProjectData.ImpedimentsNotReleased /
                                                    selectedProjectData.TotalStructures) *
                                                100
                                            ).toFixed(2)}
                                            %
                                        </td>
                                        <td>
                                            {(
                                                (selectedProjectData.BothReleased /
                                                    selectedProjectData.TotalStructures) *
                                                100
                                            ).toFixed(2)}
                                            %
                                        </td>
                                        <td>
                                            {(
                                                (selectedProjectData.BothNotReleased /
                                                    selectedProjectData.TotalStructures) *
                                                100
                                            ).toFixed(2)}
                                            %
                                        </td>
                                        <td>
                                            {(
                                                (selectedProjectData.FullyReleased /
                                                    selectedProjectData.TotalStructures) *
                                                100
                                            ).toFixed(2)}
                                            %
                                        </td>
                                        <td>
                                            {(
                                                (selectedProjectData.NotFullyReleased /
                                                    selectedProjectData.TotalStructures) *
                                                100
                                            ).toFixed(2)}
                                            %
                                        </td>
                                    </tr>
                                </tbody>
                            </Table>

                            <div className="row">
                                <div className="col">
                                    <TowerFreeReportGraph
                                        data={[
                                            {
                                                name: "Liberado",
                                                y: selectedProjectData.FoundationReleased,
                                            },
                                            {
                                                name: "Não Liberado",
                                                y: selectedProjectData.FoundationPending,
                                            },
                                        ]}
                                        name="Fundação"
                                        containerId="fundacao-chart" // ID exclusivo para o primeiro gráfico
                                    />
                                </div>
                                <div className="col">
                                    <TowerFreeReportGraph
                                        data={[
                                            {
                                                name: "Liberado",
                                                y: selectedProjectData.ElectromechanicalReleased,
                                            },
                                            {
                                                name: "Não Liberado",
                                                y: selectedProjectData.ElectromechanicalNotReleased,
                                            },
                                        ]}
                                        name="Eletromecânico"
                                        containerId="eletromecanico-chart" // ID exclusivo para o segundo gráfico
                                    />
                                </div>
                                <div className="col">
                                    <TowerFreeReportGraph
                                        data={[
                                            {
                                                name: "Liberado",
                                                y: selectedProjectData.ImpedimentsReleased,
                                            },
                                            {
                                                name: "Não Liberado",
                                                y: selectedProjectData.ImpedimentsNotReleased,
                                            },
                                        ]}
                                        name="Impedimentos"
                                        containerId="impedimentos-chart" // ID exclusivo para o terceiro gráfico
                                    />
                                </div>
                            </div>
                            <div className="row">
                            <hr className="my-4" />
                                <div className="col">
                                    <TowerFreeReportGraph
                                        data={[
                                            {
                                                name: "Liberado",
                                                y: selectedProjectData.FullyReleased,
                                            },
                                            {
                                                name: "Não Liberado",
                                                y: selectedProjectData.NotFullyReleased,
                                            },
                                        ]}
                                        name="Estruturas 100% liberadas"
                                        containerId="all"
                                    />
                                </div>
                                <div className="col">
                                <TowerFreeReportGraphCompare
                                        categories={['Impedimentos Fundiários ou Arqueologicos [Liberado]',
                                         'Engenharia [Liberado]',
                                         'Impedimentos Fundiários ou Arqueologicos [Não Liberado]',
                                         'Engenharia [Não Liberado]']}
                                        quantities={[selectedProjectData.ImpedimentsReleased,
                                                        selectedProjectData.BothReleased,
                                                        selectedProjectData.ImpedimentsNotReleased,
                                                        selectedProjectData.BothNotReleased]}
                                        colors={['#008000', '#008000', '#FF5733', '#FF5733']}
                                        name="Engenharia vs Fundiário"
                                />

                                </div>
                            </div>
                        </>
                    )}
                </Card.Body>
            </Card>
            <br />
        </div>
    );
};

export default TowerFreeReport;
