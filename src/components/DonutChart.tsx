import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';

interface DonutChartData {
    name: string;
    value: number;
    color: string;
}

interface DonutChartProps {
    data: DonutChartData[];
    title: string;
    centerText?: {
        label: string;
        value: string | number;
    };
}

const DonutChart: React.FC<DonutChartProps> = ({ data, title, centerText }) => {
    const total = data.reduce((sum, item) => sum + item.value, 0);

    return (
        <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-base font-medium text-gray-900 mb-4">{title}</h3>
            <div className="w-full h-[300px] relative">
                <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                        <Pie
                            data={data}
                            cx="50%"
                            cy="50%"
                            innerRadius={60}
                            outerRadius={80}
                            paddingAngle={0}
                            dataKey="value"
                        >
                            {data.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={entry.color} />
                            ))}
                        </Pie>
                        <Tooltip
                            contentStyle={{
                                backgroundColor: 'white',
                                border: 'none',
                                borderRadius: '8px',
                                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)'
                            }}
                            formatter={(value: number, name: string) => [value, name]}
                        />
                    </PieChart>
                </ResponsiveContainer>
                {centerText && (
                    <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-center">
                        <p className="text-sm text-gray-500">{centerText.label}</p>
                        <p className="text-xl font-bold text-gray-900">{centerText.value}</p>
                    </div>
                )}
            </div>
            <div className="mt-4 space-y-2">
                {data.map((item, index) => (
                    <div key={index} className="flex items-center justify-between">
                        <div className="flex items-center">
                            <div
                                className="w-3 h-3 rounded-full mr-2"
                                style={{ backgroundColor: item.color }}
                            />
                            <span className="text-sm text-gray-600">{item.name}</span>
                        </div>
                        <span className="text-sm font-medium text-gray-900">
                            {item.value}
                        </span>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default DonutChart; 