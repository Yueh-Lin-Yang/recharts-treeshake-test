import { LineChart, Line, Tooltip } from 'recharts';

const data = [
  { x: 1, y: 10 },
  { x: 2, y: 20 },
  { x: 3, y: 15 },
];

export function App() {
  return (
    <LineChart width={400} height={200} data={data}>
      <Line dataKey="y" />
      <Tooltip />
    </LineChart>
  );
}
