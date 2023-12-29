import { Table } from 'antd';
import type { ColumnsType } from 'antd/es/table';

import { IBnccSkill } from '@/_base/interfaces/shared/IBnccSkill';

interface DataType {
  key: React.Key;
  tag: string;
  subject: string;
  grade: string;
  description: string;
}

interface IProps {
  bnccSkills: IBnccSkill[];
  values: IBnccSkill[];
  onChange: (data: IBnccSkill[]) => void;
}

export const AppTable: React.FC<IProps> = ({ bnccSkills, values = [], onChange }) => {
  const columns: ColumnsType<DataType> = [
    {
      title: 'Habilidade',
      dataIndex: 'tag',
      render: (text: string) => <a>{text}</a>,
    },
    {
      title: 'Matéria',
      dataIndex: 'subject',
    },
    {
      title: 'Ano/Faixa',
      dataIndex: 'grade',
    },
    {
      title: 'Descrição',
      dataIndex: 'description',
    },
  ];

  const dataSource: DataType[] = bnccSkills.map((bncc) => ({ ...bncc, key: bncc.tag, description: `${bncc.title} - ${bncc.description || ''}` }));

  return (
    <Table
      rowSelection={{
        type: `checkbox`,
        selectedRowKeys: values.map((e) => e.tag),
        onChange: (keys) => onChange(bnccSkills.filter((e) => keys.includes(e.tag))),
      }}
      columns={columns}
      dataSource={dataSource}
      style={{ fontFamily: `'Inter' - sans-serif`, height: 'fit-content' }}
      pagination={{ pageSize: 25 }}
    />
  );
};
