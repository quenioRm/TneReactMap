import React, { useRef, useState, useEffect } from 'react';
import { useTable, useFilters } from 'react-table';
import ReactToPrint from 'react-to-print';
import ReactHTMLTableToExcel from 'react-html-table-to-excel';
import Table from 'react-bootstrap/Table';
import Button from 'react-bootstrap/Button';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSearch } from '@fortawesome/free-solid-svg-icons';
import axios from '../axiosInstance';
import EffectiveGraph from './EffectiveGraph';

// Componente de Filtro
const FilterInput = ({ column: { filterValue, setFilter } }) => {
  return (
    <input
      value={filterValue || ''}
      onChange={(e) => setFilter(e.target.value || undefined)}
      placeholder="Filter..."
    />
  );
};

const SearchIcon = ({ onClick }) => {
  return (
    <span
      style={{ cursor: 'pointer' }}
      onClick={onClick}
      onMouseEnter={onClick}
    >
      <FontAwesomeIcon icon={faSearch} />
    </span>
  );
};

const TableComponent = ({ columns, data, totalDirect, totalIndirect, totalMachines }) => {
    const {
      getTableProps,
      getTableBodyProps,
      headerGroups,
      rows,
      prepareRow,
    } = useTable(
      {
        columns,
        data,
      },
      useFilters
    );

    return (
      <div className="table-container">
        <Table {...getTableProps()} id="table-to-xls" striped bordered hover>
          <thead>
            {headerGroups.map(headerGroup => (
              <tr {...headerGroup.getHeaderGroupProps()}>
                {headerGroup.headers.map((column, index) => (
                  <th style={{ textAlign: 'center', verticalAlign: 'middle' }} {...column.getHeaderProps()}>
                    {index < 2 ? ( // Mesclar apenas as duas primeiras colunas
                      <span >{column.render('Header')}</span>
                    ) : (
                      column.render('Header')
                    )}
                  </th>
                ))}
              </tr>
            ))}
          </thead>
          <tbody {...getTableBodyProps()}>
            {rows.map((row, i) => {
              prepareRow(row);
              return (
                <tr {...row.getRowProps()}>
                  {row.cells.map((cell, index) => {
                    return (
                      <td {...cell.getCellProps()} style={{ textAlign: 'center', verticalAlign: 'middle' }}>
                        {index < 2 ? ( // Mesclar apenas as duas primeiras colunas
                          <span>{cell.render('Cell')}</span>
                        ) : (
                          cell.render('Cell')
                        )}
                      </td>
                    );
                  })}
                </tr>
              );
            })}
            <tr>
              <td colSpan={2} style={{ textAlign: 'center', verticalAlign: 'middle' }}>Total MO: {totalDirect + totalIndirect}</td>
              <td style={{ textAlign: 'center', verticalAlign: 'middle' }}>{totalDirect}</td>
              <td style={{ textAlign: 'center', verticalAlign: 'middle' }}>{totalIndirect}</td>
              <td style={{ textAlign: 'center', verticalAlign: 'middle' }}>{totalMachines}</td>
            </tr>
          </tbody>
        </Table>
      </div>
    );
  };


const ExportToExcelButton = ({ children, ...rest }) => {
  return <Button {...rest}>{children}</Button>;
};

const EffectiveMo = () => {
  const tableRef = useRef();
  const [filterText, setFilterText] = useState('');
  const [filteredData, setFilteredData] = useState([]);
  const [effective, setEffective] = useState([]);

  const fetchEffective = async () => {
    try {
      const response = await axios.get(`/api/effective`);
      setEffective(response.data);
    } catch (error) {
      console.error("Error fetching effective data:", error);
    }
  };

  useEffect(() => {
    fetchEffective();
  }, []);

  useEffect(() => {
    setFilteredData(
      effective.filter(row =>
        Object.values(row).some(
          value =>
            typeof value === 'string' && value.toLowerCase().includes(filterText.toLowerCase())
        )
      )
    );
  }, [filterText, effective]);

  const handleFilterInputChange = (e) => {
    setFilterText(e.target.value);
  };

  // Definindo as colunas da tabela
  const columns = [
    {
      Header: 'Atividade/Projeto',
      accessor: 'activity',
    },
    {
      Header: 'Empresa',
      accessor: 'business',
    },
    {
      Header: 'Direto',
      accessor: 'direct',
    },
    {
      Header: 'Indireto',
      accessor: 'indirect',
    },
    {
      Header: 'Veículos/Equipamentos',
      accessor: 'machinescount',
    },
  ];

  // Calcular totais
  const totalDirect = filteredData.reduce((acc, curr) => acc + parseFloat(curr.direct || 0), 0);
  const totalIndirect = filteredData.reduce((acc, curr) => acc + parseFloat(curr.indirect || 0), 0);
  const totalMachines = filteredData.reduce((acc, curr) => acc + parseFloat(curr.machinescount || 0), 0);

  return (
    <div className="effective-table-container">
      <br/>
      <h3>Efetivo de Obra</h3>
      <br/>
      <input
        type="text"
        value={filterText}
        onChange={handleFilterInputChange}
        placeholder="Buscar..."
        style={{ marginBottom: '10px' }}
      />
      {' '} {/* Espaçamento */}
      <ReactHTMLTableToExcel
        id="test-table-xls-button"
        className="download-table-xls-button"
        table="table-to-xls"
        filename="tablexls"
        sheet="tablexls"
        buttonText={<ExportToExcelButton>Exportar para Excel</ExportToExcelButton>}
      />
      <TableComponent
        ref={tableRef}
        columns={columns}
        data={filteredData}
        totalDirect={totalDirect}
        totalIndirect={totalIndirect}
        totalMachines={totalMachines}
      />

      <EffectiveGraph data={filteredData} />

    </div>
  );
};

export default EffectiveMo;
