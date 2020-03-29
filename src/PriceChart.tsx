import React from "react";
import {
  XAxis,
  YAxis,
  CartesianGrid,
  ReferenceArea,
  ResponsiveContainer,
  Line,
  LineChart,
  ReferenceLine,
  ReferenceDot
} from "recharts";
import "./app.scss";
import { ParsedPosition, DataPoint } from "./types";

const axisColor = "white";
const lineColor = "red";
const lessDarkColor = "#414141";

export default function PriceChart({
  data,
  parsedPositions,
  yMax,
  hasFinished
}: {
  data: DataPoint[];
  parsedPositions: ParsedPosition[];
  yMax: number;
  hasFinished: boolean;
}) {
  const lineProps = {
    stroke: "gray",
    strokeDasharray: "3 3"
  };
  const dotProps = {
    stroke: lessDarkColor,
    fill: "white",
    fillOpacity: 0.1
  };
  const xAxisProps = {
    name: "time",
    dy: 10, // Give the x-axis label some top margin
    stroke: axisColor,
    interval: "preserveStartEnd" as "preserveStartEnd"
  };

  /**
   * Necesary to give white color to the label's text
   */
  function ReferenceLabel(props: any) {
    const { textAnchor, viewBox, text } = props;
    return (
      <text
        x={viewBox.x - 25}
        y={viewBox.y + 15}
        fill={"white"}
        textAnchor={textAnchor}
      >
        {text}
      </text>
    );
  }

  return (
    <ResponsiveContainer>
      <LineChart>
        {hasFinished ? (
          <XAxis
            dataKey="time"
            domain={["auto", "auto"]}
            minTickGap={50}
            tickFormatter={timeStr =>
              new Date(timeStr).toDateString().split(" ").slice(1).join(" ")
            }
            {...xAxisProps}
          />
        ) : (
          <XAxis
            dataKey="i"
            type="number"
            domain={["auto", yMax]}
            tickFormatter={day => `day ${day}`}
            {...xAxisProps}
          />
        )}
        <YAxis
          dataKey="price"
          type="number"
          name="price"
          unit=" $"
          domain={["auto", "auto"]}
          stroke={axisColor}
          hide={!hasFinished}
        />
        <CartesianGrid strokeDasharray="3 3" stroke={"#292929"} />
        {parsedPositions.map(({ xFrom, xTo, yFrom, yTo, isWin }, i) => (
          <ReferenceArea
            key={`position-area-${i}`}
            x1={xFrom}
            x2={xTo}
            y1={yFrom}
            y2={yTo}
            fill={isWin ? "green" : "red"}
            stroke="gray"
            strokeOpacity={0.3}
            fillOpacity={0.4}
          />
        ))}
        {parsedPositions.map(({ xFrom }, i) => (
          <ReferenceLine key={`buyline${i}`} x={xFrom} {...lineProps} />
        ))}
        {parsedPositions.map(({ xTo, isOpen }, i) =>
          isOpen ? null : (
            <ReferenceLine key={`sellline${i}`} x={xTo} {...lineProps} />
          )
        )}
        {parsedPositions.map(({ xFrom, yFrom }, i) => (
          <ReferenceDot
            key={`buydot${i}`}
            label={<ReferenceLabel text="Buy" />}
            x={xFrom}
            y={yFrom}
            {...dotProps}
          />
        ))}
        {parsedPositions.map(({ xTo, yTo, isOpen }, i) =>
          isOpen ? null : (
            <ReferenceDot
              key={`selldot${i}`}
              label={<ReferenceLabel text="Sell" />}
              x={xTo}
              y={yTo}
              {...dotProps}
            />
          )
        )}
        <Line
          isAnimationActive={false}
          data={data}
          type="monotone"
          dataKey="price"
          stroke={lineColor}
          strokeWidth={2}
          strokeOpacity={1}
          dot={false}
        />
        {/* <ReferenceArea x1={tick} x2={100} y1={min} y2={max} fill="white" fillOpacity={1} /> */}
      </LineChart>
    </ResponsiveContainer>
  );
}
