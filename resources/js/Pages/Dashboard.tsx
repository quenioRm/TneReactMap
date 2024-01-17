import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import { Head } from "@inertiajs/react";
import { PageProps } from "@/types";
import GoogleMap from "../Components/GoogleMap";

export default function Dashboard({ auth }: PageProps) {
    return (
        <AuthenticatedLayout
            user={auth.user}
            header={
                <div className="d-flex justify-content-between align-items-center">
                    <h2 className="font-weight-bold text-xl text-gray-800">
                        Controle TNE
                    </h2>
                    {/* Adicione seus botões à direita aqui */}
                    <div className="d-flex">
                        {/* <Button variant="primary" className="mr-2" onClick={handleOpenMarkerConfigModal}>
                      Configurar Marcador
                    </Button> */}
                        {/* <Button variant="primary" className="mr-2" onClick={handleOpenTowerSelect}>
                      Buscar Estrutura
                    </Button> */}
                    </div>
                </div>
            }
        >
            <Head title="Mapa de Acompanhamento" />

            <GoogleMap />
        </AuthenticatedLayout>
    );
}
