import { Voltage } from "@/models/data-chart";
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
} from "recharts";
import type { Payload } from "recharts/types/component/DefaultLegendContent";

const VoltageChart: FC<{ data: Voltage[] }> = ({ data }) => {
  const [l1Visibility, setL1Visibility] = useState<boolean>(false);
  const [l2Visibility, setL2Visibility] = useState<boolean>(false);
  const [l3Visibility, setL3Visibility] = useState<boolean>(false);

  const handleLegendClick = (data: Payload) => {
    const { dataKey } = data;
    switch (dataKey) {
      case "L1-GND":
        setL1Visibility((prev: boolean) => !prev);
        break;

      case "L2-GND":
        setL2Visibility((prev: boolean) => !prev);
        break;

      case "L3-GND":
        setL3Visibility((prev: boolean) => !prev);
        break;
    }
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
            hide={l1Visibility}
            dataKey="L1-GND"
            stroke="#8884d8"
          />
          <Line
            type="monotone"
            hide={l2Visibility}
            dataKey="L2-GND"
            stroke="#82ca9d"
          />
          <Line
            type="monotone"
            hide={l3Visibility}
            dataKey="L3-GND"
            stroke="#000000"
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

export default VoltageChart;
