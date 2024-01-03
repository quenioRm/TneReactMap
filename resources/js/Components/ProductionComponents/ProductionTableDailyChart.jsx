import React, { useState, useEffect } from "react";
import axios from "axios";
import { Spinner, Form, Row, Col, Button } from "react-bootstrap";
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
import moment from "moment";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Select from "react-select";
import ProductionTableLineChart from "./ProductionTableLineChart";

const ProductionTableDailyChart = ({ uniqueProjects }) => {
    const [chartData, setChartData] = useState([]);
    const [activities, setActivities] = useState([]);
    const [selectedProjects, setSelectedProjects] = useState(
        JSON.parse(localStorage.getItem("selectedProjects")) || [],
    );
    const [selectedActivity, setSelectedActivity] = useState(
        localStorage.getItem("selectedActivity") || "",
    );
    const [startDate, setStartDate] = useState(
        localStorage.getItem("startDate") ||
            moment().subtract(7, "days").format("YYYY-MM-DD"),
    );
    const [finishDate, setFinishDate] = useState(
        localStorage.getItem("finishDate") || moment().format("YYYY-MM-DD"),
    );
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        localStorage.setItem(
            "selectedProjects",
            JSON.stringify(selectedProjects),
        );
    }, [selectedProjects]);

    useEffect(() => {
        localStorage.setItem("selectedActivity", selectedActivity);
    }, [selectedActivity]);

    useEffect(() => {
        localStorage.setItem("startDate", startDate);
    }, [startDate]);

    useEffect(() => {
        localStorage.setItem("finishDate", finishDate);
    }, [finishDate]);

    const handleProjectChange = (selectedOptions) => {
        console.log(selectedOptions);
        setSelectedProjects(selectedOptions.map((option) => option.value)); // Extrair os valores dos objetos selecionados
    };

    const handleActivityChange = (e) => {
        setSelectedActivity(e.target.value);
    };

    const handleStartDateChange = (e) => {
        setStartDate(e.target.value);
    };

    const handleFinishDateChange = (e) => {
        setFinishDate(e.target.value);
    };

    const fetchChartData = async () => {
        setIsLoading(true);

        if (selectedProjects.length === 0) {
            toast.error("Os campo projeto é obrigatório.");
            setIsLoading(false);
            return;
        }

        if (selectedActivity === "") {
            toast.error("Os campo atividade é obrigatório.");
            setIsLoading(false);
            return;
        }

        try {
            const promises = selectedProjects.map(async (project) => {
                const endpoint = project
                    ? `/api/production/getperiodProduction/${startDate}/${finishDate}/${project.name}`
                    : `/api/production/getperiodProduction/${startDate}/${finishDate}/`;
                const response = await axios.get(endpoint);
                const processedData = processActivityData(
                    response.data,
                    project,
                );
                return processedData;
            });

            const chartData = await Promise.all(promises);

            const combinedChartData = chartData.reduce((result, data) => {
                data.forEach((entry) => {
                    if (entry.project) {
                        // Check if entry.project exists
                        const existingEntry = result.find(
                            (item) => item.date === entry.date,
                        );
                        if (existingEntry) {
                            existingEntry["P" + entry.project.id] =
                                entry.accumulatedValue;
                        } else {
                            const newEntry = {
                                date: entry.date,
                                ["P" + entry.project.id]:
                                    entry.accumulatedValue,
                                name: entry.name,
                            };
                            result.push(newEntry);
                        }
                    }
                });
                return result;
            }, []);

            setChartData(combinedChartData);
        } catch (error) {
            console.error("Error fetching chart data:", error);
        }
        setIsLoading(false);
    };

    const processActivityData = (activities, project) => {
        let selectedActivityData = activities.find(
            (item) => item.activitie === selectedActivity,
        );

        if (!selectedActivityData || !selectedActivityData.dailyProduction) {
            console.error(
                "No valid dailyProduction data found for the selected activity.",
            );
            return [];
        }

        let accumulated = 0;

        const dailyProduction = selectedActivityData.dailyProduction;
        const processedData = Object.entries(dailyProduction)
            .sort(([date1], [date2]) => new Date(date1) - new Date(date2))
            .map(([date, quantity]) => {
                quantity = Number(quantity);
                accumulated += isNaN(quantity) ? 0 : quantity;
                return {
                    date: moment(date).format("DD-MM-YYYY"),
                    ["P" + project.id]: accumulated,
                    name: project.name,
                };
            });

        return processedData;
    };

    const fetchActivities = async () => {
        try {
            const response = await axios.get("/api/markers");
            setActivities(response.data);
        } catch (error) {
            console.error("Error fetching activities:", error);
        }
    };

    const getRandomColor = () => {
        const letters = "0123456789ABCDEF";
        let color = "#";
        for (let i = 0; i < 6; i++) {
            color += letters[Math.floor(Math.random() * 16)];
        }
        return color;
    };

    useEffect(() => {
        fetchActivities();
    }, []);

    useEffect(() => {
        if (selectedActivity) {
            fetchChartData();
        }
    }, [selectedActivity, selectedProjects]);

    if (isLoading) {
        return (
            <div
                style={{
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                    height: "100vh",
                }}
            >
                <Spinner animation="border" />
            </div>
        );
    }

    return (
        <>
            <Row className="mb-3 align-items-end">
                <Col md={5}>
                    <Form.Group controlId="projectDropdown">
                        <Form.Label>Selecione o Projeto:</Form.Label>
                        <Select
                            options={uniqueProjects.map((project) => ({
                                value: project,
                                label: project.name,
                            }))}
                            isMulti
                            onChange={handleProjectChange}
                            value={selectedProjects.map((project) => ({
                                value: project,
                                label: project.name,
                            }))}
                        />
                    </Form.Group>
                </Col>
                <Col md={2}>
                    <Form.Group controlId="activityDropdown">
                        <Form.Label>Selecione a Atividade:</Form.Label>
                        <Form.Control
                            as="select"
                            onChange={handleActivityChange}
                            value={selectedActivity}
                        >
                            <option value="">Todas as Atividades</option>
                            {activities.map((activity) => (
                                <option
                                    key={activity.id}
                                    value={activity.atividade}
                                >
                                    {activity.atividade}
                                </option>
                            ))}
                        </Form.Control>
                    </Form.Group>
                </Col>
                <Col md={2}>
                    <Form.Group controlId="startDate">
                        <Form.Label>Data Inicial</Form.Label>
                        <Form.Control
                            type="date"
                            required
                            value={startDate}
                            onChange={handleStartDateChange}
                        />
                    </Form.Group>
                </Col>
                <Col md={2}>
                    <Form.Group controlId="finishDate">
                        <Form.Label>Data Final</Form.Label>
                        <Form.Control
                            type="date"
                            required
                            value={finishDate}
                            onChange={handleFinishDateChange}
                        />
                    </Form.Group>
                </Col>
                <Col md={2}>
                    <Button
                        onClick={fetchChartData}
                        variant="primary"
                        style={{ marginTop: "32px" }}
                    >
                        Atualizar Gráfico
                    </Button>
                </Col>
            </Row>

            <ProductionTableLineChart
                chartData={chartData}
                selectedProjects={selectedProjects}
            />

            {/* <div style={{ width: "100%", height: 600 }}>
                {chartData && selectedProjects.length > 0 ? (
                    <ResponsiveContainer>
                        <LineChart data={chartData}>
                            <XAxis dataKey="date" style={{ fontSize: "8px" }} />
                            <YAxis />
                            <CartesianGrid
                                stroke="#eee"
                                strokeDasharray="5 5"
                            />
                            <Tooltip />
                            <Legend />
                            {selectedProjects.map((project) => (
                                <Line
                                    key={project.id}
                                    type="monotone"
                                    dataKey={`P${project.id}`}
                                    stroke={getRandomColor()}
                                    name={project.name}
                                />
                            ))}
                        </LineChart>
                    </ResponsiveContainer>
                ) : (
                    <p>Carregando dados ou nenhum projeto selecionado...</p>
                )}
            </div> */}
            <ToastContainer />
        </>
    );
};

export default ProductionTableDailyChart;
