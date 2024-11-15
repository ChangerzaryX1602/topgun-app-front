import React, { useState, useEffect } from "react";
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

type FFTChartProps = {
  buffer: number[]; // บัฟเฟอร์ข้อมูล FFT
  sampleRate: number; // อัตราการสุ่มตัวอย่าง (Sample Rate) หน่วย Hz
  bufferSize: number; // ขนาดบัฟเฟอร์
};

type ChartDataPoint = {
  frequency: string; // ความถี่ในหน่วย Hz (เป็น string สำหรับแกน x)
  amplitude: number; // แอมพลิจูด
};

const RealTimePlot: React.FC<FFTChartProps> = ({
  buffer,
  sampleRate,
  bufferSize,
}) => {
  //     const frequencyResolution = sampleRate / bufferSize;

  //   // สร้างข้อมูลสำหรับ Recharts
  //   const chartData: ChartDataPoint[] = buffer.slice(0, bufferSize / 2).map((value, index) => ({
  //     frequency: (index * frequencyResolution).toFixed(2), // ความถี่ (Hz)
  //     amplitude: Math.abs(value), // แอมพลิจูด
  //   }));
  const [visibility, setVisibility] = useState(false);

  const handleLegendClick = () => {
    setVisibility((prev: boolean) => !prev);
  };
  const [chartData, setChartData] = useState<ChartDataPoint[]>([]);

  useEffect(() => {
    const frequencyResolution = sampleRate / bufferSize; // Hz per bin

    // Process the buffer and filter frequencies > 300 Hz
    const filteredData = buffer
      .slice(0, bufferSize / 2) // Only use the first half of the FFT data
      .map((amplitude, index) => ({
        frequency: (index * frequencyResolution).toFixed(2), // Convert frequency to string
        amplitude: Math.abs(amplitude), // Use absolute amplitude values
      }))
      .filter((dataPoint) => parseFloat(dataPoint.frequency) > 300); // Filter frequencies > 300 Hz

    setChartData(filteredData);
  }, [buffer, sampleRate, bufferSize]);

  return (
    <div className="w-full h-[500px]">
      <ResponsiveContainer width="100%" height="50%">
        <LineChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis
            dataKey="frequency"
            label={{
              value: "Frequency (Hz)",
              position: "insideBottom",
              offset: -5,
            }}
          />
          <YAxis
            label={{ value: "Amplitude", angle: -90, position: "insideLeft" }}
            domain={[
              (dataMin: number) => Math.floor(dataMin - 10), // Add buffer below
              (dataMax: number) => Math.ceil(dataMax + 10), // Add buffer above
            ]}
          />
          <Tooltip />
          <Legend iconType="circle" onClick={handleLegendClick} />
          <Line
            type="monotone"
            dataKey="amplitude"
            stroke="#4bc0c0"
            dot={false}
            hide={visibility}
          />
          <Brush
            dataKey="amplitude"
            height={30}
            stroke="#8884d8"
            startIndex={0}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

export default RealTimePlot;
