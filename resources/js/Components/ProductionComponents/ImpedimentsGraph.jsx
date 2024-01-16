import React, { useEffect, useState } from 'react';
import { PieChart, Pie, Cell, Tooltip, Legend } from 'recharts';
import axios from "../../Components/axiosInstance";
import { Row, Col, Card } from 'react-bootstrap';

const COLORS = ['#006400', '#FF0000']; // Verde escuro para "Liberado" e Vermelho para "Não Liberado"

const ImpedimentsGraph = () => {
  const [data, setData] = useState([]);

  useEffect(() => {
    async function fetchData() {
      try {
        const response = await axios.get('/api/towers/getImpedimentsbytype');
        const formattedData = transformJsonToChartData(response.data);
        setData(formattedData);
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    }

    fetchData();
  }, []);

  // Função para transformar o JSON em dados formatados para o Recharts
  function transformJsonToChartData(data) {
    const chartData = [];

    for (const lt in data) {
      const categories = data[lt];
      chartData.push({
        name: lt,
        categories: categories,
      });
    }

    return chartData;
  }

  // Calcula a porcentagem
  function calculatePercentage(liberado, nãoLiberado) {
    const total = liberado + nãoLiberado;
    return ((liberado / total) * 100).toFixed(2);
  }

  // Componente para renderizar um gráfico de pizza para uma categoria específica
  const CategoryPieChart = ({ categoryName, data }) => {
    return (
      <Col sm={12} md={4}>
        <div className="d-inline-block">
          <h5>{categoryName}</h5>
          <PieChart width={300} height={300}>
            <Pie
              data={[
                { name: `Liberado (${calculatePercentage(data.Liberado, data["Não Liberado"])}%)`, value: data.Liberado },
                { name: `Não Liberado (${calculatePercentage(data["Não Liberado"], data.Liberado)}%)`, value: data["Não Liberado"] },
              ]}
              nameKey="name"
              dataKey="value"
              cx="50%"
              cy="50%"
              innerRadius={60}
              outerRadius={80}
              fill={COLORS[0]}
              label
            >
              {[
                { name: `Liberado (${calculatePercentage(data.Liberado, data["Não Liberado"])}%)`, value: data.Liberado },
                { name: `Não Liberado (${calculatePercentage(data["Não Liberado"], data.Liberado)}%)`, value: data["Não Liberado"] },
              ].map((item, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index]} />
              ))}
            </Pie>
            <Tooltip />
            <Legend verticalAlign="bottom" height={36} />
          </PieChart>
        </div>
      </Col>
    );
  };

  // Verifique se os dados estão disponíveis antes de renderizar o componente
  if (data.length === 0) {
    return <p>Carregando...</p>;
  }

  return (
    <div className="impediments-graph">
      <Card>
        <Card.Header className="text-center">
          <h3>Impedimentos por Categoria</h3>
        </Card.Header>
        <Card.Body>
          {data.map((entry, index) => (
            <Card key={`lt-card-${index}`} className="mb-4">
              <Card.Header className="text-center">
                <h4>{entry.name}</h4>
              </Card.Header>
              <Card.Body>
                <Row className="text-center">
                  {Object.keys(entry.categories).map((category, idx) => (
                    <CategoryPieChart
                      key={`category-pie-${idx}`}
                      categoryName={category}
                      data={entry.categories[category]}
                    />
                  ))}
                </Row>
              </Card.Body>
            </Card>
          ))}
        </Card.Body>
      </Card>
    </div>
  );
};

export default ImpedimentsGraph;
