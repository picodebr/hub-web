import React, { useRef, useState } from 'react';
import { Button, Divider, Input, InputRef, Radio, Space, Table } from 'antd';
import { FiSearch } from 'react-icons/fi';
import type { ColumnType, ColumnsType } from 'antd/es/table';
import type { FilterConfirmProps } from 'antd/es/table/interface';

interface DataType {
  key: React.Key;
  code: string;
  subject: string;
  grade: string;
  description: string;
}

type DataIndex = keyof DataType;

const data: DataType[] = [
  {
    key: '1',
    code: 'EF01MA01',
    subject: 'Matemática',
    grade: '1 ano',
    description:
      'Utilizar números naturais como indicador de quantidade ou de ordem em diferentes situações cotidianas e reconhecer situações em que os números não indicam contagem nem ordem, mas sim código de identificação.',
  },
  {
    key: '2',
    code: 'EF01MA02',
    subject: 'Matemática',
    grade: '2 ano',
    description:
      'Utilizar números naturais como indicador de quantidade ou de ordem em diferentes situações cotidianas e reconhecer situações em que os números não indicam contagem nem ordem, mas sim código de identificação.',
  },
  {
    key: '3',
    code: 'EF01MA03',
    subject: 'Matemática',
    grade: '3 ano',
    description:
      'Utilizar números naturais como indicador de quantidade ou de ordem em diferentes situações cotidianas e reconhecer situações em que os números não indicam contagem nem ordem, mas sim código de identificação.',
  },
  {
    key: '4',
    code: 'EF01MA04',
    subject: 'Matemática',
    grade: '4 ano',
    description:
      'Utilizar números naturais como indicador de quantidade ou de ordem em diferentes situações cotidianas e reconhecer situações em que os números não indicam contagem nem ordem, mas sim código de identificação.',
  },
];

// rowSelection object indicates the need for row selection
const rowSelection = {
  onChange: (selectedRowKeys: React.Key[], selectedRows: DataType[]) => {
    console.log(`selectedRowKeys: ${selectedRowKeys}`, 'selectedRows: ', selectedRows);
  },
  getCheckboxProps: (record: DataType) => ({
    name: record.code,
  }),
};

export const AppTable: React.FC = () => {
  const [searchText, setSearchText] = useState('');
  const [searchedColumn, setSearchedColumn] = useState('');
  const searchInput = useRef<InputRef>(null);

  const handleSearch = (selectedKeys: string[], confirm: (param?: FilterConfirmProps) => void, dataIndex: DataIndex) => {
    confirm();
    setSearchText(selectedKeys[0]);
    setSearchedColumn(dataIndex);
  };

  const handleReset = (clearFilters: () => void) => {
    clearFilters();
    setSearchText('');
  };

  const getColumnSearchProps = (dataIndex: DataIndex): ColumnType<DataType> => ({
    filterDropdown: ({ setSelectedKeys, selectedKeys, confirm, clearFilters, close }) => (
      <div style={{ padding: 8 }} onKeyDown={(e) => e.stopPropagation()}>
        <Input
          ref={searchInput}
          placeholder={`Search ${dataIndex}`}
          value={selectedKeys[0]}
          onChange={(e) => setSelectedKeys(e.target.value ? [e.target.value] : [])}
          onPressEnter={() => handleSearch(selectedKeys as string[], confirm, dataIndex)}
          style={{ marginBottom: 8, display: 'block', zIndex: 9999 }}
        />
        <Space>
          <Button
            type="primary"
            onClick={() => handleSearch(selectedKeys as string[], confirm, dataIndex)}
            icon={<FiSearch />}
            size="small"
            style={{ width: 90 }}
          >
            Search
          </Button>
          <Button onClick={() => clearFilters && handleReset(clearFilters)} size="small" style={{ width: 90 }}>
            Reset
          </Button>
          <Button
            type="link"
            size="small"
            onClick={() => {
              confirm({ closeDropdown: false });
              setSearchText((selectedKeys as string[])[0]);
              setSearchedColumn(dataIndex);
            }}
          >
            Filter
          </Button>
          <Button
            type="link"
            size="small"
            onClick={() => {
              close();
            }}
          >
            close
          </Button>
        </Space>
      </div>
    ),
    filterIcon: (filtered: boolean) => <FiSearch style={{ color: filtered ? '#1677ff' : undefined }} />,
    onFilter: (value, record) =>
      record[dataIndex]
        .toString()
        .toLowerCase()
        .includes((value as string).toLowerCase()),
    onFilterDropdownOpenChange: (visible) => {
      if (visible) {
        setTimeout(() => searchInput.current?.select(), 100);
      }
    },
    render: (text) => text,
  });

  const columns: ColumnsType<DataType> = [
    {
      title: 'Habilidade',
      dataIndex: 'code',
      render: (text: string) => <a>{text}</a>,
      ...getColumnSearchProps('code'),
    },
    {
      title: 'Matéria',
      dataIndex: 'subject',
      ...getColumnSearchProps('subject'),
    },
    {
      title: 'Ano/Faixa',
      dataIndex: 'grade',
      ...getColumnSearchProps('grade'),
    },
    {
      title: 'Descrição',
      dataIndex: 'description',
      ...getColumnSearchProps('description'),
    },
  ];

  return <Table columns={columns} dataSource={data} />;
};
