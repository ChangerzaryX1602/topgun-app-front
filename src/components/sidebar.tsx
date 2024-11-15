import { useState, useRef, useEffect } from 'react';
import axios from 'axios';
import Swal from 'sweetalert2';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import PiButton from './button'; // Assuming you have a PiButton component
import { Position } from '@/models/data-chart';
import { Files } from '@/models/file';
import mqtt from 'mqtt';

interface SidebarProps {
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
  handleData: React.Dispatch<React.SetStateAction<Position[]>>;
  handleRealtime: (data: number[]) => void;
  triggerSwitchMode: () => void;
}

const Sidebar = ({
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
  handleData,
  handleRealtime,
  triggerSwitchMode
}: SidebarProps) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [filename, setFileName] = useState<string>('');
  const [fileData, setFileData] = useState<Files[]>([{} as Files]);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [selectedButton, setSelectedButton] = useState<number | null>(null);
  const [from, setFrom] = useState<string>('');
  const [to, setTo] = useState<string>('');

  const [switchMode, setSwitchMode] = useState<boolean>(false);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedFile(file);
    }
  };

  const handleViewFiles = async () => {
    try {
      const res = await axios.get('http://185.84.161.188:11602/api/v1/attachment?limit=100', {
        headers: {
          Authorization: 'Bearer eyJhbGciOiJFUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJsb2NhbGhvc3Q6ODA4MCIsInN1YiI6ImI0NjliOTNjLWQwNGYtNGJhMS1iZmExLTg4NjYzZGY5ZTg3YSJ9.Gp4vlllGMwkbCE1x7UfhJHAsqSUaO6CA6fMfUUcCL_hW75rIld6pV2_rHepFejLMnsePZ51X78PDzIZFmEZ1DA',
        },
      });
      if (res.status === 200) {
        setFileData(res.data.data);
      }
    } catch (error) {
      console.warn('Error fetching files', error);
    }
  };

  const handleButtonClick = (id: number, file_name: string) => {
    setSelectedButton(id);
    setFileName(file_name);
  };

  const handleSubmit = async () => {
    if (!selectedFile) {
      console.warn('No file selected');
      return;
    }

    const formData = new FormData();
    formData.append('file', selectedFile);
    formData.append('file_type', 'model');

    try {
      const res = await axios.post('http://185.84.161.188:11602/api/v1/attachment/file', formData, {
        headers: {
          Authorization: 'Bearer eyJhbGciOiJFUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJsb2NhbGhvc3Q6ODA4MCIsInN1YiI6ImI0NjliOTNjLWQwNGYtNGJhMS1iZmExLTg4NjYzZGY5ZTg3YSJ9.Gp4vlllGMwkbCE1x7UfhJHAsqSUaO6CA6fMfUUcCL_hW75rIld6pV2_rHepFejLMnsePZ51X78PDzIZFmEZ1DA',
        },
      });

      if (res.status !== 201) {
        Swal.fire({
          title: 'Error!',
          text: `${res.status}`,
          icon: 'error',
          showConfirmButton: true,
          timer: 1500,
        });
      } else {
        Swal.fire({
          title: 'Upload success',
          icon: 'success',
          showConfirmButton: true,
          timer: 1500,
        });
        setSelectedFile(null);
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }
      }
    } catch (error) {
      console.warn('Error uploading file', error);
    }
  };

  const handleDownload = async (id: number, file_name: string) => {
    try {
      const response = await axios.get(`http://185.84.161.188:11602/api/v1/attachment/file/${id}`, {
        headers: {
          Authorization: 'Bearer eyJhbGciOiJFUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJsb2NhbGhvc3Q6ODA4MCIsInN1YiI6ImI0NjliOTNjLWQwNGYtNGJhMS1iZmExLTg4NjYzZGY5ZTg3YSJ9.Gp4vlllGMwkbCE1x7UfhJHAsqSUaO6CA6fMfUUcCL_hW75rIld6pV2_rHepFejLMnsePZ51X78PDzIZFmEZ1DA',
        },
        responseType: 'blob',
      });

      if (response.status === 200) {
        const url = window.URL.createObjectURL(new Blob([response.data]));
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', file_name);
        document.body.appendChild(link);
        link.click();
        link.parentNode?.removeChild(link);
        window.URL.revokeObjectURL(url);
      }
    } catch (error) {
      console.warn('Error downloading file', error);
    }
  };

  const handleSubmitDate = async () => {
    try {
      const res = await axios.get(
        `http://185.84.161.188:11602/api/v1/machine?from=${from}:00Z&to=${to}:00Z`,
        {
          headers: {
            Authorization: 'Bearer eyJhbGciOiJFUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJsb2NhbGhvc3Q6ODA4MCIsInN1YiI6ImI0NjliOTNjLWQwNGYtNGJhMS1iZmExLTg4NjYzZGY5ZTg3YSJ9.Gp4vlllGMwkbCE1x7UfhJHAsqSUaO6CA6fMfUUcCL_hW75rIld6pV2_rHepFejLMnsePZ51X78PDzIZFmEZ1DA',
          },
        }
      );
      handleData(res.data);
    } catch (error) {
      console.warn('Error fetching history data', error);
    }
  };

  const renderChartButton = (
    label: string,
    chartState: boolean,
    setChartState: React.Dispatch<React.SetStateAction<boolean>>
  ) => (
    <button
      key={label}
      onClick={() => setChartState(prev => !prev)}
      className={`p-2 m-2 ${chartState ? 'bg-indigo-500' : 'bg-red-500'} hover:bg-indigo-600 text-white rounded-lg shadow-md transition duration-300`}
    >
      {chartState ? `Hide ${label} chart` : `Show ${label} chart`}
    </button>
  );
  const mqttClient = useRef<mqtt.MqttClient | null>(null);

  const connectRealTime = () => {
    const clientId = `mqttx_${Date.now()}_${Math.random().toString(16).slice(2, 8)}`; // Unique random client ID
    const client = mqtt.connect("ws://185.84.161.188:9001/mqtt", {
      clientId: clientId,
      username: "changerzaryx",
      password: "cn16022547",
      protocol: "ws",
    });
    return client;
  };

  const handleSwitchMode = () => {
    setSwitchMode((prev) => !prev);
    triggerSwitchMode()
  }

  useEffect(() => {
    // Connect to the MQTT broker
    mqttClient.current = connectRealTime();

    // Handle connection event
    mqttClient.current?.on("connect", () => {
      console.log("Connected to MQTT broker");

      // Subscribe to the topic
      mqttClient.current?.subscribe("topgun/data", (err) => {
        if (!err) {
          console.log("Subscribed to topic: topgun/data");
        } else {
          console.error("Subscription error:", err);
        }
      });
    });

    // Handle incoming messages
    mqttClient.current?.on("message", (_topic, message: Buffer) => {
      const messageArray = Array.from(message);
      handleRealtime(messageArray);
    });

    // Handle connection errors
    mqttClient.current?.on("error", (error) => {
      console.error("MQTT connection error:", error);
    });

    // Clean up when the component unmounts
    return () => {
      mqttClient.current?.end();
      console.log("Disconnected from MQTT broker");
    };
  }, []);
  return (
    <div className="flex flex-col justify-start gap-4 mt-4 h-auto w-1/6 bg-gray-100 p-6 rounded-lg shadow-md">
      <Button onClick={handleSwitchMode} className={switchMode ? "bg-red-600" : "bg-black"}>{switchMode ? "Show graph" : "Show real time"}</Button>
      {renderChartButton('energy', showEnergyChart, setShowEnergyChart)}
      {renderChartButton('position', showPositionChart, setShowPositionChart)}
      {renderChartButton('pressure', showPressureChart, setShowPressureChart)}
      {renderChartButton('punch', showPunchChart, setShowPunchChart)}

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
        className={`mt-4 p-4 rounded-lg font-semibold transition duration-300 ease-in-out transform hover:scale-105 w-full text-white ${isConnected ? 'bg-red-600' : 'bg-green-600'}`}
      >
        {isConnected ? 'Disconnect WebSocket' : 'Connect WebSocket'}
      </button>

      <div className="grid w-full max-w-sm items-center gap-1.5">
        <Label htmlFor="picture">Upload model</Label>
        <Input id="picture" type="file" onChange={handleFileChange} />
        <Button onClick={handleSubmit}>Submit</Button>

        <Dialog>
          <DialogTrigger asChild>
            <Button variant="outline" onClick={handleViewFiles}>
              View audio files
            </Button>
          </DialogTrigger>
          <DialogContent className="min-w-fit">
            <DialogHeader>
              <DialogTitle>This is your files</DialogTitle>
              <DialogDescription>Select file to download</DialogDescription>
            </DialogHeader>
            <div className="table-container max-h-96 overflow-y-auto">
              <table className="min-w-full bg-white border border-gray-200">
                <thead>
                  <tr className="bg-gray-200 text-gray-600 uppercase text-sm leading-normal">
                    {['ID', 'File Name', 'File Path', 'File Type', 'Created At', 'Action'].map(header => (
                      <th key={header} className="py-3 px-6 text-left">{header}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="text-gray-600 text-sm font-light">
                  {fileData && fileData.length > 0 ? (
                    fileData.filter(data => data && data.ID).map(data => (
                      <tr key={data.ID} className="border-b border-gray-200 hover:bg-gray-100">
                        <td className="py-3 px-6 text-left whitespace-nowrap">{data.ID}</td>
                        <td className="py-3 px-6 text-left">{data.file_name}</td>
                        <td className="py-3 px-6 text-left">{data.file_path}</td>
                        <td className="py-3 px-6 text-left">{data.file_type}</td>
                        <td className="py-3 px-6 text-left">{data.created_at}</td>
                        <td className="py-3 px-6 text-center">
                          <button
                            onClick={() => handleButtonClick(data.ID, data.file_name)}
                            className={`py-2 px-4 rounded ${selectedButton === data.ID ? 'bg-gray-300' : 'bg-gray-950'} text-white`}
                          >
                            Select
                          </button>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={6} className="text-center py-4">
                        No data available
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
            <DialogFooter>
              <Button onClick={() => selectedButton !== null && handleDownload(selectedButton, filename)}>
                Download
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        <Dialog>
          <DialogTrigger asChild>
            <Button variant="outline">History Data</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>History data</DialogTitle>
              <DialogDescription>
                Please insert your Date and Time and select what you want to view
              </DialogDescription>
            </DialogHeader>
            <div className="flex flex-col">
              <Label htmlFor="from">From Date and Time</Label>
              <Input
                type="datetime-local"
                id="from"
                value={from}
                onChange={(e) => setFrom(e.target.value)}
                className="mb-4"
              />
              <Label htmlFor="to">To Date and Time</Label>
              <Input
                type="datetime-local"
                id="to"
                value={to}
                onChange={(e) => setTo(e.target.value)}
              />
            </div>
            <DialogFooter>
              <Button onClick={handleSubmitDate}>Get History</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};

export default Sidebar;