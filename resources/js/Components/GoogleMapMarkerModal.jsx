import React, { useState, useEffect } from 'react';
import { Modal, Table, Tabs, Tab, Pagination } from 'react-bootstrap';
import Gallery from 'react-image-gallery';
import 'react-image-gallery/styles/css/image-gallery.css';
import axios from 'axios';

const GoogleMapMarkerModal = ({ markerInfo, onClose }) => {
  const [towerImages, setTowerImages] = useState([]);
  const [towerProduction, setTowerProduction] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('coordinates');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(5); // Adjust the number of items per page as needed

  useEffect(() => {
    if (markerInfo) {
      fetchTowerImages();
      fetchTowerProduction();
    }
  }, [markerInfo]);

  const fetchTowerImages = async () => {
    try {
      const response = await axios.get(`/api/get-towerimages/${markerInfo.label.towerId}`);
      setTowerImages(response.data.files);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching tower images:', error);
    }
  };

  const fetchTowerProduction = async () => {
    try {
      const response = await axios.get(`/api/get-towerproduction/${markerInfo.label.towerId}/${markerInfo.label.project}`);
      setTowerProduction(response.data);
    } catch (error) {
      console.error('Error fetching tower production:', error);
    }
  };

  const images = towerImages.map((image) => ({
    original: image,
    thumbnail: image,
  }));

  const handleTabSelect = (tab) => {
    setActiveTab(tab);
  };

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = towerProduction.slice(indexOfFirstItem, indexOfLastItem);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  return (
    <Modal show={markerInfo !== null} onHide={onClose} size="lg">
      <Modal.Header closeButton>
        <Modal.Title>{markerInfo ? markerInfo.label.text + " - " + markerInfo.label.project : ''}</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        {markerInfo ? (
          <div>
            <Tabs activeKey={activeTab} onSelect={handleTabSelect}>
              <Tab eventKey="coordinates" title="Coordenadas">
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
              </Tab>
              <Tab eventKey="gallery" title="Galeria">
                {loading ? (
                  <p>Loading tower images...</p>
                ) : (
                  <>
                    {images.length > 0 && (
                      <div>
                        <Gallery items={images} />
                      </div>
                    )}
                  </>
                )}
              </Tab>
              <Tab eventKey="production" title="Produção">
                <div>
                  <Table striped bordered hover>
                    <thead>
                      <tr>
                        <th>Atividade</th>
                        <th>Data de execução</th>
                      </tr>
                    </thead>
                    <tbody>
                      {currentItems.map((tower, index) => (
                        <tr key={index}>
                          <td>{tower.activitie}</td>
                          <td>{tower.date}</td>
                        </tr>
                      ))}
                    </tbody>
                  </Table>
                  <Pagination>
                    {Array.from({ length: Math.ceil(towerProduction.length / itemsPerPage) }).map((_, index) => (
                      <Pagination.Item
                        key={index}
                        active={index + 1 === currentPage}
                        onClick={() => paginate(index + 1)}
                      >
                        {index + 1}
                      </Pagination.Item>
                    ))}
                  </Pagination>
                </div>
              </Tab>
            </Tabs>
          </div>
        ) : null}
      </Modal.Body>
      <Modal.Footer>
        {/* ... (Footer content) */}
      </Modal.Footer>
    </Modal>
  );
};

export default GoogleMapMarkerModal;
