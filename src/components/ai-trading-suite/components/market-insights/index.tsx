import React from 'react';
import { observer } from 'mobx-react-lite';
import { aiTradingStore } from '../../store/ai-trading-store';
import { TMarketInsight } from '../../store/types';

const formatTime = (ts: number): string => {
    const diff = Date.now() - ts;
    if (diff < 60000) return `${Math.floor(diff / 1000)}s ago`;
    if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
    return `${Math.floor(diff / 3600000)}h ago`;
};

const PriorityIcon: React.FC<{ priority: string }> = ({ priority }) => {
    if (priority === 'HIGH') return <span className='ats-priority ats-priority--high' title='High Priority'>🔴</span>;
    if (priority === 'MEDIUM') return <span className='ats-priority ats-priority--medium' title='Medium Priority'>🟡</span>;
    return <span className='ats-priority ats-priority--low' title='Low Priority'>🟢</span>;
};

const InsightRow: React.FC<{ insight: TMarketInsight }> = ({ insight }) => (
    <div className={`ats-insight-row ats-insight-row--${insight.priority.toLowerCase()}`}>
        <PriorityIcon priority={insight.priority} />
        <div className='ats-insight-row__body'>
            <span className='ats-insight-row__text'>{insight.text}</span>
            <div className='ats-insight-row__meta'>
                <span className='ats-market-chip ats-market-chip--sm'>{insight.asset}</span>
                <span className='ats-insight-row__time'>{formatTime(insight.timestamp)}</span>
            </div>
        </div>
    </div>
);

const MarketInsights: React.FC = observer(() => {
    const { insights } = aiTradingStore;

    return (
        <div className='ats-market-insights'>
            <div className='ats-insights-header'>
                <div className='ats-insights-title'>
                    <span className='ats-pulse-dot' />
                    Automated Market Insights
                </div>
                <div className='ats-insights-subtitle'>AI-generated commentary • live feed</div>
            </div>

            <div className='ats-insights-legend'>
                <span><span className='ats-priority ats-priority--high'>🔴</span> High</span>
                <span><span className='ats-priority ats-priority--medium'>🟡</span> Medium</span>
                <span><span className='ats-priority ats-priority--low'>🟢</span> Low</span>
            </div>

            {insights.length === 0 ? (
                <div className='ats-empty'>Scanning markets for insights...</div>
            ) : (
                <div className='ats-insights-feed'>
                    {insights.map(insight => (
                        <InsightRow key={insight.id} insight={insight} />
                    ))}
                </div>
            )}
        </div>
    );
});

export default MarketInsights;
