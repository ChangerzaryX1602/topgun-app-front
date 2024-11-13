"use client";
import EnergyChart from "@/components/energy-chart";
import PressureChart from "@/components/pressure-chart";
import Stats from "@/components/stats";
import VoltageChart from "@/components/voltage-chart";
import { Energy, Pressure, Voltage } from "@/models/data-chart";
import React, { useRef, useEffect, useState } from "react";

export default function Home() {
  const ws = useRef<WebSocket | null>(null);
  const [energyData, setEnergyData] = useState<Energy[]>([]);
  const [voltageData, setVoltageData] = useState<Voltage[]>([]);
  const [pressureData, setPressureData] = useState<Pressure[]>([]);
  const [force, setForce] = useState<number>(0);
  const [cycleCount, setCycleCount] = useState<number>(0);
  const [position, setPosition] = useState<number>(0);

  const statsData = [
    { title: "Force", value: force },
    { title: "Cycle Count", value: cycleCount },
    { title: "Position of the Punch", value: position },
  ];
  useEffect(() => {
    connectWebSocket();

    // Clean up on component unmount
    return () => {
      if (ws.current) {
        ws.current.close();
      }
    };
  }, []); // Empty dependency array ensures this effect runs only once when the component mounts

  const connectWebSocket = () => {
    if (ws.current && ws.current.readyState === WebSocket.OPEN) {
      // Do nothing if WebSocket is already open
      console.log("WebSocket is already open");
      return;
    }

    if (
      ws.current &&
      (ws.current.readyState === WebSocket.CLOSING ||
        ws.current.readyState === WebSocket.CLOSED)
    ) {
      console.log("Reconnecting WebSocket...");
    }

    const apiKey = "1990947672a3dab4da6d5f3e5f15b1ef";
    ws.current = new WebSocket("ws://technest.ddns.net:8001/ws");

    ws.current.onopen = () => {
      ws.current?.send(apiKey);
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

        setEnergyData((prevData) => [
          ...prevData,
          { Power: data["Energy Consumption"].Power, Time: current },
        ]);
        setVoltageData((prevData) => [
          ...prevData,
          {
            "L1-GND": data.Voltage["L1-GND"],
            "L2-GND": data.Voltage["L2-GND"],
            "L3-GND": data.Voltage["L3-GND"],
            Time: current,
          },
        ]);
        setPressureData((prevData) => [
          ...prevData,
          { Pressure: data.Pressure, Time: current },
        ]);

        setForce(data.Force);
        setCycleCount(data["Cycle Count"]);
        setPosition(data["Position of the Punch"]);
      } catch (error) {
        console.log("not a json lol", error);
      }
    };

    ws.current.onclose = () => {
      console.log("WebSocket connection closed");
    };
  };

  return (
    <div className="w-full flex justify-center mt-2 mb-2">
      <div className="w-11/12 md:w-5/6 2xl:grid 2xl:grid-cols-2 2xl:gap-4">
        <div className="mb-4">
          <div className="flex justify-center font-bold text-lg">
            Energy Consumption
          </div>
          <EnergyChart data={energyData} />
        </div>
        <div className="mb-4">
          <div className="flex justify-center font-bold text-lg">Voltage</div>
          <VoltageChart data={voltageData} />
        </div>
        <div className="mb-4">
          <div className="flex justify-center font-bold text-lg">Pressure</div>
          <PressureChart data={pressureData} />
        </div>
        <div className="w-full">
          <div className="flex justify-center font-bold text-lg text-center">
            Force & Cycle Count & Position of the Punch
          </div>
          <Stats data={statsData} />
        </div>
      </div>
    </div>
  );
}
