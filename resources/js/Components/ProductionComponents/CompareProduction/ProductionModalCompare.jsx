import React, { useState, useEffect } from "react";
// import axios from "axios";
import axios from "../../../Components/axiosInstance";
import Swal from "sweetalert2";

import {
    Spinner,
    Form,
    Row,
    Col,
    Button,
    Modal,
    Table,
    Pagination,
} from "react-bootstrap";
import moment from "moment";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Select from "react-select";
import DynamicLineChart from "./DynamicLineChart";
import getFirstErrorMessage from "../../processLaravelErrors";

const ProductionModalCompare = ({ uniqueProjects, show, handleClose }) => {
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

    // States for pagination
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(5);

    const [errors, setErrors] = useState({});

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

    useEffect(() => {
        fetchActivities();
        fetchChartData();
    }, []);

    useEffect(() => {
        if (selectedProjects.length > 0 && selectedActivity) {
            fetchChartData();
        }
    }, [selectedProjects, selectedActivity, startDate, finishDate]);

    const handleProjectChange = (selectedOptions) => {
        setSelectedProjects(selectedOptions.map((option) => option.value));
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
        const requestData = {
            activitie: selectedActivity,
            startDate: startDate,
            finishDate: finishDate,
            project: selectedProjects,
        };

        try {
            const response = await axios.post(
                "/api/production/getperiodproductionchartcompare",
                requestData,
            );
            if (response.status === 200 && response.data) {
                setChartData(response.data);
                setErrors({});
            } else {
                toast.error("Erro ao buscar os dados do gráfico.");
            }
        } catch (error) {
            const message = getFirstErrorMessage(error.response.data);
            // console.log(message)
            setErrors(error.response.data);
            // toast.error(message);
        }

        setIsLoading(false);
    };

    const fetchActivities = async () => {
        try {
            const response = await axios.get("/api/markers");
            setActivities(response.data);
        } catch (error) {
            console.error("Error fetching activities:", error);
        }
    };

    // const getBestPerformance = (data) => {
    //     let bestData = {};
    //     data.forEach((entry) => {
    //         if (
    //             !bestData[entry.date] ||
    //             entry.productionInDay > bestData[entry.date].productionInDay
    //         ) {
    //             bestData[entry.date] = {
    //                 project: entry.project,
    //                 productionInDay: entry.productionInDay,
    //             };
    //         }
    //     });
    //     return bestData;
    // };

    // const bestPerformance = getBestPerformance(chartData);

    // Pagination methods
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    // const currentItems = chartData.slice(indexOfFirstItem, indexOfLastItem);

    const paginate = (pageNumber) => setCurrentPage(pageNumber);

    const pageNumbers = [];
    for (let i = 1; i <= Math.ceil(chartData.length / itemsPerPage); i++) {
        pageNumbers.push(i);
    }

    return (
        <Modal show={show} onHide={handleClose} size="lg" fullscreen={true}>
            <Modal.Header closeButton>
                <Modal.Title>
                    Gráfico Comparativo de Produção por Trecho/Atividade
                </Modal.Title>
            </Modal.Header>
            <Modal.Body>
                <Row className="mb-3 align-items-end">
                    {/* Formulário para seleção de projetos, atividades e datas */}
                    <Row className="mb-3 align-items-end">
                        {/* Formulário para seleção de projetos, atividades e datas */}
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
                                    className={
                                        errors &&
                                        errors.error &&
                                        errors.error.project !== undefined
                                            ? "is-invalid"
                                            : "is-valid"
                                    }
                                />
                                {errors &&
                                errors.error &&
                                errors.error.project !== undefined ? (
                                    <div className="invalid-feedback">
                                        {errors.error.project}
                                    </div>
                                ) : (
                                    <></>
                                )}
                            </Form.Group>
                        </Col>
                        <Col md={2}>
                            <Form.Group controlId="activityDropdown">
                                <Form.Label>Selecione a Atividade:</Form.Label>
                                <Form.Control
                                    as="select"
                                    onChange={handleActivityChange}
                                    value={selectedActivity}
                                    className={
                                        errors &&
                                        errors.error &&
                                        errors.error.activitie !== undefined
                                            ? "is-invalid"
                                            : "is-valid"
                                    }
                                >
                                    {/* <option value="">
                                        Todas as Atividades
                                    </option> */}
                                    {activities.map((activity) => (
                                        <option
                                            key={activity.id}
                                            value={activity.atividade}
                                        >
                                            {activity.atividade}
                                        </option>
                                    ))}
                                </Form.Control>
                                {errors &&
                                errors.error &&
                                errors.error.activitie !== undefined ? (
                                    <div className="invalid-feedback">
                                        {errors.error.activitie}
                                    </div>
                                ) : (
                                    <></>
                                )}
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
                                errors.error.startDate !== undefined ? (
                                    <div className="invalid-feedback">
                                        {errors.error.startDate}
                                    </div>
                                ) : (
                                    <></>
                                )}
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
                                    className={
                                        errors &&
                                        errors.error &&
                                        errors.error.finishDate !== undefined
                                            ? "is-invalid"
                                            : "is-valid"
                                    }
                                />
                                {errors &&
                                errors.error &&
                                errors.error.finishDate !== undefined ? (
                                    <div className="invalid-feedback">
                                        {errors.error.finishDate}
                                    </div>
                                ) : (
                                    <></>
                                )}
                            </Form.Group>
                        </Col>
                        <Col md={1}>
                            <Button
                                onClick={fetchChartData}
                                variant="primary"
                                style={{ marginTop: "32px" }}
                            >
                                Atualizar Gráfico
                            </Button>
                        </Col>
                    </Row>
                </Row>

                {isLoading ? (
                    <div
                        style={{
                            display: "flex",
                            justifyContent: "center",
                            alignItems: "center",
                            height: "200px",
                        }}
                    >
                        <Spinner animation="border" />
                    </div>
                ) : (
                    <>
                        {chartData && (
                            <DynamicLineChart chartData={chartData} />
                        )}
                        {/* <Table striped bordered hover responsive>
                            <thead>
                                <tr>
                                    <th>Data</th>
                                    <th>Projeto</th>
                                    <th>Produção do Dia</th>
                                    <th>Melhor Desempenho</th>
                                </tr>
                            </thead>
                            <tbody>
                                {currentItems.map((data, index) => (
                                    <tr key={index}>
                                        <td>{data.date}</td>
                                        <td>{data.project}</td>
                                        <td>{data.productionInDay4}</td>
                                        <td>
                                            {bestPerformance[data.date] &&
                                            bestPerformance[data.date]
                                                .project === data.project
                                                ? "Melhor"
                                                : ""}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </Table>
                        <Pagination>
                            {pageNumbers.map((number) => (
                                <Pagination.Item
                                    key={number}
                                    active={number === currentPage}
                                    onClick={() => paginate(number)}
                                >
                                    {number}
                                </Pagination.Item>
                            ))}
                        </Pagination> */}
                    </>
                )}

                <ToastContainer />
            </Modal.Body>
            <Modal.Footer>
                {/* <Button variant="secondary" onClick={handleClose}>
                    Fechar
                </Button> */}
            </Modal.Footer>
        </Modal>
    );
};

export default ProductionModalCompare;
