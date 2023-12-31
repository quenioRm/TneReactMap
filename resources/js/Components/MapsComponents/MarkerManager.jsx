import React, { useState } from 'react';
import { Modal, Button, Container, Row, Col } from 'react-bootstrap';
import MarkerConfigModal from './MarkerConfigModal';
import MarkerList from './MarkerList';

const MarkerManager = ({ show, onHide }) => {
  const [editedMarker, setEditedMarker] = useState(null);
  const [markers, setMarkers] = useState([]);
  const [configModalShow, setConfigModalShow] = useState(false)

  const handleShowModal = (marker) => {
    setConfigModalShow(true);
  };

  const handleCloseModal = () => {
    setConfigModalShow(false);
  };

  const handleSaveMarker = (newMarker) => {
    if (editedMarker !== null) {
      // Editar marcador existente
      const updatedMarkers = [...markers];
      updatedMarkers[editedMarker.index] = newMarker;
      setMarkers(updatedMarkers);
    } else {
      // Adicionar novo marcador
      setMarkers([...markers, newMarker]);
    }
    // handleCloseModal(); // Fechar o modal após salvar
  };

  const handleDeleteMarker = (index) => {
    const updatedMarkers = [...markers];
    updatedMarkers.splice(index, 1);
    setMarkers(updatedMarkers);
    // handleCloseModal(); // Fechar o modal após excluir
  };

  return (
    <Modal show={show} onHide={onHide} size="lg">
      <Modal.Header closeButton>
        <Modal.Title>Gerenciar Marcadores</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Container>
          <Row className="mb-3">
            <Col>
              <Button variant="primary" onClick={handleShowModal}>
                Adicionar Marcador
              </Button>
            </Col>
          </Row>
          <Row>
            <Col>
              <MarkerList markers={markers} onEdit={handleShowModal} onDelete={handleDeleteMarker} />
            </Col>
          </Row>
        </Container>
            <MarkerConfigModal show={configModalShow} onHide={handleCloseModal}
            onSave={() => {}}
            onDelete={() =>{}}
            editedMarker={editedMarker}
            />
      </Modal.Body>
    </Modal>
  );
};

export default MarkerManager;
