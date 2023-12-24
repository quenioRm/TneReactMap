import React from 'react';
import { Modal, Button, Table } from 'react-bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';
import Gallery from 'react-image-gallery';

const GoogleMapMarkerModal = ({ markerInfo, onClose }) => {
   const images = [
    // Adicione objetos de imagem conforme necessário
    { original: 'URL_DA_IMAGEM_1', thumbnail: 'URL_DA_IMAGEM_1' },
    { original: 'URL_DA_IMAGEM_2', thumbnail: 'URL_DA_IMAGEM_2' },
    // ...
  ];

  return (
    <Modal show={markerInfo !== null} onHide={onClose}>
      <Modal.Header closeButton>
        <Modal.Title>{markerInfo ? markerInfo.label.text : ""}</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        {markerInfo && (
          <div>
            <Table striped bordered hover>
              <tbody>
                <tr>
                  <td><strong>X</strong></td>
                  <td>{markerInfo.position.utmx}</td>
                </tr>
                <tr>
                  <td><strong>Y</strong></td>
                  <td>{markerInfo.position.utmy}</td>
                </tr>
              </tbody>
            </Table>

            <hr />

            <h4>Image Gallery</h4>
            <Gallery items={images} />
          </div>
        )}
      </Modal.Body>
      <Modal.Footer>
      </Modal.Footer>
    </Modal>
  );
};

export default GoogleMapMarkerModal;
