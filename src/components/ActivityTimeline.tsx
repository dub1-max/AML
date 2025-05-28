import React from 'react';
import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    Area,
    AreaChart
} from 'recharts';

interface ActivityTimelineProps {
    data: {
        date: string;
        count: number;
    }[];
}

const ActivityTimeline: React.FC<ActivityTimelineProps> = ({ data }) => {
    return (
        <div className="w-full h-[200px]">
            <ResponsiveContainer width="100%" height="100%">
                <AreaChart
                    data={data}
                    margin={{
                        top: 10,
                        right: 10,
                        left: 0,
                        bottom: 0,
                    }}
                >
                    <defs>
                        <linearGradient id="colorCount" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#4A1D96" stopOpacity={0.1}/>
                            <stop offset="95%" stopColor="#4A1D96" stopOpacity={0}/>
                        </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                    <XAxis
                        dataKey="date"
                        tick={{ fontSize: 12 }}
                        tickLine={false}
                        axisLine={false}
                    />
                    <YAxis
                        tick={{ fontSize: 12 }}
                        tickLine={false}
                        axisLine={false}
                        tickFormatter={(value) => Math.floor(value)}
                    />
                    <Tooltip
                        contentStyle={{
                            backgroundColor: 'white',
                            border: 'none',
                            borderRadius: '8px',
                            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)'
                        }}
                        formatter={(value: number) => [Math.floor(value), 'Customers']}
                        labelFormatter={(label) => `Date: ${label}`}
                    />
                    <Area
                        type="monotone"
                        dataKey="count"
                        stroke="#4A1D96"
                        strokeWidth={2}
                        fill="url(#colorCount)"
                        dot={{ fill: '#4A1D96', r: 4 }}
                        activeDot={{ r: 6, fill: '#4A1D96' }}
                    />
                </AreaChart>
            </ResponsiveContainer>
        </div>
    );
};

export default ActivityTimeline; 