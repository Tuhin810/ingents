"use client";

import React from "react";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

interface ChartData {
  name: string;
  value: number;
}

const data: ChartData[] = [
  { name: "Sent Emails", value: 2129675 },
  { name: "Opened Emails", value: 3933726 },
  { name: "Unopened Emails", value: 524831 },
  { name: "Deleted Emails", value: 244553 },
  { name: "Spammed Emails", value: 354246 },
];

const COLORS = [
  "#1e293b",
  "#a855f7",
  "#2563eb",
  "#fb923c",
  "#706070ff",
];

const DonutChart: React.FC = () => {
  const total = data.reduce((acc, cur) => acc + cur.value, 0);

  const renderCustomLabel = (props: any) => {
    const { value, x, y } = props;
    if (!value || x === undefined || y === undefined) return null;

    const percentage =
      total > 0 ? ((Number(value) / total) * 100).toFixed(0) : "0";

    return (
      <text
        x={x}
        y={y}
        fill="#000"
        textAnchor="middle"
        dominantBaseline="central"
        fontSize={12}
      >
        {`${Number(value).toLocaleString()} (${percentage}%)`}
      </text>
    );
  };

  return (
      <div className="w-full h-[400px] bg-white rounded-2xl p-6 shadow-sm relative hover:shadow-md transition-shadow">
        <ResponsiveContainer>
          <PieChart>
            <Pie
              data={data}
              dataKey="value"
              nameKey="name"
              innerRadius={100}
              outerRadius={150}
              paddingAngle={4}
              label={renderCustomLabel}
            >
              {data.map((_, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={COLORS[index % COLORS.length]}
                />
              ))}
            </Pie>
            <Tooltip
              formatter={(value: number) => `$${value.toLocaleString()}`}
            />

            {/* Legend inside PieChart */}
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      </div>
  );
};

export default DonutChart;
