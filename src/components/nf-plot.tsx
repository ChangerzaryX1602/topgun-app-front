import mqtt from 'mqtt';
import React, {useRef, useEffect} from 'react'

const NFPlot = () => {


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
    useEffect(() => {
        // Connect to the MQTT broker
        mqttClient.current = connectRealTime();
    
        // Handle connection event
        mqttClient.current?.on("connect", () => {
          console.log("Connected to MQTT broker");
    
          // Subscribe to the topic
          mqttClient.current?.subscribe("topgun/predict_kku", (err) => {
            if (!err) {
              console.log("Subscribed to topic: predict");
            } else {
              console.error("Subscription error:", err);
            }
          });
        });
    
        // Handle incoming messages
        mqttClient.current?.on("message", (_topic, message: Buffer) => {
          console.log("wow", message);
          
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
    <div>NFPlot</div>
  )
}

export default NFPlot