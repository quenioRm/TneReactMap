import React, { useState } from 'react';
import { Modal, Button, Form, Dropdown } from 'react-bootstrap';
import ImageUploadButton from './ImageUploadButton'; // Certifique-se de ter o componente ImageUploadButton

const MarkerConfigModal = ({ show, onHide, onSave }) => {
  const [atividade, setAtividade] = useState('');
  const [icone, setIcone] = useState('');
  const [selectedMarker, setSelectedMarker] = useState('');
  const [googleIcons] = useState([ /* Adicione aqui os ícones do Google */ ]);

  const handleSave = () => {
    onSave({ atividade, icone, selectedMarker });
    onHide();
  };

  return (
    <Modal show={show} onHide={onHide}>
      <Modal.Header closeButton>
        <Modal.Title>Configurar Marcador</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Form>
          <Form.Group controlId="formAtividade">
            <Form.Label>Nome da atividade</Form.Label>
            <Form.Control
              type="text"
              placeholder="Digite a atividade"
              value={atividade}
              onChange={(e) => setAtividade(e.target.value)}
            />
          </Form.Group>

          <Form.Group controlId="formIcone">
            <Form.Label>Tipo de Ícone</Form.Label>
            <Dropdown>
              <Dropdown.Toggle variant="success" id="dropdown-basic">
                {selectedMarker ? selectedMarker : 'Selecione o tipo de marcador'}
              </Dropdown.Toggle>

              <Dropdown.Menu>
                <Dropdown.Item onClick={() => setSelectedMarker('google-marker')}>
                  Marcador do Google
                </Dropdown.Item>
                <Dropdown.Item onClick={() => setSelectedMarker('custom-marker')}>
                  Carregar Ícone Personalizado
                </Dropdown.Item>
              </Dropdown.Menu>
            </Dropdown>
          </Form.Group>

          {selectedMarker === 'custom-marker' && (
            <Form.Group controlId="formCustomIcon">
              <Form.Label>Ícone Personalizado</Form.Label>
              <ImageUploadButton onUpload={(files) => setIcone(files[0])} />
            </Form.Group>
          )}

          {selectedMarker === 'google-marker' && (
            <Form.Group controlId="formGoogleIcons">
              <Form.Label>Selecione um ícone do Google</Form.Label>
              <Dropdown>
                <Dropdown.Toggle variant="success" id="dropdown-google-icons">
                  {icone ? icone : 'Selecione um ícone'}
                </Dropdown.Toggle>

                <Dropdown.Menu>
                  {googleIcons.map((googleIcon, index) => (
                    <Dropdown.Item key={index} onClick={() => setIcone(googleIcon)}>
                      {googleIcon.name}
                    </Dropdown.Item>
                  ))}
                </Dropdown.Menu>
              </Dropdown>
            </Form.Group>
          )}
        </Form>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={onHide}>
          Fechar
        </Button>
        <Button variant="primary" onClick={handleSave}>
          Salvar
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default MarkerConfigModal;
