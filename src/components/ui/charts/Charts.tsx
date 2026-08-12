import React from 'react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  BarChart,
  Bar,
  AreaChart,
  Area,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend,
} from 'recharts';
import { Card } from '../Card';

const COLOR_PALETTE = ['#2563eb', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4'];

export interface LineChartCardProps {
  title: string;
  subtitle?: string;
  data: any[];
  xKey: string;
  lines: { key: string; name: string; color?: string }[];
  height?: number;
  className?: string;
}

export const LineChartCard: React.FC<LineChartCardProps> = ({
  title,
  subtitle,
  data,
  xKey,
  lines,
  height = 260,
  className = '',
}) => {
  return (
    <Card className={className}>
      <div className="mb-4">
        <h4 className="text-xs font-bold uppercase tracking-wider text-slate-800">{title}</h4>
        {subtitle && <p className="text-[11px] text-slate-400 mt-0.5">{subtitle}</p>}
      </div>
      <div style={{ width: '100%', height }}>
        <ResponsiveContainer>
          <LineChart data={data} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
            <XAxis dataKey={xKey} tick={{ fontSize: 10, fill: '#64748b' }} axisLine={{ stroke: '#e2e8f0' }} />
            <YAxis tick={{ fontSize: 10, fill: '#64748b' }} axisLine={{ stroke: '#e2e8f0' }} />
            <Tooltip contentStyle={{ fontSize: 11, borderRadius: 12, border: '1px solid #cbd5e1' }} />
            <Legend wrapperStyle={{ fontSize: 11, paddingTop: 8 }} />
            {lines.map((l, idx) => (
              <Line
                key={l.key}
                type="monotone"
                dataKey={l.key}
                name={l.name}
                stroke={l.color || COLOR_PALETTE[idx % COLOR_PALETTE.length]}
                strokeWidth={2}
                dot={{ r: 3 }}
              />
            ))}
          </LineChart>
        </ResponsiveContainer>
      </div>
    </Card>
  );
};

export interface BarChartCardProps {
  title: string;
  subtitle?: string;
  data: any[];
  xKey: string;
  bars: { key: string; name: string; color?: string }[];
  height?: number;
  className?: string;
}

export const BarChartCard: React.FC<BarChartCardProps> = ({
  title,
  subtitle,
  data,
  xKey,
  bars,
  height = 260,
  className = '',
}) => {
  return (
    <Card className={className}>
      <div className="mb-4">
        <h4 className="text-xs font-bold uppercase tracking-wider text-slate-800">{title}</h4>
        {subtitle && <p className="text-[11px] text-slate-400 mt-0.5">{subtitle}</p>}
      </div>
      <div style={{ width: '100%', height }}>
        <ResponsiveContainer>
          <BarChart data={data} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
            <XAxis dataKey={xKey} tick={{ fontSize: 10, fill: '#64748b' }} axisLine={{ stroke: '#e2e8f0' }} />
            <YAxis tick={{ fontSize: 10, fill: '#64748b' }} axisLine={{ stroke: '#e2e8f0' }} />
            <Tooltip contentStyle={{ fontSize: 11, borderRadius: 12, border: '1px solid #cbd5e1' }} />
            <Legend wrapperStyle={{ fontSize: 11, paddingTop: 8 }} />
            {bars.map((b, idx) => (
              <Bar
                key={b.key}
                dataKey={b.key}
                name={b.name}
                fill={b.color || COLOR_PALETTE[idx % COLOR_PALETTE.length]}
                radius={[4, 4, 0, 0]}
              />
            ))}
          </BarChart>
        </ResponsiveContainer>
      </div>
    </Card>
  );
};

export interface AreaChartCardProps {
  title: string;
  subtitle?: string;
  data: any[];
  xKey: string;
  areas: { key: string; name: string; color?: string }[];
  height?: number;
  className?: string;
}

export const AreaChartCard: React.FC<AreaChartCardProps> = ({
  title,
  subtitle,
  data,
  xKey,
  areas,
  height = 260,
  className = '',
}) => {
  return (
    <Card className={className}>
      <div className="mb-4">
        <h4 className="text-xs font-bold uppercase tracking-wider text-slate-800">{title}</h4>
        {subtitle && <p className="text-[11px] text-slate-400 mt-0.5">{subtitle}</p>}
      </div>
      <div style={{ width: '100%', height }}>
        <ResponsiveContainer>
          <AreaChart data={data} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
            <XAxis dataKey={xKey} tick={{ fontSize: 10, fill: '#64748b' }} axisLine={{ stroke: '#e2e8f0' }} />
            <YAxis tick={{ fontSize: 10, fill: '#64748b' }} axisLine={{ stroke: '#e2e8f0' }} />
            <Tooltip contentStyle={{ fontSize: 11, borderRadius: 12, border: '1px solid #cbd5e1' }} />
            <Legend wrapperStyle={{ fontSize: 11, paddingTop: 8 }} />
            {areas.map((a, idx) => {
              const color = a.color || COLOR_PALETTE[idx % COLOR_PALETTE.length];
              return (
                <Area
                  key={a.key}
                  type="monotone"
                  dataKey={a.key}
                  name={a.name}
                  stroke={color}
                  fill={color}
                  fillOpacity={0.15}
                  strokeWidth={2}
                />
              );
            })}
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </Card>
  );
};

export interface DonutChartCardProps {
  title: string;
  subtitle?: string;
  data: { name: string; value: number; color?: string }[];
  height?: number;
  className?: string;
}

export const DonutChartCard: React.FC<DonutChartCardProps> = ({
  title,
  subtitle,
  data,
  height = 260,
  className = '',
}) => {
  return (
    <Card className={className}>
      <div className="mb-4">
        <h4 className="text-xs font-bold uppercase tracking-wider text-slate-800">{title}</h4>
        {subtitle && <p className="text-[11px] text-slate-400 mt-0.5">{subtitle}</p>}
      </div>
      <div style={{ width: '100%', height }}>
        <ResponsiveContainer>
          <PieChart>
            <Pie
              data={data}
              innerRadius={55}
              outerRadius={80}
              paddingAngle={4}
              dataKey="value"
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color || COLOR_PALETTE[index % COLOR_PALETTE.length]} />
              ))}
            </Pie>
            <Tooltip contentStyle={{ fontSize: 11, borderRadius: 12, border: '1px solid #cbd5e1' }} />
            <Legend wrapperStyle={{ fontSize: 11, paddingTop: 8 }} />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </Card>
  );
};
