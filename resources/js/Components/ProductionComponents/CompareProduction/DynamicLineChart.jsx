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

const DynamicLineChart = ({ chartData }) => {
    const processedData = {};
    let allDates = new Set();

    // Iterate through each date entry in the provided data
    Object.entries(chartData).forEach(([date, dateInfo]) => {
        allDates.add(date); // Add the date to a set of all dates

        const { projects } = dateInfo; // Extract the projects

        // Iterate through each project
        Object.keys(projects).forEach((projectKey) => {
            const project = projects[projectKey];
            const projectId = projectKey.replace("project", ""); // Extract the project ID
            const productionKey = `productionInDayAcumulated${projectId}`;
            const uniqueKey = `${projectId}:${project.name}`;

            // If this project hasn't been seen before, initialize it
            if (!processedData[uniqueKey]) {
                processedData[uniqueKey] = {
                    projectId: projectId,
                    projectName: project.name,
                    data: [],
                };
            }

            // Add the production data for this date to the project's data
            processedData[uniqueKey].data.push({
                date,
                production: project[productionKey],
            });
        });
    });

    // Sort all dates
    allDates = Array.from(allDates).sort((a, b) => new Date(a) - new Date(b));

    // Create the lines for the chart based on the processed data
    const lines = Object.keys(processedData).map((key) => {
        const { projectId, projectName, data } = processedData[key];
        const uniqueDataKey = `production${projectId}`; // Unique key for the data

        // Normalize the data for each line to include all dates
        const normalizedData = allDates.map((date) => {
            const existingData = data.find((d) => d.date === date);
            return {
                date,
                [uniqueDataKey]: existingData ? existingData.production : null, // Use existing data or null if no data for this date
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
                <XAxis
                    dataKey="date"
                    style={{ fontSize: "10px" }}
                    minTickGap={30}
                    allowDuplicatedCategory={false}
                />
                <YAxis />
                <Tooltip />
                <Legend />
                {lines}
            </LineChart>
        </ResponsiveContainer>
    );
};

export default DynamicLineChart;
