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
        Arqueologia_Liberado: categories["Arqueologia"]["Liberado"],
        Arqueologia_Não_Liberado: categories["Arqueologia"]["Não Liberado"],
        Fundiário_Liberado: categories["Fundiário"]["Liberado"],
        Fundiário_Não_Liberado: categories["Fundiário"]["Não Liberado"],
        Projeto_Liberado: categories["Projeto"]["Liberado"],
        Projeto_Não_Liberado: categories["Projeto"]["Não Liberado"],
      });
    }

    return chartData;
  }

  // Calcula a porcentagem
  function calculatePercentage(liberado, nãoLiberado) {
    const total = liberado + nãoLiberado;
    return ((liberado / total) * 100).toFixed(2);
  }

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
                  <Col sm={12} md={4}>
                    <div className="d-inline-block">
                      <h5>Arqueologia</h5>
                      <PieChart width={300} height={300}>
                        <Pie
                          data={[
                            { name: `Liberado (${calculatePercentage(entry.Arqueologia_Liberado, entry.Arqueologia_Não_Liberado)}%)`, value: entry.Arqueologia_Liberado },
                            { name: `Não Liberado (${calculatePercentage(entry.Arqueologia_Não_Liberado, entry.Arqueologia_Liberado)}%)`, value: entry.Arqueologia_Não_Liberado },
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
                            { name: `Liberado (${calculatePercentage(entry.Arqueologia_Liberado, entry.Arqueologia_Não_Liberado)}%)`, value: entry.Arqueologia_Liberado },
                            { name: `Não Liberado (${calculatePercentage(entry.Arqueologia_Não_Liberado, entry.Arqueologia_Liberado)}%)`, value: entry.Arqueologia_Não_Liberado },
                          ].map((item, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index]} />
                          ))}
                        </Pie>
                        <Tooltip />
                        <Legend verticalAlign="bottom" height={36} />
                      </PieChart>
                    </div>
                  </Col>
                  <Col sm={12} md={4}>
                    <div className="d-inline-block">
                      <h5>Fundiário</h5>
                      <PieChart width={300} height={300}>
                        <Pie
                          data={[
                            { name: `Liberado (${calculatePercentage(entry.Fundiário_Liberado, entry.Fundiário_Não_Liberado)}%)`, value: entry.Fundiário_Liberado },
                            { name: `Não Liberado (${calculatePercentage(entry.Fundiário_Não_Liberado, entry.Fundiário_Liberado)}%)`, value: entry.Fundiário_Não_Liberado },
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
                            { name: `Liberado (${calculatePercentage(entry.Fundiário_Liberado, entry.Fundiário_Não_Liberado)}%)`, value: entry.Fundiário_Liberado },
                            { name: `Não Liberado (${calculatePercentage(entry.Fundiário_Não_Liberado, entry.Fundiário_Liberado)}%)`, value: entry.Fundiário_Não_Liberado },
                          ].map((item, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index]} />
                          ))}
                        </Pie>
                        <Tooltip />
                        <Legend verticalAlign="bottom" height={36} />
                      </PieChart>
                    </div>
                  </Col>
                  <Col sm={12} md={4}>
                    <div className="d-inline-block">
                      <h5>Projeto</h5>
                      <PieChart width={300} height={300}>
                        <Pie
                          data={[
                            { name: `Liberado (${calculatePercentage(entry.Projeto_Liberado, entry.Projeto_Não_Liberado)}%)`, value: entry.Projeto_Liberado },
                            { name: `Não Liberado (${calculatePercentage(entry.Projeto_Não_Liberado, entry.Projeto_Liberado)}%)`, value: entry.Projeto_Não_Liberado },
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
                            { name: `Liberado (${calculatePercentage(entry.Projeto_Liberado, entry.Projeto_Não_Liberado)}%)`, value: entry.Projeto_Liberado },
                            { name: `Não Liberado (${calculatePercentage(entry.Projeto_Não_Liberado, entry.Projeto_Liberado)}%)`, value: entry.Projeto_Não_Liberado },
                          ].map((item, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index]} />
                          ))}
                        </Pie>
                        <Tooltip />
                        <Legend verticalAlign="bottom" height={36} />
                      </PieChart>
                    </div>
                  </Col>
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
