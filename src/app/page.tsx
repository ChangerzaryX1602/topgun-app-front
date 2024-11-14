// ใช้ Tailwind CSS เพื่อทำให้หน้าเว็บมีความทันสมัยและสวยงาม
"use client";
import PiButton from "@/components/button";
import EnergyChart from "@/components/energy-chart";
import PressureChart from "@/components/pressure-chart";
import PunchChart from "@/components/punch-chart";
// import Stats from "@/components/stats";
import PositionChart from "@/components/position-chart";
// import Topbar from "@/components/topbar";
import { Energy, Pressure, Punch,Position } from "@/models/data-chart";
import React, { useRef, useEffect, useState } from "react";
import { FiChevronLeft, FiChevronRight } from "react-icons/fi";

export default function Home() {
  const ws = useRef<WebSocket | null>(null);
  const [isConnected, setIsConnected] = useState<boolean>(false);
  const [energyData, setEnergyData] = useState<Energy[]>([]);
  const [pressureData, setPressureData] = useState<Pressure[]>([]);
  const [punchData, setPunchData] = useState<Punch[]>([]);
  const [positionData,setPositionData] = useState<Position[]>([]);
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

    const apiKey = "1990947672a3dab4da6d5f3e5f15b1ef";
    ws.current = new WebSocket("ws://technest.ddns.net:8001/ws");

    ws.current.onopen = () => {
      ws.current?.send(apiKey);
      setIsConnected(true);
      console.log("WebSocket connection opened");
    };

    ws.current.onmessage = (event: MessageEvent) => {
      try {
        const data = JSON.parse(event.data);
        const current = new Date().toLocaleString("en-US", {
          timeZone: "Asia/Bangkok",
          hour: "numeric",
          minute: "numeric",
          second: "numeric",
          fractionalSecondDigits: 2,
        });

        setEnergyData((prevData) => {
          if (prevData.length >= 200) {
            return [{ Power: data["Energy Consumption"].Power, Time: current }];
          } else {
            return [
              ...prevData,
              { Power: data["Energy Consumption"].Power, Time: current },
            ];
          }
        });

        setPositionData((prevData) => {
          if (prevData.length >= 200) {
            return [
              {
                Position:data["Position of the Punch"],
                Time: current,
              },
            ];
          } else {
            return [
              ...prevData,
              {
                Position:data["Position of the Punch"],
                Time: current,
              },
            ];
          }
        });

        setPressureData((prevData) => {
          if (prevData.length >= 200) {
            return [{ Pressure: data.Pressure, Time: current }];
          } else {
            return [...prevData, { Pressure: data.Pressure, Time: current }];
          }
        });

        setPunchData((prevData) => {
          if (prevData.length >= 200) {
            return [{ Punch: data.Force, Time: current }];
          } else {
            return [...prevData, { Punch: data.Force, Time: current }];
          }
        });

        setForce(data.Force);
        setCycleCount(data["Cycle Count"]);
        setPosition(data["Position of the Punch"]);
        setEnergy(data["Energy Consumption"].Power);
        setVoltage([data.Voltage["L1-GND"], data.Voltage["L2-GND"], data.Voltage["L3-GND"]]);
        setPressure(data.Pressure);
      } catch (error) {
        console.log("not a json lol", error);
      }
    };

    ws.current.onclose = () => {
      setIsConnected(false);
      console.log("WebSocket connection closed");
    };
  };

  const disconnectWebSocket = () => {
    if (ws.current) {
      ws.current.close();
      setIsConnected(false);
      console.log("WebSocket connection stopped by user");
    }
  };

  const toggleWebSocket = () => {
    if (isConnected) {
      disconnectWebSocket();
    } else {
      connectWebSocket();
    }
  };

  return (
    <div className="w-full h-screen flex flex-col items-center bg-gray-300 p-4 overflow-hidden">
      <Topbar statsData={statsData} />
      <div className="w-full h-full flex">
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
          />
        )}
        <button
          onClick={() => setShowSidebar(!showSidebar)}
          className="m-2 bg-gray-400 text-white rounded-lg shadow-md hover:bg-gray-800 transition duration-300"
        >
          {showSidebar ? <FiChevronLeft size={24} /> : <FiChevronRight size={24}/>}
        </button>
        <div className={`w-full ${showSidebar ? "md:w-4/5" : "w-full"} h-full overflow-hidden grid grid-cols-1 grid-rows-4`}>
          {showEnergyChart && (
            <div className="bg-white shadow-lg rounded-none p-0 h-full w-full row-span-2">
              <div className="flex justify-center font-bold text-xl text-indigo-700">
                Energy Consumption
              </div>
              <EnergyChart data={energyData} />
            </div>
          )}
          {showPositionChart && (
            <div className="bg-white shadow-lg rounded-none p-0 h-full w-full row-span-2">
              <div className="flex justify-center font-bold text-xl text-indigo-700">Position</div>
              <PositionChart data={positionData} />
            </div>
          )}
          {showPressureChart && (
            <div className="bg-white shadow-lg rounded-none p-0 h-full w-full row-span-2">
              <div className="flex justify-center font-bold text-xl text-indigo-700">Pressure</div>
              <PressureChart data={pressureData} />
            </div>
          )}
          {showPunchChart && (
            <div className="bg-white shadow-lg rounded-none p-0 h-full w-full row-span-2">
              <div className="flex justify-center font-bold text-xl text-indigo-700">Punch</div>
              <PunchChart data={punchData} />
            </div>
          )}
        </div>
      </div>
    </div>
  );


}

