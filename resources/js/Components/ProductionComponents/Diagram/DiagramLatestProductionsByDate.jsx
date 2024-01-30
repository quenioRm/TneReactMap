import React, { useState, useEffect } from 'react';
import { Modal, Tab, Nav, Row, Col, Pagination } from 'react-bootstrap';
import axios from '../../../Components/axiosInstance';
import { format, subDays } from 'date-fns';

const DiagramLatestProductionsByDate = ({ show, handleClose, project, startdate }) => {
    const [productionData, setProduction] = useState({ production: [] });
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10;

    const [currentSummaryPage, setCurrentSummaryPage] = useState(1);
    const summaryItemsPerPage = 10;

    let resumo;
    if (project && project.label) {
        resumo = 'Resumo de Produção Data de verificação - ' + project.label;
    } else {
        resumo = 'Resumo de Produção Data de verificação';
    }

    useEffect(() => {
        if (project && startdate) {
            axios.post(`/api/diagram/getLatestProductionbydate`, {
                ProjectName: project.label,
                startDate: startdate,
            })
            .then((response) => {
                setProduction(response.data);
                console.log(response.data);
            })
            .catch((error) => {
                console.error('Error fetching data:', error);
            });
        }
    }, [project, startdate]);

    const totalPages = productionData.production ? Math.ceil(productionData.production.length / itemsPerPage) : 0;
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentItems = productionData.production ? productionData.production.slice(indexOfFirstItem, indexOfLastItem) : [];

    const totalSummaryPages = productionData.summary ? Math.ceil(productionData.summary.length / summaryItemsPerPage) : 0;
    const indexOfLastSummaryItem = currentSummaryPage * summaryItemsPerPage;
    const indexOfFirstSummaryItem = indexOfLastSummaryItem - summaryItemsPerPage;
    const currentSummaryItems = productionData.summary ? productionData.summary.slice(indexOfFirstSummaryItem, indexOfLastSummaryItem) : [];



    return (
        <Modal show={show} onHide={handleClose} size="xl">
            <Modal.Header closeButton>
                <Modal.Title>{resumo}</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                <Tab.Container id="infos-tab" defaultActiveKey="production">
                    <Row>
                        <Col sm={3}>
                            <Nav variant="pills" className="flex-column">
                                <Nav.Item>
                                    <Nav.Link eventKey="production">Produção</Nav.Link>
                                </Nav.Item>
                                <Nav.Item>
                                    <Nav.Link eventKey="resume">Resumo</Nav.Link>
                                </Nav.Item>
                            </Nav>
                        </Col>
                        <Col sm={9}>
                            <Tab.Content>
                                <Tab.Pane eventKey="production">
                                    {startdate && (
                                        <h5>Produção por estrutura - Realizada de {format(new Date(startdate), 'dd/MM/yyyy')} até {format(subDays(new Date(), 1), 'dd/MM/yyyy')}</h5>
                                    )}
                                    <hr />
                                    <div className="table-container">
                                        <table className="table">
                                            <thead>
                                                <tr>
                                                    <th>Atividade</th>
                                                    <th>Estrutura</th>
                                                    <th>Data</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {currentItems.map((item, index) => (
                                                    <tr key={index}>
                                                        <td>{item.Activitie}</td>
                                                        <td>{item.Number}</td>
                                                        <td>{item.ConclusionDate}</td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                    <Pagination>
                                        {[...Array(totalPages).keys()].map(number => (
                                            <Pagination.Item key={number + 1} active={number + 1 === currentPage} onClick={() => setCurrentPage(number + 1)}>
                                                {number + 1}
                                            </Pagination.Item>
                                        ))}
                                    </Pagination>
                                </Tab.Pane>
                                <Tab.Pane eventKey="resume">
                                {startdate && (
                                    <h5>Produção por estrutura Agrupada - Realizada de {format(new Date(startdate), 'dd/MM/yyyy')} até {format(subDays(new Date(), 1), 'dd/MM/yyyy')}</h5>
                                )}
                                <hr />
                                <div className="table-container">
                                    <table className="table">
                                        <thead>
                                            <tr>
                                                <th>Atividade</th>
                                                <th>Total</th>
                                                <th>Produtividade</th>
                                                <th>Dias Trab.</th>
                                                <th>Data de Conclusão [Tendência]</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {currentSummaryItems.map((item, index) => (
                                                <tr key={index}>
                                                    <td>{item.activity}</td>
                                                    <td>{item.total}</td>
                                                    <td>{item.dates.averageProduction.toFixed(3)}</td>
                                                    <td>{item.dates.days}</td>
                                                    <td>{item.dates.finishDate}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                                <Pagination>
                                    {[...Array(totalSummaryPages).keys()].map(number => (
                                        <Pagination.Item key={number + 1} active={number + 1 === currentSummaryPage} onClick={() => setCurrentSummaryPage(number + 1)}>
                                            {number + 1}
                                        </Pagination.Item>
                                    ))}
                                </Pagination>
                            </Tab.Pane>

                            </Tab.Content>
                        </Col>
                    </Row>
                </Tab.Container>
            </Modal.Body>
        </Modal>
    );
};

export default DiagramLatestProductionsByDate;
