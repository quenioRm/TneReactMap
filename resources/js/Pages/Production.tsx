import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import { Head } from "@inertiajs/react";
import { PageProps } from "@/types";
import { SetStateAction, useState } from "react";
import {
    Modal,
    Table,
    Tabs,
    Tab,
    Pagination,
    Button,
    Row,
    Col,
    Container,
} from "react-bootstrap";
import ProductionTable from "../Components/ProductionComponents/ProductionTable";
import ProductionTableDailyTable from "../Components/ProductionComponents/ProductionTableDailyTable";
import TowerStatusChart from "../Components/ProductionComponents/TowerStatusChart";
import ImpedimentsGraph from "../Components/ProductionComponents/ImpedimentsGraph";
import TowerFreeReport from "../Components/ProductionComponents/TowerFreeReport";

export default function Production({ auth }: PageProps) {
    const [activeTab, setActiveTab] = useState("info");

    const handleTabSelect = (tab: string | null) => {
        if (tab !== null) {
            setActiveTab(tab);
        }
    };

    return (
        <AuthenticatedLayout
            user={auth.user}
            header={
                <div className="d-flex justify-content-between align-items-center">
                    <h2 className="font-weight-bold text-xl text-gray-800">
                        Controle TNE
                    </h2>
                    <div className="d-flex"></div>
                </div>
            }
        >
            <Head title="Produção" />

            {/* Include the Tabs component */}
            <Tabs activeKey={activeTab} onSelect={handleTabSelect}>
                <Tab eventKey="info" title="Resumo Produção Geral">
                    <ProductionTable />
                </Tab>
                <Tab eventKey="prodmonth" title="Produção por período">
                    <ProductionTableDailyTable />
                </Tab>
                <Tab eventKey="towerreceive" title="Recebimentos de Estruturas">
                    <TowerStatusChart />
                </Tab>
                <Tab eventKey="towerimpediments" title="Impedimentos">
                    <ImpedimentsGraph />
                </Tab>
                <Tab
                    eventKey="towerfreereport"
                    title="Estruturas 100% Liberadas"
                >
                    <TowerFreeReport />
                </Tab>
            </Tabs>
        </AuthenticatedLayout>
    );
}
