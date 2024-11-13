export interface Data {
  "Energy Consumption": { Power: number };
  Voltage: { "L1-GND": number; "L2-GND": number; "L3-GND": number };
  Pressure: number;
  Force: number;
  "Cycle Count": number;
  "Position of the Punch": number;
}

export interface Energy {
  Power: number;
  Time: string;
}

export interface Voltage {
  "L1-GND": number;
  "L2-GND": number;
  "L3-GND": number;
  Time: string;
}

export interface Pressure {
  Pressure: number;
  Time: string;
}
