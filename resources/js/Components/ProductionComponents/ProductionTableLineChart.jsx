import React from "react";
import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer,
} from "recharts";

const getRandomColor = () => {
    const letters = "0123456789ABCDEF";
    let color = "#";
    for (let i = 0; i < 6; i++) {
        color += letters[Math.floor(Math.random() * 16)];
    }
    return color;
};

const data1 = [
    {
        date: "01-10-2023",
        P4: 0,
        name: "LT 500 kV ENG. LECHUGA - EQUADOR-T2B",
    },
    {
        date: "02-10-2023",
        P4: 1,
        name: "LT 500 kV ENG. LECHUGA - EQUADOR-T2B",
    },
    {
        date: "03-10-2023",
        P4: 2,
        name: "LT 500 kV ENG. LECHUGA - EQUADOR-T2B",
    },
    {
        date: "04-10-2023",
        P4: 4,
        name: "LT 500 kV ENG. LECHUGA - EQUADOR-T2B",
    },
    {
        date: "05-10-2023",
        P4: 6,
        name: "LT 500 kV ENG. LECHUGA - EQUADOR-T2B",
    },
    {
        date: "06-10-2023",
        P4: 8,
        name: "LT 500 kV ENG. LECHUGA - EQUADOR-T2B",
    },
    {
        date: "07-10-2023",
        P4: 8,
        name: "LT 500 kV ENG. LECHUGA - EQUADOR-T2B",
    },
    {
        date: "08-10-2023",
        P4: 8,
        name: "LT 500 kV ENG. LECHUGA - EQUADOR-T2B",
    },
    {
        date: "09-10-2023",
        P4: 8,
        name: "LT 500 kV ENG. LECHUGA - EQUADOR-T2B",
    },
    {
        date: "10-10-2023",
        P4: 10,
        name: "LT 500 kV ENG. LECHUGA - EQUADOR-T2B",
    },
    {
        date: "11-10-2023",
        P4: 11,
        name: "LT 500 kV ENG. LECHUGA - EQUADOR-T2B",
    },
    {
        date: "12-10-2023",
        P4: 11,
        name: "LT 500 kV ENG. LECHUGA - EQUADOR-T2B",
    },
    {
        date: "13-10-2023",
        P4: 12,
        name: "LT 500 kV ENG. LECHUGA - EQUADOR-T2B",
    },
    {
        date: "14-10-2023",
        P4: 16,
        name: "LT 500 kV ENG. LECHUGA - EQUADOR-T2B",
    },
    {
        date: "15-10-2023",
        P4: 16,
        name: "LT 500 kV ENG. LECHUGA - EQUADOR-T2B",
    },
    {
        date: "16-10-2023",
        P4: 18,
        name: "LT 500 kV ENG. LECHUGA - EQUADOR-T2B",
    },
    {
        date: "17-10-2023",
        P4: 19,
        name: "LT 500 kV ENG. LECHUGA - EQUADOR-T2B",
    },
    {
        date: "18-10-2023",
        P4: 19,
        name: "LT 500 kV ENG. LECHUGA - EQUADOR-T2B",
    },
    {
        date: "19-10-2023",
        P4: 23,
        name: "LT 500 kV ENG. LECHUGA - EQUADOR-T2B",
    },
    {
        date: "20-10-2023",
        P4: 26,
        name: "LT 500 kV ENG. LECHUGA - EQUADOR-T2B",
    },
    {
        date: "21-10-2023",
        P4: 27,
        name: "LT 500 kV ENG. LECHUGA - EQUADOR-T2B",
    },
    {
        date: "22-10-2023",
        P4: 27,
        name: "LT 500 kV ENG. LECHUGA - EQUADOR-T2B",
    },
    {
        date: "23-10-2023",
        P4: 27,
        name: "LT 500 kV ENG. LECHUGA - EQUADOR-T2B",
    },
    {
        date: "24-10-2023",
        P4: 31,
        name: "LT 500 kV ENG. LECHUGA - EQUADOR-T2B",
    },
    {
        date: "25-10-2023",
        P4: 32,
        name: "LT 500 kV ENG. LECHUGA - EQUADOR-T2B",
    },
    {
        date: "26-10-2023",
        P4: 35,
        name: "LT 500 kV ENG. LECHUGA - EQUADOR-T2B",
    },
    {
        date: "27-10-2023",
        P4: 37,
        name: "LT 500 kV ENG. LECHUGA - EQUADOR-T2B",
    },
    {
        date: "28-10-2023",
        P4: 37,
        name: "LT 500 kV ENG. LECHUGA - EQUADOR-T2B",
    },
    {
        date: "29-10-2023",
        P4: 37,
        name: "LT 500 kV ENG. LECHUGA - EQUADOR-T2B",
    },
    {
        date: "30-10-2023",
        P4: 37,
        name: "LT 500 kV ENG. LECHUGA - EQUADOR-T2B",
    },
    {
        date: "31-10-2023",
        P4: 38,
        name: "LT 500 kV ENG. LECHUGA - EQUADOR-T2B",
    },
];

const ProductionTableLineChart = ({ chartData, selectedProjects }) => {
    // Gerar uma string única baseada no conteúdo de chartData.
    // Isso pode ser um timestamp ou um identificador único derivado dos dados.
    const chartKey = JSON.stringify(chartData);

    return (
        <div style={{ width: "100%", height: 600 }}>
            {chartData && selectedProjects.length > 0 ? (
                <ResponsiveContainer key={chartKey}>
                    <LineChart data={chartData}>
                        <XAxis dataKey="date" style={{ fontSize: "8px" }} />
                        <YAxis />
                        <CartesianGrid stroke="#eee" strokeDasharray="5 5" />
                        <Tooltip />
                        <Legend />
                        {selectedProjects.map((project) => (
                            <Line
                                key={project.id}
                                type="monotone"
                                dataKey={`P${project.id}`}
                                stroke={getRandomColor()}
                                name={project.name}
                            />
                        ))}
                    </LineChart>
                </ResponsiveContainer>
            ) : (
                <p>Carregando dados ou nenhum projeto selecionado...</p>
            )}
        </div>
    );
};

export default ProductionTableLineChart;
