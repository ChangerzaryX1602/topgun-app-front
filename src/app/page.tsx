// Modernized UI using Tailwind CSS for a sleek and clean look
"use client";
import React, { useRef, useEffect, useState } from "react";
import { FiChevronLeft, FiChevronRight } from "react-icons/fi";
import EnergyChart from "@/components/energy-chart";
import PressureChart from "@/components/pressure-chart";
import PunchChart from "@/components/punch-chart";
import PositionChart from "@/components/position-chart";
import Sidebar from "@/components/sidebar";
import Topbar from "@/components/topbar";
import { Energy, Pressure, Punch, Position } from "@/models/data-chart";
import RealTimePlot from "@/components/real-time-plot";
import NFPlot from "@/components/nf-plot";

export default function Home() {
  const ws = useRef<WebSocket | null>(null);
  const [isConnected, setIsConnected] = useState<boolean>(false);
  const [energyData, setEnergyData] = useState<Energy[]>([]);
  const [pressureData, setPressureData] = useState<Pressure[]>([]);
  const [punchData, setPunchData] = useState<Punch[]>([]);
  const [positionData, setPositionData] = useState<Position[]>([]);
  const [force, setForce] = useState<number>(0);
  const [cycleCount, setCycleCount] = useState<number>(0);
  const [position, setPosition] = useState<number>(0);
  const [energy, setEnergy] = useState<number>(0);
  const [voltage, setVoltage] = useState<number[]>([0, 0, 0]);
  const [pressure, setPressure] = useState<number>(0);
  const [topic, setTopic] = useState<string>("topgun/project");
  const [payload, setPayload] = useState<string>("");
  const [showEnergyChart, setShowEnergyChart] = useState<boolean>(true);
  const [showPositionChart, setShowPositionChart] = useState<boolean>(true);
  const [showPressureChart, setShowPressureChart] = useState<boolean>(true);
  const [showPunchChart, setShowPunchChart] = useState<boolean>(true);
  const [showSidebar, setShowSidebar] = useState<boolean>(true);

  const [showOnlyRT, setShowOnlyRT] = useState<boolean>(false);
  const [realtimeData, setRealtimeData] = useState<number[]>([]);

  const statsData = [
    { title: "Force", value: force },
    { title: "Cycle Count", value: cycleCount },
    { title: "Position of the Punch", value: position },
    { title: "Energy Consumption", value: energy },
    { title: "Pressure", value: pressure },
    { title: "Voltage L1-GND", value: voltage[0] },
    { title: "Voltage L2-GND", value: voltage[1] },
    { title: "Voltage L3-GND", value: voltage[2] },
  ];

  const bufferSize = 2048;
  const sampleRate = 48000;

  // ข้อมูลตัวอย่างของบัฟเฟอร์
  const buffer: number[] = Array.from(
    { length: bufferSize },
    () => Math.random() * 100
  );

  const piData = {
    Topic: topic,
    Payload: payload,
  };

  useEffect(() => {
    return () => {
      if (ws.current) {
        ws.current.close();
      }
    };
  }, []);

  const connectWebSocket = () => {
    if (ws.current && ws.current.readyState === WebSocket.OPEN) {
      console.log("WebSocket is already open");
      return;
    }

    resetData();

    const apiKey = "1990947672a3dab4da6d5f3e5f15b1ef";
    ws.current = new WebSocket("ws://technest.ddns.net:8001/ws");

    ws.current.onopen = () => {
      ws.current?.send(apiKey);
      setIsConnected(true);
      console.log("WebSocket connection opened");
    };

    ws.current.onmessage = (event: MessageEvent) => {
      try {
        if (typeof event.data === "string" && event.data.trim().length > 0) {
          const data = JSON.parse(event.data);
          const currentTime = new Date().toLocaleString("en-US", {
            timeZone: "Asia/Bangkok",
            hour: "numeric",
            minute: "numeric",
            second: "numeric",
            fractionalSecondDigits: 2,
          });

          updateChartData(data, currentTime);
        } else {
          console.warn("Received empty message");
        }
      } catch (error) {
        console.warn("Received data is not a valid JSON: ", event.data, error);
      }
    };

    ws.current.onclose = () => {
      setIsConnected(false);
      console.log("WebSocket connection closed");
    };
  };

  const resetData = () => {
    setEnergyData([]);
    setPressureData([]);
    setPunchData([]);
    setPositionData([]);
    setForce(0);
    setCycleCount(0);
    setPosition(0);
    setEnergy(0);
    setVoltage([0, 0, 0]);
    setPressure(0);
  };

  const updateChartData = (data: any, currentTime: string) => {
    setEnergyData((prevData) =>
      updateChartDataHelper(prevData, {
        Power: data["Energy Consumption"].Power,
        Time: currentTime,
      })
    );
    setPositionData((prevData) =>
      updateChartDataHelper(prevData, {
        Position: data["Position of the Punch"],
        Time: currentTime,
      })
    );
    setPressureData((prevData) =>
      updateChartDataHelper(prevData, {
        Pressure: data.Pressure,
        Time: currentTime,
      })
    );
    setPunchData((prevData) =>
      updateChartDataHelper(prevData, { Punch: data.Force, Time: currentTime })
    );

    setForce(data.Force);
    setCycleCount(data["Cycle Count"]);
    setPosition(data["Position of the Punch"]);
    setEnergy(data["Energy Consumption"].Power);
    setVoltage([
      data.Voltage["L1-GND"],
      data.Voltage["L2-GND"],
      data.Voltage["L3-GND"],
    ]);
    setPressure(data.Pressure);
  };

  const updateChartDataHelper = (prevData: any[], newData: any) => {
    if (prevData.length >= 200) {
      return [newData];
    }
    return [...prevData, newData];
  };

  const disconnectWebSocket = () => {
    if (ws.current) {
      ws.current.close();
      setIsConnected(false);
      console.log("WebSocket connection stopped by user");
    }
  };

  const toggleWebSocket = () => {
    isConnected ? disconnectWebSocket() : connectWebSocket();
  };

  const handleData = (data: any) => {
    const energyData: Energy[] = data.data.map((item: any) => ({
      Power: item["Energy Consumption"].Power,
      Time: new Date(item.created_at).toISOString(),
    }));

    const pressureData: Pressure[] = data.data.map((item: any) => ({
      Pressure: item.Pressure,
      Time: new Date(item.created_at).toISOString(),
    }));

    const punchData: Punch[] = data.data.map((item: any) => ({
      Punch: item.Force.toString(),
      Time: new Date(item.created_at).toISOString(),
    }));

    const positionData: Position[] = data.data.map((item: any) => ({
      Position: item["Position of the Punch"].toString(),
      Time: new Date(item.created_at).toISOString(),
    }));

    setPositionData(positionData);
    setEnergyData(energyData);
    setPressureData(pressureData);
    setPunchData(punchData);
  };

  const handleRealtime = (data: number[]) => {
    console.log("page", data);
    setRealtimeData(data);
  };

  const triggerSwitchMode = () => {
    setShowOnlyRT((prev) => !prev);
  };
  return (
    <div className="w-full h-screen flex flex-col bg-gray-300">
  <div className="w-full p-4">
    <Topbar statsData={statsData} />
  </div>
  <div className="flex w-full h-full overflow-hidden">
    {showSidebar && (
      <Sidebar
        showEnergyChart={showEnergyChart}
        setShowEnergyChart={setShowEnergyChart}
        showPositionChart={showPositionChart}
        setShowPositionChart={setShowPositionChart}
        showPressureChart={showPressureChart}
        setShowPressureChart={setShowPressureChart}
        showPunchChart={showPunchChart}
        setShowPunchChart={setShowPunchChart}
        topic={topic}
        setTopic={setTopic}
        payload={payload}
        setPayload={setPayload}
        piData={piData}
        toggleWebSocket={toggleWebSocket}
        isConnected={isConnected}
        handleData={handleData}
        handleRealtime={handleRealtime}
        triggerSwitchMode={triggerSwitchMode}
      />
    )}
    <div
      className={`w-full ${
        showSidebar ? "md:w-4/5" : "w-full"
      } flex-grow overflow-y-auto flex flex-col p-4`}
    >
      {/* grid grid-cols-1 auto-rows-fr gap-6 p-4 */}
      {!showOnlyRT ? (
        <>
          {showEnergyChart && (
            <ChartContainer title="Energy Consumption">
              <EnergyChart data={energyData} />
            </ChartContainer>
          )}
          {showPositionChart && (
            <ChartContainer title="Position">
              <PositionChart data={positionData} />
            </ChartContainer>
          )}
          {showPressureChart && (
            <ChartContainer title="Pressure">
              <PressureChart data={pressureData} />
            </ChartContainer>
          )}
          {showPunchChart && (
            <ChartContainer title="Punch">
              <PunchChart data={punchData} />
            </ChartContainer>
          )}
        </>
      ) : (
        <div className="w-full h-screen flex flex-col bg-white p-4">
          <ChartContainer title="Real-time Plot">
          <RealTimePlot
            buffer={realtimeData}
            sampleRate={sampleRate}
            bufferSize={bufferSize}
          />
          </ChartContainer>

          <ChartContainer title="N-F">
          <NFPlot />
          </ChartContainer>
        </div>
      )}
    </div>
  </div>
</div>

  );
}

interface ChartContainerProps {
  title: string;
  children: React.ReactNode;
}

const ChartContainer: React.FC<ChartContainerProps> = ({ title, children }) => (
  <div className="bg-white shadow-lg rounded-md p-4 h-[350px] w-full flex flex-col">
    <div className="flex justify-center font-bold text-xl text-indigo-700 mb-4">
      {title}
    </div>
    <div className="flex-1 w-full">{children}</div>
  </div>
);

