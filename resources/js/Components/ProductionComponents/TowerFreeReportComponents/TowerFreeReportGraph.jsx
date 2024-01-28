import React, { useEffect } from "react";
import Highcharts from "highcharts";
import Highcharts3D from "highcharts/highcharts-3d";

// Importe os módulos necessários do Highcharts
import HighchartsExporting from "highcharts/modules/exporting";
import HighchartsExportData from "highcharts/modules/export-data";

Highcharts3D(Highcharts); // Ative o módulo 3D
HighchartsExporting(Highcharts); // Ative os módulos de exportação

const TowerFreeReportGraph = ({ data, name, containerId }) => {
    useEffect(() => {
        // Mapeie os dados para incluir a porcentagem e a quantidade
        const total = data.reduce((acc, item) => acc + item.y, 0);
        const formattedData = data.map((item) => ({
            name: item.name,
            y: item.y,
            customLabel: `<b>${item.name}: ${item.y} (${(
                (item.y / total) *
                100
            ).toFixed(1)}%)<b/>`,
        }));

        // Configure as opções do gráfico
        const options = {
            chart: {
                type: "pie",
                options3d: {
                    enabled: true,
                    alpha: 45,
                    beta: 0,
                },
            },
            title: {
                text: name,
                align: "left",
            },
            accessibility: {
                point: {
                    valueSuffix: "%",
                },
            },
            tooltip: {
                pointFormat: "{point.customLabel}",
            },
            plotOptions: {
                pie: {
                    allowPointSelect: true,
                    cursor: "pointer",
                    depth: 35,
                    dataLabels: {
                        enabled: true,
                        format: "{point.name}",
                    },
                    colors: ["#008000", "#FF5733"], // Verde escuro e vermelho
                },
            },
            series: [
                {
                    type: "pie",
                    name: "Status",
                    data: formattedData,
                },
            ],
        };

        // Renderize o gráfico no elemento com id 'container' usando as opções configuradas
        Highcharts.chart(containerId, options);
    }, [data]);

    return (
        <div id={containerId} style={{ width: "100%", height: "400px" }}>
            O gráfico será exibido aqui.
        </div>
    );
};

export default TowerFreeReportGraph;
