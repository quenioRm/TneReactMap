import React, { useEffect, useRef } from 'react';
import Highcharts from 'highcharts';

// Import the necessary Highcharts modules
import HighchartsExporting from 'highcharts/modules/exporting';
import HighchartsExportData from 'highcharts/modules/export-data';

HighchartsExporting(Highcharts); // Activate the exporting module
HighchartsExportData(Highcharts); // Activate the data exporting module

const TowerFreeReportGraphCompare = ({ categories, quantities, colors, name }) => {
  const chartContainerRef = useRef(null);

  useEffect(() => {
    if (chartContainerRef.current) {
      // Configure the bar chart options
      const options = {
        chart: {
          type: 'bar',
          renderTo: chartContainerRef.current, // Use the DOM reference
        },
        title: {
          text: name,
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
            text: '',
            align: 'high',
          },
          labels: {
            overflow: 'justify',
          },
        },
        tooltip: {
          valueSuffix: '',
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
            name: '',
            data: quantities,
            colors: colors,
          },
        ],
      };

      // Render the chart to the DOM element based on the DOM reference
      Highcharts.chart(options);
    }
  }, [categories, quantities, colors]);

  return (
    <div ref={chartContainerRef} style={{ width: '100%', height: '400px' }}>
      The bar chart will be displayed here.
    </div>
  );
};

export default TowerFreeReportGraphCompare;
