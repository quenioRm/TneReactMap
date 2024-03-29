// Import React, useState, and the required Bootstrap components
import React, { useState } from "react";
import { Table, Button, Pagination } from "react-bootstrap";

// Define the MarkerList component
const PersonalMarkerList = ({ markers, onEdit, onDelete }) => {
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

    // Return the JSX for the MarkerList component
    return (
        <>
            <Table striped bordered hover>
                <thead>
                    <tr>
                        <th>Nome</th>
                        {/* <th>Coordenada [X]</th>
                        <th>Coordenada [Y]</th>
                        <th>Tipo</th> */}
                        <th>Icone</th>
                        <th>Ações</th>
                    </tr>
                </thead>
                <tbody>
                    {currentMarkers.map((marker, index) => (
                        <tr key={index}>
                            <td>{marker.name}</td>
                            {/* Use an <img> tag to display the icon with a resolution of 30x30 */}
                            {/* <td>{marker.coordinateX}</td>
                            <td>{marker.coordinateY}</td>
                            <td>{marker.type}</td> */}
                            <td>
                                <img
                                    src={"storage/" + marker.icon}
                                    alt={marker.name}
                                    width={50}
                                    height={50}
                                    style={{
                                        display: "block",
                                        margin: "0 auto",
                                        textAlign: "center",
                                    }}
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

// Export the MarkerList component
export default PersonalMarkerList;
