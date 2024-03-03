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
import EffectiveMo from '../Components/Effective/EffectiveMo'

export default function Effective({ auth }: PageProps) {
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
            <Head title="Efetivo" />

        <EffectiveMo />

        </AuthenticatedLayout>
    );
}
