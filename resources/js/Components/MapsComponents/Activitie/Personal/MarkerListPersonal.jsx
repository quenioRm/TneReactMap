// Import React, useState, and the required Bootstrap components
import React, { useState } from "react";
import { Table, Button, Pagination } from "react-bootstrap";

// Define the MarkerListPersonal component
const MarkerListPersonal = ({ markers, onEdit, onDelete }) => {
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

    // Return the JSX for the MarkerListPersonal component
    return (
        <>
            <Table striped bordered hover>
                <thead>
                    <tr>
                        <th>Atividade</th>
                        <th>Unidade</th>
                        <th>Ícone</th>
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
                            <td>
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
                            </td>
                        </tr>
                    ))}
                </tbody>
            </Table>
            {/* Pagination component */}
            <Pagination>
                {Array.from({
                    length: Math.ceil(markers.length / itemsPerPage),
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
        </>
    );
};

// Export the MarkerListPersonal component
export default MarkerListPersonal;
