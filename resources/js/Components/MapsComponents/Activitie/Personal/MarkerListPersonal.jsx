// Import React, useState, and the required Bootstrap components
import React, { useState } from "react";
import { Table, Button, Pagination, Spinner } from "react-bootstrap";
import GaleryImagesFromPersonal from '../../../../Components/GaleryImagesFromPersonal';

// Define the MarkerListPersonal component
const MarkerListPersonal = ({ markers, onEdit, onDelete, permission, production, markerInfo }) => {
    // Set the number of items per page
    const itemsPerPage = 5;
    // Initialize the currentPage state
    const [currentPage, setCurrentPage] = useState(1);

    // Calculate the index of the last and first items on the current page
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    // Slice the markers array to get the markers for the current page
    const currentMarkers = markers.slice(indexOfFirstItem, indexOfLastItem);

    // Define the paginate function to handle page changes
    const paginate = (pageNumber) => setCurrentPage(pageNumber);

    const [loading, setLoading] = useState(true);

    const findProductionItem = (activity) => { // Define findProductionItem as a function
        // console.log(production)
        const foundItem = production.find((item) => item.activity === activity);
        if (foundItem) {
          return foundItem;
        } else {
          return null;
        }
    };

    const  calcPercentage = (a,b) => {
        const percentage = a / b;
        return percentage.toLocaleString(undefined, {
            style: "percent",
            minimumFractionDigits: 2,
        });
    }

    setTimeout(() => {
        setLoading(false);
    }, 2000);

    const calcDiferente = (a, b) => {
        if(a>b){
            return a - b;
        }
        return 0;
    }

    const [showUploadModal, setShowUploadModal] = useState(false);
    const [selectedAcitivity, setSelectedAcitivity] = useState({});

    const handleShowModalUpload = (activity) => {
        setSelectedAcitivity(activity)
        setShowUploadModal(true);
    };

    const handleCloseModalUpload = () => {
        setShowUploadModal(false);
    };


    // Return the JSX for the MarkerListPersonal component
    return (
        <>
            {loading ? ( // Render a spinner while loading
                <div className="text-center">
                    <Spinner animation="border" role="status">
                        <span className="visually-hidden">Loading...</span>
                    </Spinner>
                </div>
            ) : (
                <>
                    <Table striped bordered hover>
                        <thead>
                            <tr>
                                <th>Atividade</th>
                                <th>Unidade</th>
                                <th>Ícone</th>
                                <th>Previsto</th>
                                <th>Realizado</th>
                                <th>Falta</th>
                                <th>% Avanço</th>
                                <th>Ações</th>
                            </tr>
                        </thead>
                        <tbody>
                            {currentMarkers.map((marker) => (
                                <tr key={marker.id}>
                                    <td>{marker.activity}</td>
                                    <td>{marker.unity}</td>
                                    <td>
                                        <img
                                            src={"storage/" + marker.icon}
                                            alt={marker.unity}
                                            width={30}
                                            height={30}
                                        />
                                    </td>
                                    <td>{marker.previouscount}</td>
                                    <td>{findProductionItem(marker.activity)?.count ?? 0}</td>
                                    <td>{calcDiferente(marker.previouscount, findProductionItem(marker.activity)?.count ?? 0)}</td>
                                    <td>{calcPercentage(findProductionItem(marker.activity)?.count ?? 0, marker.previouscount)}</td>
                                    <td>
                                    <Button variant="primary" onClick={() => handleShowModalUpload(marker)} >
                                               Ver / Anexar Imagem
                                            </Button>
                                    {permission && (

                                        <>
                                                                                    <Button
                                                variant="info"
                                                className="mr-2"
                                                onClick={() => onEdit(marker)}
                                            >
                                                Editar
                                            </Button>
                                            <Button
                                                variant="danger"
                                                onClick={() => onDelete(marker.id)}
                                            >
                                                Deletar
                                            </Button>
                                        </>


                                    )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </Table>
                    <Pagination>
                        {Array.from({
                            length: Math.ceil(markers.length / itemsPerPage),
                        }).map((_, index) => (
                            <Pagination.Item
                                key={index}
                                active={index + 1 === currentPage}
                                onClick={() => setCurrentPage(index + 1)}
                            >
                                {index + 1}
                            </Pagination.Item>
                        ))}
                    </Pagination>
                </>
            )}
            <GaleryImagesFromPersonal markerInfo={markerInfo} towerProduction={selectedAcitivity} show={showUploadModal}
             onClose={handleCloseModalUpload}/>
        </>
    );

};

// Export the MarkerListPersonal component
export default MarkerListPersonal;
