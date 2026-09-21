"use client";

import { Bar, BarChart, CartesianGrid, Cell, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

const tooltipStyle = { border: "1px solid #e5e8ec", borderRadius: 8, boxShadow: "0 8px 24px rgba(31, 45, 55, .08)", fontSize: 11 };
const currency = (value: number) => `$${(value / 1000).toFixed(value >= 10000 ? 0 : 1)}k`;

export function RevenueChart({ data }: { data: { month: string; revenue: number }[] }) {
  return <ResponsiveContainer width="100%" height="100%"><LineChart data={data} margin={{ top: 10, right: 8, left: -16, bottom: 0 }}><CartesianGrid vertical={false} stroke="#edf0f2" /><XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fill: "#87919a", fontSize: 11 }} dy={8} /><YAxis axisLine={false} tickLine={false} tick={{ fill: "#87919a", fontSize: 11 }} tickFormatter={currency} /><Tooltip contentStyle={tooltipStyle} formatter={(value) => [currency(Number(value)), "Revenue"]} /><Line type="monotone" dataKey="revenue" stroke="#287763" strokeWidth={2.5} dot={{ r: 3.5, fill: "#fff", stroke: "#287763", strokeWidth: 2 }} activeDot={{ r: 5 }} /></LineChart></ResponsiveContainer>;
}

export function ResultChart({ data, type, xKey = "name", yKey = "revenue" }: { data: Record<string, string | number>[]; type: "bar" | "line"; xKey?: string; yKey?: string }) {
  if (type === "line") return <ResponsiveContainer width="100%" height="100%"><LineChart data={data} margin={{ top: 12, right: 15, left: -14, bottom: 0 }}><CartesianGrid vertical={false} stroke="#edf0f2" /><XAxis dataKey={xKey} axisLine={false} tickLine={false} tick={{ fill: "#87919a", fontSize: 11 }} /><YAxis axisLine={false} tickLine={false} tick={{ fill: "#87919a", fontSize: 11 }} tickFormatter={currency} /><Tooltip contentStyle={tooltipStyle} formatter={(value) => [currency(Number(value)), "Revenue"]} /><Line type="monotone" dataKey={yKey} stroke="#287763" strokeWidth={2.5} dot={{ r: 3, fill: "#fff", stroke: "#287763", strokeWidth: 2 }} /></LineChart></ResponsiveContainer>;
  return <ResponsiveContainer width="100%" height="100%"><BarChart data={data.slice(0, 8)} layout="vertical" margin={{ top: 8, right: 15, left: 18, bottom: 0 }}><CartesianGrid horizontal={false} stroke="#edf0f2" /><XAxis type="number" axisLine={false} tickLine={false} tick={{ fill: "#87919a", fontSize: 10 }} tickFormatter={currency} /><YAxis type="category" dataKey={xKey} width={105} axisLine={false} tickLine={false} tick={{ fill: "#54606a", fontSize: 10 }} /><Tooltip contentStyle={tooltipStyle} formatter={(value) => [currency(Number(value)), "Revenue"]} /><Bar dataKey={yKey} radius={[0, 4, 4, 0]} barSize={18}>{data.slice(0, 8).map((_, index) => <Cell key={index} fill={index === 0 ? "#287763" : "#9ac8b9"} />)}</Bar></BarChart></ResponsiveContainer>;
}
