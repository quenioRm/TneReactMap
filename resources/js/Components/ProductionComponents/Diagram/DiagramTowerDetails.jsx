import React, { useEffect, useState } from "react";
import { Modal, Tab, Nav, Row, Col, Pagination } from "react-bootstrap";
import Table from "react-bootstrap/Table";
import axios from "../../../Components/axiosInstance";

const DiagramTowerDetails = ({ infos, handleClose }) => {
    const [towerProduction, setTowerProduction] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [towerinfo, setTowerinfo] = useState({});
    const itemsPerPage = 10;

    // Calculate the indexes of items to display based on the current page
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentItems = towerProduction.slice(
        indexOfFirstItem,
        indexOfLastItem,
    );

    // Change page
    const paginate = (pageNumber) => {
        setCurrentPage(pageNumber);
    };

    useEffect(() => {
        if (infos) {
            const fetchTowerProduction = async () => {
                try {
                    const response = await axios.get(
                        `/api/get-towerproduction/${infos.tower.Number.replace(
                            /\//g,
                            "_",
                        )}/${infos.tower.ProjectName}`,
                    );
                    setTowerProduction(response.data);
                } catch (error) {
                    console.error("Error fetching tower production:", error);
                }
            };

            const fetchTowerInfo = async () => {
                try {
                    const response = await axios.get(
                        `/api/towers/gettowerinfo/${infos.tower.Number.replace(
                            /\//g,
                            "_",
                        )}`,
                    );
                    setTowerinfo(response.data);
                    console.log(response.data);
                } catch (error) {
                    console.error("Error fetching tower images:", error);
                }
            };

            fetchTowerProduction();
            fetchTowerInfo();
        }
    }, [infos]);

    if (!infos) {
        // If infos is null or undefined, don't render anything
        return null;
    }

    return (
        <Modal show={true} onHide={handleClose} size="xl">
            <Modal.Header closeButton>
                <Modal.Title>
                    {infos.tower.Number.replace(/\//g, "_")} -{" "}
                    {infos.tower.ProjectName}
                </Modal.Title>
            </Modal.Header>
            <Modal.Body>
                <Tab.Container id="infos-tab" defaultActiveKey="structure">
                    <Row>
                        <Col sm={3}>
                            <Nav variant="pills" className="flex-column">
                                <Nav.Item>
                                    <Nav.Link eventKey="structure">
                                        Estrutura
                                    </Nav.Link>
                                </Nav.Item>
                                <Nav.Item>
                                    <Nav.Link eventKey="environmental">
                                        Status Ambiental
                                    </Nav.Link>
                                </Nav.Item>
                                <Nav.Item>
                                    <Nav.Link eventKey="production">
                                        Produção
                                    </Nav.Link>
                                </Nav.Item>
                            </Nav>
                        </Col>
                        <Col sm={9}>
                            <Tab.Content>
                                <Tab.Pane eventKey="structure">
                                    {/* ... Code for the "Estrutura" tab */}

                                    <h5>Informação da Estrutura</h5>
                                    <hr />
                                    <div className="table-container">
                                        <table className="table">
                                            <thead>
                                                <tr>
                                                    <th>Nome</th>
                                                    <th>Tipo</th>
                                                    <th>Extensão</th>
                                                    <th>Altura Perna [A]</th>
                                                    <th>Altura Perna [B]</th>
                                                    <th>Altura Perna [C]</th>
                                                    <th>Altura Perna [D]</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                <tr>
                                                    <td>{infos.tower.Name}</td>
                                                    <td>{infos.tower.Type}</td>
                                                    <td>
                                                        {infos.tower.Extension}
                                                    </td>
                                                    <td>{infos.tower.HA}</td>
                                                    <td>{infos.tower.HB}</td>
                                                    <td>{infos.tower.HC}</td>
                                                    <td>{infos.tower.HD}</td>
                                                </tr>
                                            </tbody>
                                        </table>
                                    </div>

                                    <h5>Informação Geotécnica</h5>
                                    <hr />
                                    {towerinfo.foundationProjectMC && (
                                        <div className="table-container">
                                            <table className="table">
                                                <thead>
                                                    <tr>
                                                        <th>Fundação MC</th>
                                                        <th>Código/Rev</th>
                                                        <th>Descrição</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    <tr>
                                                        <td>
                                                            {
                                                                towerinfo
                                                                    .foundationProjectMC
                                                                    .name
                                                            }
                                                        </td>
                                                        <td>
                                                            {towerinfo
                                                                .foundationProjectMC
                                                                .code +
                                                                "-" +
                                                                towerinfo
                                                                    .foundationProjectMC
                                                                    .revision}
                                                        </td>
                                                        <td>
                                                            {
                                                                towerinfo
                                                                    .foundationProjectMC
                                                                    .description
                                                            }
                                                        </td>
                                                    </tr>
                                                </tbody>
                                            </table>
                                        </div>
                                    )}

                                    {towerinfo.foundationProjectFoot && (
                                        <div className="table-container">
                                            <table className="table">
                                                <thead>
                                                    <tr>
                                                        <th>Fundação Pernas</th>
                                                        <th>Código/Rev</th>
                                                        <th>Descrição</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    <tr>
                                                        <td>
                                                            {
                                                                towerinfo
                                                                    .foundationProjectFoot
                                                                    .name
                                                            }
                                                        </td>
                                                        <td>
                                                            {towerinfo
                                                                .foundationProjectFoot
                                                                .code +
                                                                "-" +
                                                                towerinfo
                                                                    .foundationProjectFoot
                                                                    .revision}
                                                        </td>
                                                        <td>
                                                            {
                                                                towerinfo
                                                                    .foundationProjectFoot
                                                                    .description
                                                            }
                                                        </td>
                                                    </tr>
                                                </tbody>
                                            </table>
                                        </div>
                                    )}
                                </Tab.Pane>
                                <Tab.Pane eventKey="environmental">
                                    {/* ... Code for the "Status Ambiental" tab */}

                                    <h5>Status Ambiental</h5>
                                    <hr />
                                    <div className="table-container">
                                        <table className="table">
                                            <thead>
                                                <tr>
                                                    <th>Tipo</th>
                                                    <th>Status</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {infos.impediments.map(
                                                    (item, index) => (
                                                        <tr key={index}>
                                                            <td>
                                                                {
                                                                    item.ImpedimentType
                                                                }
                                                            </td>
                                                            <td>
                                                                {item.Status}
                                                            </td>
                                                        </tr>
                                                    ),
                                                )}
                                            </tbody>
                                        </table>
                                    </div>
                                </Tab.Pane>
                                <Tab.Pane eventKey="production">
                                    <h5>Produção</h5>
                                    <hr />
                                    <div className="table-container">
                                        <table className="table">
                                            <thead>
                                                <tr>
                                                    <th>Atividade</th>
                                                    <th></th>
                                                    <th>Data de execução</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {currentItems.map(
                                                    (item, index) => (
                                                        <tr key={index}>
                                                            <td>
                                                                {item.activitie}
                                                            </td>
                                                            <td>
                                                                <img
                                                                    src={
                                                                        item.icon
                                                                    }
                                                                    alt={
                                                                        item.activitie
                                                                    }
                                                                    width={30}
                                                                    height={30}
                                                                />
                                                            </td>
                                                            <td>{item.date}</td>
                                                        </tr>
                                                    ),
                                                )}
                                            </tbody>
                                        </table>
                                    </div>
                                    <Pagination>
                                        {Array.from({
                                            length: Math.ceil(
                                                towerProduction.length /
                                                    itemsPerPage,
                                            ),
                                        }).map((_, index) => (
                                            <Pagination.Item
                                                key={index}
                                                active={
                                                    index + 1 === currentPage
                                                }
                                                onClick={() =>
                                                    paginate(index + 1)
                                                }
                                            >
                                                {index + 1}
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

export default DiagramTowerDetails;
