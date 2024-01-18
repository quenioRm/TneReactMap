import React, { useRef, useState } from "react";
import { Button, ProgressBar } from "react-bootstrap";

const ImageUploadButton = ({ onUpload }) => {
    const fileInputRef = useRef(null);
    const [uploadProgress, setUploadProgress] = useState(0);

    const handleUploadClick = () => {
        fileInputRef.current.click();
    };

    const handleFileChange = async (event) => {
        const files = event.target.files;
        if (files.length > 0) {
            // Simula um atraso no upload para demonstração da barra de progresso
            for (let progress = 0; progress <= 100; progress += 10) {
                await delay(300); // Aguarda 300ms (simulando o tempo de upload)
                setUploadProgress(progress);
            }

            // Chama a função de upload com os arquivos
            onUpload(files);

            // Reinicia o progresso após o upload
            setUploadProgress(0);
        }
    };

    const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

    return (
        <div>
            <input
                type="file"
                accept="image/*"
                ref={fileInputRef}
                style={{ display: "none" }}
                onChange={handleFileChange}
                multiple
            />

            <Button variant="primary" onClick={handleUploadClick}>
                Enviar Imagens
            </Button>
            
            {uploadProgress > 0 && (
                <div className="mt-2">
                    <ProgressBar
                        animated
                        now={uploadProgress}
                        label={`${uploadProgress}%`}
                    />
                </div>
            )}
        </div>
    );
};

export default ImageUploadButton;
