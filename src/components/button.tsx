import React, { FC, useRef, useEffect } from 'react';
import mqtt from 'mqtt';
import { SendData } from '@/models/data-chart';

const PiButton: FC<{ data: SendData }> = ({ data }) => {
    const mqttClient = useRef<mqtt.MqttClient | null>(null);

    // Connect to the MQTT broker
    const connectPiWebSocket = () => {
        const clientId = `mqttx_${Date.now()}_${Math.random().toString(16).slice(2, 8)}`; // Unique random client ID
        const client = mqtt.connect("ws://185.84.161.188:9001/mqtt", {
            clientId: clientId,
            username: "changerzaryx",
            password: "cn16022547",
            protocol: 'ws',
        });
        return client;
    };
    

    // Initialize MQTT connection on component mount
    useEffect(() => {
        mqttClient.current = connectPiWebSocket();
        mqttClient.current?.on('connect', () => {
            console.log('Connected to MQTT broker');
        });

        mqttClient.current?.on('error', (error) => {
            console.error('MQTT connection error:', error);
        });

        return () => {
            mqttClient.current?.end(); // Clean up MQTT connection
        };
    }, []);

    // Publish JSON message to MQTT topic
    const sendMessage = () => {
        const topic = data.Topic;
        const message = JSON.stringify({ payload: data.Payload }); // Convert to JSON string
        mqttClient.current?.publish(topic, message, (error) => {
            if (error) {
                console.error('Failed to publish message:', error);
            } else {
                console.log(`Message sent to ${topic}: ${message}`);
            }
        });
    };

    return (
        <button
            onClick={sendMessage}
            className={`p-2 m-2 bg-indigo-500 hover:bg-indigo-600 text-white rounded-lg shadow-md  transition duration-300`}

        >
            Send JSON
        </button>
    );
};

export default PiButton;
