import React, { FC } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

interface Props {
  data: {
    title: string;
    value: number;
  }[];
}
const Stats:FC<Props> = ({ data }) => {
  return (
    <div className="w-full">
      <Card className="flex flex-col md:grid md:grid-cols-3">
        {data.map((item, index) => {
          return (
            <div key={index}>
              <CardHeader>
                <CardTitle>{item.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <p>{item.value}</p>
              </CardContent>
            </div>
          );
        })}
      </Card>
    </div>
  );
};

export default Stats;
