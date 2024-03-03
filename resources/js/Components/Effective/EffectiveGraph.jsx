import React, { useEffect, useRef } from "react";
import Highcharts from "highcharts";

// Import the necessary Highcharts modules
import HighchartsExporting from "highcharts/modules/exporting";
import HighchartsExportData from "highcharts/modules/export-data";

HighchartsExporting(Highcharts); // Activate the exporting module
HighchartsExportData(Highcharts); // Activate the data exporting module

const EffectiveGraph = ({ data }) => {
    const chartContainerRef = useRef(null);

    useEffect(() => {
        if (chartContainerRef.current && data.length > 0) {
            const categories = data.map(entry => `${entry.business} - ${entry.activity}`); // Concatena Empresa e Projeto/Atividade
            const directData = data.map(entry => entry.direct); // Extrai os valores diretos
            const indirectData = data.map(entry => entry.indirect); // Extrai os valores indiretos

            // Configure as opções do gráfico de barras
            const options = {
                chart: {
                    type: "bar",
                    renderTo: chartContainerRef.current, // Use a referência do DOM
                    height: 600, // Altura do gráfico
                },
                title: {
                    text: "Efetivo de Obra por Empresa e Projeto/Atividade",
                },
                xAxis: {
                    categories: categories,
                    title: {
                        text: null,
                    },
                },
                yAxis: {
                    min: 0,
                    title: {
                        text: "",
                        align: "high",
                    },
                    labels: {
                        overflow: "justify",
                    },
                },
                tooltip: {
                    valueSuffix: "",
                },
                plotOptions: {
                    bar: {
                        dataLabels: {
                            enabled: true,
                        },
                        colorByPoint: true,
                    },
                },
                credits: {
                    enabled: false,
                },
                series: [
                    {
                        name: "Direto",
                        data: directData,
                    },
                    {
                        name: "Indireto",
                        data: indirectData,
                    },
                ],
            };

            // Renderiza o gráfico no elemento DOM com base na referência do DOM
            Highcharts.chart(options);
        }
    }, [data]);

    return (
        <div ref={chartContainerRef} style={{ width: "100%", height: "600px" }}>
            O gráfico de barras será exibido aqui.
        </div>
    );
};

export default EffectiveGraph;
