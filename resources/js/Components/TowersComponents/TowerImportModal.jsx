import React, { useState, useEffect } from "react";
import { Modal, Button, Form, ProgressBar } from "react-bootstrap";
import { ToastContainer, toast } from "react-toastify";

const ImportTowersModal = ({ show, onHide }) => {
    const [file, setFile] = useState(null);
    const [progress, setProgress] = useState(0);
    const [importing, setImporting] = useState(false);

    const handleFileChange = (e) => {
        setFile(e.target.files[0]);
    };

    const handleImportTowers = async (formData) => {
        setImporting(true); // Set the importing state to true when starting the import
        try {
            const response = await fetch("/towers/import", {
                method: "POST",
                body: formData,
                headers: {
                    // Add necessary headers, such as authorization headers
                },
            });

            if (response.ok) {
                toast.success("Estruturas importadas com sucesso!");
            } else {
                toast.error(
                    "Erro ao importar estruturas: " + response.statusText,
                );
            }
        } catch (error) {
            toast.error("Erro ao importar estruturas: " + error.message);
        } finally {
            setImporting(false); // Set the importing state to false regardless of success or failure
        }
    };

    const handleImport = async () => {
        // clearInterval(progressTimer);

        if (file) {
            const formData = new FormData();
            formData.append("file", file);

            setProgress(0); // Reset progress before starting the import
            setImporting(true); // Set the importing state to true

            try {
                const interval = 500; // Intervalo em milissegundos
                const maxProgress = 100;
                let currentProgress = 0;

                const progressTimer = setInterval(() => {
                    currentProgress += (interval / maxProgress) * 100;
                    setProgress(Math.min(currentProgress, maxProgress));

                    if (currentProgress >= maxProgress) {
                        clearInterval(progressTimer);
                    }
                }, interval);

                await handleImportTowers(formData);
            } finally {
                setImporting(false); // Set the importing state to false after the import is completed
                setTimeout(() => {
                    window.location.reload();
                }, 8000);
            }
        }
    };

    // useEffect(() => {
    //     return () => {
    //         // Cleanup function to clear the interval in case the component unmounts
    //         clearInterval(progressTimer);
    //     };
    // }, []);

    return (
        <Modal show={show} onHide={onHide}>
            <Modal.Header closeButton>
                <Modal.Title>Importar Estruturas</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                <Form>
                    <Form.Group
                        controlId="formFile"
                        style={{ marginBottom: "15px" }}
                    >
                        <Form.Label>
                            Selecione o arquivo de estruturas
                        </Form.Label>
                        <Form.Control type="file" onChange={handleFileChange} />
                    </Form.Group>
                </Form>
                {importing && (
                    <ProgressBar
                        animated
                        now={progress}
                        label={`${Math.round(progress)}%`}
                    />
                )}
            </Modal.Body>
            <Modal.Footer>
                <Button
                    variant="primary"
                    onClick={handleImport}
                    disabled={importing}
                >
                    Importar
                </Button>
            </Modal.Footer>
            <ToastContainer />
        </Modal>
    );
};

export default ImportTowersModal;
