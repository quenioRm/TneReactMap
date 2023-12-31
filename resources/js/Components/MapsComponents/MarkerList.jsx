import React from 'react';
import { Table, Button } from 'react-bootstrap';

const MarkerList = ({ markers, onEdit, onDelete }) => {
  return (
    <Table striped bordered hover>
      <thead>
        <tr>
          <th>Atividade</th>
          <th>Ícone</th>
          <th>Ações</th>
        </tr>
      </thead>
      <tbody>
        {markers.map((marker, index) => (
          <tr key={index}>
            <td>{marker.atividade}</td>
            <td>{marker.icone}</td>
            <td>
              <Button variant="info" onClick={() => onEdit(index)}>
                Editar
              </Button>
              <Button variant="danger" onClick={() => onDelete(index)}>
                Deletar
              </Button>
            </td>
          </tr>
        ))}
      </tbody>
    </Table>
  );
};

export default MarkerList;
