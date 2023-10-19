import { CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';

export type AppLineChartDataType = { name: string; value: number };

interface IReportChartProps {
  id: string;
  data: AppLineChartDataType[];
  width?: number;
  height?: number;
  aspect?: number;
}

export const AppLineChart: React.FC<IReportChartProps> = (props) => {
  return (
    <ResponsiveContainer width="100%" height="100%" aspect={props.aspect}>
      <LineChart id={props.id} width={props.width || 850} height={props.height || 160} data={props.data}>
        <CartesianGrid stroke="#cccccc77" />
        <Tooltip labelFormatter={(e) => `Day ${e}`} />
        <Line type="monotone" dataKey="value" stroke="#8884d8" strokeWidth={3} />
        <YAxis />
        <XAxis dataKey="name" />
      </LineChart>
    </ResponsiveContainer>
  );
};
