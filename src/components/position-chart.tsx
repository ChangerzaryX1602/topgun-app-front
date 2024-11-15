import { Position } from "@/models/data-chart";
import React, { FC, useState } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Brush,
} from "recharts";

const PositionChart: FC<{ data: Position[] }> = ({ data }) => {
  const [visibility, setVisibility] = useState(false);

  const handleLegendClick = () => {
    setVisibility((prev: boolean) => !prev);
  };

  return (
    <div className="w-full h-64">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart
          width={500}
          height={300}
          data={data}
          margin={{
            top: 5,
            right: 5,
            left: 5,
            bottom: 5,
          }}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="Time" />
          <YAxis
            domain={[
              (dataMin: number) => Math.floor(dataMin - 10), // Add buffer below
              (dataMax: number) => Math.ceil(dataMax + 10), // Add buffer above
            ]}
          />
          <Tooltip />
          <Legend iconType="circle" onClick={handleLegendClick} />
          <Line
            type="monotone"
            hide={visibility}
            dataKey="Position"
            stroke="#8884d8"
          />
                    {/* Brush Component for zoom */}
                    <Brush
            dataKey="Time"
            height={30}
            stroke="#8884d8"
            startIndex={0}
            endIndex={data.length - 1}
          />
        </LineChart>
        
      </ResponsiveContainer>
    </div>
  );
};

export default PositionChart;
