import React, { useMemo } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { PriceHistoryData } from '../types';

interface PriceHistoryChartProps {
  basePrice: number;
}

const generatePriceHistory = (basePrice: number): PriceHistoryData[] => {
    const data: PriceHistoryData[] = [];
    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun"];
    let currentPrice = basePrice * (1 + (Math.random() - 0.5) * 0.2); // Start price +- 10%

    for (let i = 0; i < months.length; i++) {
        data.push({
            month: months[i],
            price: Math.round(currentPrice)
        });
        // Fluctuate price for next month
        currentPrice *= (1 + (Math.random() - 0.5) * 0.1);
    }
    
    // Ensure the last price is the current base price
    data[data.length-1].price = basePrice;
    
    return data;
}

const CustomTooltip: React.FC<any> = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-surface/80 dark:bg-dark-surface/80 backdrop-blur-sm p-3 rounded-md border border-on-surface/20 dark:border-dark-on-surface/20">
        <p className="label text-on-surface-secondary dark:text-dark-on-surface-secondary">{`${label}`}</p>
        <p className="intro text-on-surface dark:text-dark-on-surface">{`Price: ₹${payload[0].value}`}</p>
      </div>
    );
  }
  return null;
};


const PriceHistoryChart: React.FC<PriceHistoryChartProps> = ({ basePrice }) => {
  const data = useMemo(() => generatePriceHistory(basePrice), [basePrice]);
  
  return (
    <div className="mt-6">
        <h4 className="text-lg font-semibold text-on-surface dark:text-dark-on-surface mb-2">Price History (6 Months)</h4>
        <p className="text-sm text-on-surface-secondary dark:text-dark-on-surface-secondary mb-4">Shows estimated price trends for key components. This helps in understanding market fluctuations.</p>
        <div style={{ width: '100%', height: 250 }}>
            <ResponsiveContainer>
                <LineChart
                data={data}
                margin={{
                    top: 5,
                    right: 20,
                    left: -10,
                    bottom: 5,
                }}
                >
                <CartesianGrid strokeDasharray="3 3" stroke="currentColor" className="text-on-surface/20 dark:text-dark-on-surface/20" />
                <XAxis dataKey="month" stroke="currentColor" className="text-on-surface-secondary dark:text-dark-on-surface-secondary" />
                <YAxis stroke="currentColor" className="text-on-surface-secondary dark:text-dark-on-surface-secondary" tickFormatter={(value) => `₹${Number(value/1000).toFixed(0)}k`} />
                <Tooltip content={<CustomTooltip />} />
                <Line type="monotone" dataKey="price" stroke="#c89b7b" strokeWidth={2} activeDot={{ r: 8 }} />
                </LineChart>
            </ResponsiveContainer>
        </div>
    </div>
  );
};

export default PriceHistoryChart;