function Sidebar({
  showEnergyChart,
  setShowEnergyChart,
  showPositionChart,
  setShowPositionChart,
  showPressureChart,
  setShowPressureChart,
  showPunchChart,
  setShowPunchChart,
  topic,
  setTopic,
  payload,
  setPayload,
  piData,
  toggleWebSocket,
  isConnected,
}: {
  showEnergyChart: boolean;
  setShowEnergyChart: React.Dispatch<React.SetStateAction<boolean>>;
  showPositionChart: boolean;
  setShowPositionChart: React.Dispatch<React.SetStateAction<boolean>>;
  showPressureChart: boolean;
  setShowPressureChart: React.Dispatch<React.SetStateAction<boolean>>;
  showPunchChart: boolean;
  setShowPunchChart: React.Dispatch<React.SetStateAction<boolean>>;
  topic: string;
  setTopic: React.Dispatch<React.SetStateAction<string>>;
  payload: string;
  setPayload: React.Dispatch<React.SetStateAction<string>>;
  piData: { Topic: string; Payload: string };
  toggleWebSocket: () => void;
  isConnected: boolean;
}) {
  return (
    <div className="flex flex-col justify-start gap-4 mt-4 h-auto w-1/6 bg-gray-100 p-6 rounded-lg shadow-md">
      <button
        onClick={() => setShowEnergyChart((prev) => !prev)}
        className={`p-2 m-2 ${!showEnergyChart ? 'bg-red-500 hover:bg-red-600' : 'bg-indigo-500 hover:bg-indigo-600'} text-white rounded-lg shadow-md  transition duration-300`}
      >
        {(!showEnergyChart) ? (<>Show energy chart</>) : (<>Hide energy chart</>)}
        
      </button>
      <button
        onClick={() => setShowPositionChart((prev) => !prev)}
        className={`p-2 m-2 ${!showPositionChart ? 'bg-red-500 hover:bg-red-600' : 'bg-indigo-500 hover:bg-indigo-600'} text-white rounded-lg shadow-md hover:bg-indigo-600 transition duration-300`}
      >
        {(!showPositionChart) ? (<>Show position chart</>) : (<>Hide position chart</>)}
      </button>
      <button
        onClick={() => setShowPressureChart((prev) => !prev)}
        className={`p-2 m-2 ${!showPressureChart ? 'bg-red-500 hover:bg-red-600' : 'bg-indigo-500 hover:bg-indigo-600'} text-white rounded-lg shadow-md hover:bg-indigo-600 transition duration-300`}
      >
        {(!showPressureChart) ? (<>Show pressure chart</>) : (<>Hide pressure chart</>)}
      </button>
      <button
        onClick={() => setShowPunchChart((prev) => !prev)}
        className={`p-2 m-2 ${!showPunchChart ? 'bg-red-500 hover:bg-red-600' : 'bg-indigo-500 hover:bg-indigo-600'} text-white rounded-lg shadow-md hover:bg-indigo-600 transition duration-300`}
      >
        {(!showPunchChart) ? (<>Show punch chart</>) : (<>Hide punch chart</>)}
      </button>
      <input
        type="text"
        placeholder="Topic"
        value={topic}
        onChange={(e) => setTopic(e.target.value)}
        className="p-3 border rounded-lg w-full"
      />
      <input
        type="text"
        placeholder="Payload"
        value={payload}
        onChange={(e) => setPayload(e.target.value)}
        className="p-3 border rounded-lg w-full"
      />
      <PiButton data={piData} />
      <button
        onClick={toggleWebSocket}
        className={`mt-4 p-4 rounded-lg font-semibold transition duration-300 ease-in-out transform hover:scale-105 w-full text-white ${
          isConnected ? "bg-red-600" : "bg-green-600"
        }`}
      >
        {isConnected ? "Disconnect WebSocket" : "Connect WebSocket"}
      </button>
      
    </div>
  );
}

// Topbar Component
function Topbar({ statsData }: { statsData: { title: string; value: number }[] }) {
  return (
    <div className="w-full bg-white shadow-lg rounded-lg p-6 mb-4">
      <div className="flex justify-center font-bold text-xl text-center text-indigo-700 mb-4">
        Live Data from WebSocket
      </div>
      <div className="flex flex-wrap justify-around items-center gap-2">
        {statsData.map((stat, index) => (
          <div key={index} className="flex flex-col items-center">
            <span className="font-semibold text-gray-700">{stat.title}</span>
            <span className="text-gray-500">{stat.value.toFixed(2)}</span>
          </div>
        ))}
      </div>
    </div>
  );
}