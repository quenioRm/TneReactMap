import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import { Head } from "@inertiajs/react";
import { PageProps } from "@/types";
import { useState } from "react";
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
import ProductionTable from '../Components/ProductionComponents/ProductionTable';

export default function Production({ auth }: PageProps) {
  const [activeTab, setActiveTab] = useState("info");

  const handleTabSelect = (tab) => {
    setActiveTab(tab);
  };

  return (
    <AuthenticatedLayout
      user={auth.user}
      header={
        <div className="d-flex justify-content-between align-items-center">
          <h2 className="font-weight-bold text-xl text-gray-800">Produção</h2>
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
        <Tab eventKey="gallery" title="Galeria">
          <h1>ola 2</h1>
        </Tab>
        <Tab eventKey="production" title="Produção">
          <h1>ola 3</h1>
        </Tab>
      </Tabs>
    </AuthenticatedLayout>
  );
}
