import React from 'react';
import { observer } from 'mobx-react-lite';
import { aiTradingStore } from '../../store/ai-trading-store';
import { TSentimentItem } from '../../store/types';

const LABEL_META: Record<TSentimentItem['label'], { emoji: string; color: string; text: string }> = {
    EXTREME_FEAR: { emoji: '😱', color: '#e17055', text: 'Extreme Fear' },
    FEAR: { emoji: '😟', color: '#fd79a8', text: 'Fear' },
    NEUTRAL: { emoji: '😐', color: '#a29bfe', text: 'Neutral' },
    GREED: { emoji: '😏', color: '#55efc4', text: 'Greed' },
    EXTREME_GREED: { emoji: '🤑', color: '#00b894', text: 'Extreme Greed' },
};

// Gauge needle arc
const SentimentGauge: React.FC<{ score: number }> = ({ score }) => {
    // score: -100 to +100 → angle -90 to +90
    const angle = (score / 100) * 90;
    const deg = 90 + angle; // 0° = left, 180° = right
    const color = score > 30 ? '#00b894' : score > -30 ? '#a29bfe' : '#e17055';
    return (
        <div className='ats-sf-gauge'>
            <svg viewBox='0 0 120 65' className='ats-sf-gauge__svg'>
                {/* Arc background */}
                <path
                    d='M10,60 A50,50 0 0,1 110,60'
                    fill='none'
                    stroke='rgba(255,255,255,0.08)'
                    strokeWidth='8'
                    strokeLinecap='round'
                />
                {/* Fear zone */}
                <path
                    d='M10,60 A50,50 0 0,1 60,10'
                    fill='none'
                    stroke='rgba(225,112,85,0.4)'
                    strokeWidth='8'
                    strokeLinecap='round'
                />
                {/* Greed zone */}
                <path
                    d='M60,10 A50,50 0 0,1 110,60'
                    fill='none'
                    stroke='rgba(0,184,148,0.4)'
                    strokeWidth='8'
                    strokeLinecap='round'
                />
                {/* Needle */}
                <line
                    x1='60'
                    y1='60'
                    x2={60 + 42 * Math.cos(((deg - 180) * Math.PI) / 180)}
                    y2={60 + 42 * Math.sin(((deg - 180) * Math.PI) / 180)}
                    stroke={color}
                    strokeWidth='2.5'
                    strokeLinecap='round'
                />
                <circle cx='60' cy='60' r='4' fill={color} />
                <text x='60' y='62' textAnchor='middle' className='ats-sf-gauge__score' style={{ fill: color }}>
                    {score > 0 ? '+' : ''}
                    {score.toFixed(0)}
                </text>
            </svg>
            <div className='ats-sf-gauge__labels'>
                <span style={{ color: '#e17055' }}>Fear</span>
                <span style={{ color: '#a29bfe' }}>Neutral</span>
                <span style={{ color: '#00b894' }}>Greed</span>
            </div>
        </div>
    );
};

const SentimentCard: React.FC<{ item: TSentimentItem }> = ({ item }) => {
    const meta = LABEL_META[item.label];
    const relTime = Math.round((Date.now() - item.timestamp) / 60000);
    const timeStr = relTime < 1 ? 'Just now' : relTime < 60 ? `${relTime}m ago` : `${Math.floor(relTime / 60)}h ago`;
    return (
        <div className='ats-sf-card'>
            <div className='ats-sf-card__top'>
                <span className='ats-sf-card__market'>{item.market}</span>
                <span className='ats-sf-card__badge' style={{ background: `${meta.color}20`, color: meta.color }}>
                    {meta.emoji} {meta.text}
                </span>
            </div>
            <div className='ats-sf-card__score-row'>
                <div className='ats-sf-card__score-bar-wrap'>
                    <div className='ats-sf-card__score-bar'>
                        <div
                            className='ats-sf-card__score-fill'
                            style={{
                                width: `${Math.abs(item.score)}%`,
                                background: meta.color,
                                marginLeft: item.score < 0 ? `${50 - Math.abs(item.score / 2)}%` : '50%',
                            }}
                        />
                        <div className='ats-sf-card__score-mid' />
                    </div>
                </div>
                <span className='ats-sf-card__score-val' style={{ color: meta.color }}>
                    {item.score > 0 ? '+' : ''}
                    {item.score.toFixed(0)}
                </span>
            </div>
            <div className='ats-sf-card__headline'>{item.headline}</div>
            <div className='ats-sf-card__footer'>
                <span className='ats-sf-card__source'>{item.source}</span>
                <span className='ats-sf-card__time'>{timeStr}</span>
                <div className='ats-sf-card__tags'>
                    {item.tags.map(t => (
                        <span key={t} className='ats-sf-card__tag'>
                            #{t}
                        </span>
                    ))}
                </div>
            </div>
        </div>
    );
};

const SentimentFeed: React.FC = observer(() => {
    const { sentiment } = aiTradingStore;
    const avgScore = sentiment.reduce((s, i) => s + i.score, 0) / (sentiment.length || 1);
    const overallLabel =
        avgScore > 60
            ? 'EXTREME_GREED'
            : avgScore > 20
              ? 'GREED'
              : avgScore > -20
                ? 'NEUTRAL'
                : avgScore > -60
                  ? 'FEAR'
                  : 'EXTREME_FEAR';
    const overallMeta = LABEL_META[overallLabel];

    return (
        <div className='ats-sentiment'>
            <div className='ats-sf__header'>
                <span className='ats-pulse-dot' />
                <span className='ats-sf__title'>Market Sentiment</span>
                <span className='ats-sf__overall' style={{ color: overallMeta.color }}>
                    {overallMeta.emoji} {overallMeta.text}
                </span>
            </div>

            {/* Overall gauge */}
            <SentimentGauge score={parseFloat(avgScore.toFixed(1))} />

            {/* Per-market cards */}
            <div className='ats-sf__list'>
                {sentiment.map(item => (
                    <SentimentCard key={item.id} item={item} />
                ))}
            </div>
        </div>
    );
});

export default SentimentFeed;
