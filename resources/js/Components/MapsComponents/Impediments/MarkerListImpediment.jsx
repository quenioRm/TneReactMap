// Import React, useState, and the required Bootstrap components
import React, { useState } from 'react';
import { Table, Button, Pagination } from 'react-bootstrap';
import axios from 'axios';

// Define the MarkerList component
const MarkerListImpediment = ({ markers, onEdit, onDelete }) => {
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
            <th>ImpedimentType</th>
            <th>Status</th>
            <th>Icon</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {currentMarkers.map((marker) => (
            <tr key={marker.id}>
              <td>{marker.ImpedimentType}</td>
              <td>{marker.Status}</td>
              {/* Use an <img> tag to display the icon with a resolution of 30x30 */}
              <td>
                <img src={'storage/' + marker.Icon} alt={marker.ImpedimentType} width={30} height={30} />
              </td>
              <td>
                <Button variant="info" className="mr-2" onClick={() => onEdit(marker)}>
                  Edit
                </Button>
                <Button variant="danger" onClick={() => onDelete(marker.id)}>
                  Delete
                </Button>
              </td>
            </tr>
          ))}
        </tbody>
      </Table>
      {/* Pagination component */}
      <Pagination>
        {Array.from({ length: Math.ceil(markers.length / itemsPerPage) }).map((_, index) => (
          <Pagination.Item key={index} active={index + 1 === currentPage} onClick={() => paginate(index + 1)}>
            {index + 1}
          </Pagination.Item>
        ))}
      </Pagination>
    </>
  );
};

// Export the MarkerList component
export default MarkerListImpediment;
