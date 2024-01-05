import React, { useEffect } from "react";
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

const DynamicLineChart = ({ chartData }) => {

    const processedData = {};
    let allDates = new Set();

    Object.entries(chartData).forEach(([date, dateInfo]) => {
        allDates.add(date);
        const { projects } = dateInfo;

        Object.keys(projects).forEach(projectKey => {
            const project = projects[projectKey];
            const projectId = projectKey.replace('project', ''); // Extrair o ID do projeto
            const productionKey = `productionInDayAcumulated${projectId}`;
            const uniqueKey = `${projectId}:${project.name}`;

            if (!processedData[uniqueKey]) {
                processedData[uniqueKey] = {
                    projectId: projectId,
                    projectName: project.name,
                    data: []
                };
            }

            processedData[uniqueKey].data.push({
                date,
                production: project[productionKey]
            });
        });
    });

    allDates = Array.from(allDates).sort();

    const lines = Object.keys(processedData).map((key) => {
        const { projectId, projectName, data } = processedData[key];
        const uniqueDataKey = `production${projectId}`; // Ensuring a unique dataKey

        // Ensure each line's data includes all dates
        const normalizedData = allDates.map(date => {
            const existingData = data.find(d => d.date === date);
            return {
                date,
                [uniqueDataKey]: existingData ? existingData.production : null // Use existing data or null if no data for this date
            };
        });

        return (
            <Line
                key={projectId}
                type="monotone"
                dataKey={uniqueDataKey}
                data={normalizedData}
                stroke={`#${Math.floor(Math.random() * 16777215).toString(16)}`} // Random color
                name={projectName}
            />
        );
    });
    return (
        <ResponsiveContainer width="100%" height={400}>
        <LineChart
            width={500}
            height={300}
            margin={{
                top: 5,
                right: 30,
                left: 20,
                bottom: 5,
            }}
        >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" style={{ fontSize: "10px" }} minTickGap={30} allowDuplicatedCategory={false} />
            <YAxis />
            <Tooltip />
            <Legend />
            {lines}
        </LineChart>
    </ResponsiveContainer>
    );
};

export default DynamicLineChart;
