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

const ProductionTableDailyChart = ({ uniqueProjects }) => {
    const [chartData, setChartData] = useState([]);
    const [activities, setActivities] = useState([]);
    const [selectedProject, setSelectedProject] = useState("");
    const [selectedActivity, setSelectedActivity] = useState("");
    const [startDate, setStartDate] = useState(
        moment().subtract(7, "days").format("YYYY-MM-DD"),
    );
    const [finishDate, setFinishDate] = useState(moment().format("YYYY-MM-DD"));
    const [isLoading, setIsLoading] = useState(false);

    const handleProjectChange = (e) => {
        setSelectedProject(e.target.value);
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

        if (selectedProject === '') {
            // Exibe uma notificação de erro se o projeto ou a atividade estiverem em branco.
            toast.error("O campo Projeto é obrigatório.");
            setIsLoading(false);
            return;
        }

        if (selectedActivity === '') {
            // Exibe uma notificação de erro se o projeto ou a atividade estiverem em branco.
            toast.error("O campo Atividade é obrigatório.");
            setIsLoading(false);
            return;
        }

        try {
            const endpoint = selectedProject
                ? `/api/production/getperiodProduction/${startDate}/${finishDate}/${selectedProject}`
                : `/api/production/getperiodProduction/${startDate}/${finishDate}/`;
            const response = await axios.get(endpoint);
            const processedData = processActivityData(response.data);
            setChartData(processedData);
        } catch (error) {
            console.error("Error fetching chart data:", error);
        }
        setIsLoading(false);
    };

    const processActivityData = (activities) => {
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
            .sort(([date1], [date2]) => new Date(date1) - new Date(date2)) // Sort by date
            .map(([date, quantity]) => {
                quantity = Number(quantity); // Convert the quantity to a number
                accumulated += isNaN(quantity) ? 0 : quantity; // Accumulate the quantity
                return {
                    date: moment(date).format("DD-MM-YYYY"),
                    dailyQuantity: isNaN(quantity) ? 0 : quantity, // Use 0 if it's not a number
                    accumulatedValue: accumulated,
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

    useEffect(() => {
        fetchActivities();
    }, []);

    useEffect(() => {
        if (selectedActivity) {
            fetchChartData();
        }
    }, [selectedActivity]);

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
                <Col md={2}>
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

            {chartData ? (
                <ResponsiveContainer width="100%" height={600}>
                    <LineChart data={chartData}>
                        <XAxis dataKey="date" style={{ fontSize: "8px" }} />
                        <YAxis />
                        <CartesianGrid stroke="#eee" strokeDasharray="5 5" />
                        <Tooltip />
                        <Legend />
                        <Line
                            type="monotone"
                            dataKey="accumulatedValue"
                            stroke="#82ca9d"
                            name="Acumulado"
                        />
                    </LineChart>
                </ResponsiveContainer>
            ) : (
                <></>
            )}
            <ToastContainer />
        </>
    );
};

export default ProductionTableDailyChart;
