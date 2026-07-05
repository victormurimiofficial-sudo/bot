import React from 'react';
import { observer } from 'mobx-react-lite';
import { aiTradingStore } from '../../store/ai-trading-store';
import { TMarketAnalytics } from '../../store/types';

// ─── Meter Bar ───────────────────────────────────────────────
const MeterBar: React.FC<{ label: string; value: number; max?: number; unit?: string; color?: string }> = ({
    label, value, max = 100, unit = '%', color,
}) => {
    const pct = Math.min(100, (value / max) * 100);
    const barColor = color ?? (pct > 70 ? 'var(--ats-accent-green)' : pct > 40 ? 'var(--ats-accent)' : 'var(--ats-accent-warn)');
    return (
        <div className='ats-meter'>
            <div className='ats-meter__top'>
                <span className='ats-meter__label'>{label}</span>
                <span className='ats-meter__value'>{typeof value === 'number' ? value.toFixed(value < 10 ? 3 : 1) : value}{unit}</span>
            </div>
            <div className='ats-meter__track'>
                <div className='ats-meter__fill' style={{ width: `${pct}%`, background: barColor }} />
            </div>
        </div>
    );
};

// ─── Digit Heatmap ───────────────────────────────────────────
const DigitHeatmap: React.FC<{ digitBias: number[] }> = ({ digitBias }) => {
    const max = Math.max(...digitBias);
    return (
        <div className='ats-digit-heatmap'>
            <div className='ats-section-label'>Digit Frequency Heatmap</div>
            <div className='ats-digit-heatmap__grid'>
                {digitBias.map((val, i) => {
                    const intensity = val / max;
                    const bg = `rgba(0, 200, 180, ${0.15 + intensity * 0.75})`;
                    return (
                        <div key={i} className='ats-digit-heatmap__cell' style={{ background: bg }} title={`Digit ${i}: ${val}`}>
                            <span className='ats-digit-heatmap__digit'>{i}</span>
                            <span className='ats-digit-heatmap__count'>{val}</span>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

// ─── Analytics Panel ─────────────────────────────────────────
const AnalyticsPanel: React.FC<{ data: TMarketAnalytics }> = observer(({ data }) => (
    <div className='ats-analytics-body'>
        {/* Velocity Section */}
        <div className='ats-analytics-section'>
            <div className='ats-section-label'>⚡ Tick Velocity</div>
            <MeterBar label='Max Tick Velocity' value={data.maxTickVelocity} max={5} unit='' color='var(--ats-accent)' />
            <MeterBar label='Avg Tick Velocity' value={data.avgTickVelocity} max={5} unit='' color='var(--ats-accent-blue)' />
        </div>

        {/* Compression / Expansion */}
        <div className='ats-analytics-section'>
            <div className='ats-section-label'>📉 Compression & Expansion</div>
            <MeterBar label='Price Compression Index' value={data.compressionIndex} />
            <MeterBar label='Expansion Strength' value={data.expansionStrength} color='var(--ats-accent-green)' />
            <MeterBar label='Volatility Momentum' value={data.volatilityMomentum} />
        </div>

        {/* Trend & Reversal */}
        <div className='ats-analytics-section'>
            <div className='ats-section-label'>📈 Trend & Reversal</div>
            <MeterBar label='Trend Persistence' value={data.trendPersistence} color='var(--ats-accent-green)' />
            <MeterBar label='Momentum Acceleration' value={Math.abs(data.momentumAcceleration)} max={4} unit='' color='var(--ats-accent)' />
            <MeterBar label='Reversal Probability' value={data.reversalProbability} color='var(--ats-accent-warn)' />
            <MeterBar label='Market Noise Index' value={data.noiseIndex} color='var(--ats-accent-muted)' />
        </div>

        {/* Digit Stats */}
        <div className='ats-analytics-section'>
            <div className='ats-section-label'>🔢 Digit Distribution</div>
            <DigitHeatmap digitBias={data.digitBias} />
            <div className='ats-even-odd'>
                <div className='ats-even-odd__row'>
                    <span>Even</span>
                    <div className='ats-even-odd__bar'>
                        <div className='ats-even-odd__fill ats-even-odd__fill--even' style={{ width: `${data.evenOddBalance}%` }} />
                        <div className='ats-even-odd__fill ats-even-odd__fill--odd' style={{ width: `${100 - data.evenOddBalance}%` }} />
                    </div>
                    <span>Odd</span>
                </div>
                <div className='ats-even-odd__labels'>
                    <span>{data.evenOddBalance.toFixed(1)}%</span>
                    <span>{(100 - data.evenOddBalance).toFixed(1)}%</span>
                </div>
            </div>
            <MeterBar label='Over/Under Probability' value={data.overUnderProbability} color='var(--ats-accent-blue)' />
        </div>

        {/* AI Signals */}
        <div className='ats-analytics-section'>
            <div className='ats-section-label'>🤖 AI Signal Quality</div>
            <MeterBar label='Tick Entropy' value={data.tickEntropy} max={1} unit='' color='var(--ats-accent-warn)' />
            <MeterBar label='Pattern Stability' value={data.patternStability} color='var(--ats-accent-green)' />
            <MeterBar label='Market Sentiment Score' value={data.sentimentScore} color='var(--ats-accent)' />
            <MeterBar label='AI Confidence Index' value={data.aiConfidenceIndex} color='var(--ats-accent-green)' />
            <MeterBar label='Liquidity Pressure' value={data.liquidityPressure} color='var(--ats-accent-blue)' />
            <MeterBar label='Signal Reliability Index' value={data.signalReliability} color='var(--ats-accent-green)' />
        </div>
    </div>
));

// ─── Market Analytics ─────────────────────────────────────────
const MarketAnalytics: React.FC = observer(() => {
    const { assets, analytics, selectedAnalyticsAsset } = aiTradingStore;
    const data = analytics.get(selectedAnalyticsAsset);
    const selectedAsset = assets.find(a => a.id === selectedAnalyticsAsset);

    return (
        <div className='ats-market-analytics'>
            <div className='ats-analytics-header'>
                <div className='ats-analytics-title'>
                    <span className='ats-pulse-dot' />
                    Advanced Statistical Telemetry
                </div>
                <select
                    className='ats-asset-select'
                    value={selectedAnalyticsAsset}
                    onChange={e => aiTradingStore.setSelectedAnalyticsAsset(e.target.value)}
                    aria-label='Select asset for analytics'
                >
                    {assets.map(a => (
                        <option key={a.id} value={a.id}>{a.name}</option>
                    ))}
                </select>
            </div>

            {selectedAsset && (
                <div className='ats-analytics-asset-info'>
                    <span className='ats-analytics-asset-name'>{selectedAsset.name}</span>
                    <span className={`ats-risk-badge ats-risk-badge--${selectedAsset.risk.toLowerCase()}`}>{selectedAsset.risk}</span>
                    <span className='ats-analytics-health'>❤ Health: {selectedAsset.marketHealth}%</span>
                </div>
            )}

            {data ? <AnalyticsPanel data={data} /> : (
                <div className='ats-empty'>Select an asset to view analytics</div>
            )}
        </div>
    );
});

export default MarketAnalytics;
