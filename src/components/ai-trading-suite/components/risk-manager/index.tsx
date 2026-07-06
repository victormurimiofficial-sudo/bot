import React from 'react';
import { observer } from 'mobx-react-lite';
import { aiTradingStore } from '../../store/ai-trading-store';

const GaugeBar: React.FC<{ value: number; max: number; color: string; label: string; suffix?: string }> = ({
    value,
    max,
    color,
    label,
    suffix = '%',
}) => {
    const pct = Math.min(100, (value / max) * 100);
    return (
        <div className='ats-rm-gauge'>
            <div className='ats-rm-gauge__header'>
                <span className='ats-rm-gauge__label'>{label}</span>
                <span className='ats-rm-gauge__val' style={{ color }}>
                    {value}
                    {suffix}
                </span>
            </div>
            <div className='ats-rm-gauge__track'>
                <div className='ats-rm-gauge__fill' style={{ width: `${pct}%`, background: color }} />
            </div>
        </div>
    );
};

const StatBox: React.FC<{ label: string; value: string; sub?: string; accent?: string }> = ({
    label,
    value,
    sub,
    accent,
}) => (
    <div className='ats-rm-stat'>
        <div className='ats-rm-stat__label'>{label}</div>
        <div className='ats-rm-stat__value' style={accent ? { color: accent } : undefined}>
            {value}
        </div>
        {sub && <div className='ats-rm-stat__sub'>{sub}</div>}
    </div>
);

const RiskManager: React.FC = observer(() => {
    const { riskProfile } = aiTradingStore;
    const {
        riskPerTrade,
        maxDailyLoss,
        currentExposure,
        dailyLossUsed,
        balanceEstimate,
        recommendedStake,
        maxPositions,
        currentPositions,
        riskRewardRatio,
        stopLossLevel,
        takeProfitLevel,
    } = riskProfile;

    const dailyPct = Math.min(100, dailyLossUsed);
    const dailyColor = dailyPct > 75 ? '#e17055' : dailyPct > 50 ? '#fdcb6e' : '#00b894';
    const expColor = currentExposure > 25 ? '#e17055' : currentExposure > 15 ? '#fdcb6e' : '#00cec9';
    const posStatus = currentPositions >= maxPositions ? '#e17055' : '#00b894';

    return (
        <div className='ats-risk-manager'>
            {/* Header */}
            <div className='ats-rm__header'>
                <span className='ats-pulse-dot' />
                <span className='ats-rm__title'>Risk Manager</span>
                <span className='ats-rm__balance'>
                    Balance ≈ <strong>${balanceEstimate.toLocaleString()}</strong>
                </span>
            </div>

            {/* Recommended Stake */}
            <div className='ats-rm-stake-card'>
                <div className='ats-rm-stake-card__label'>AI Recommended Stake</div>
                <div className='ats-rm-stake-card__value'>${recommendedStake.toFixed(2)}</div>
                <div className='ats-rm-stake-card__sub'>Based on {riskPerTrade}% risk per trade</div>
            </div>

            {/* Gauges */}
            <div className='ats-rm-gauges'>
                <GaugeBar value={dailyPct} max={100} color={dailyColor} label='Daily Loss Consumed' suffix='%' />
                <GaugeBar value={currentExposure} max={40} color={expColor} label='Current Exposure' suffix='%' />
            </div>

            {/* Controls */}
            <div className='ats-rm-controls'>
                <div className='ats-rm-control'>
                    <label className='ats-rm-control__label'>
                        Risk Per Trade: <strong>{riskPerTrade}%</strong>
                    </label>
                    <input
                        type='range'
                        min={0.1}
                        max={10}
                        step={0.1}
                        value={riskPerTrade}
                        className='ats-rm-slider'
                        onChange={e => aiTradingStore.updateRiskPerTrade(parseFloat(e.target.value))}
                    />
                    <div className='ats-rm-control__ends'>
                        <span>0.1%</span>
                        <span>10%</span>
                    </div>
                </div>
                <div className='ats-rm-control'>
                    <label className='ats-rm-control__label'>
                        Max Daily Loss: <strong>{maxDailyLoss}%</strong>
                    </label>
                    <input
                        type='range'
                        min={1}
                        max={30}
                        step={0.5}
                        value={maxDailyLoss}
                        className='ats-rm-slider'
                        onChange={e => aiTradingStore.updateMaxDailyLoss(parseFloat(e.target.value))}
                    />
                    <div className='ats-rm-control__ends'>
                        <span>1%</span>
                        <span>30%</span>
                    </div>
                </div>
            </div>

            {/* Stats Grid */}
            <div className='ats-rm-stats'>
                <StatBox label='Risk:Reward' value={`1 : ${riskRewardRatio}`} />
                <StatBox label='Stop Loss' value={`${stopLossLevel}%`} accent='#e17055' />
                <StatBox label='Take Profit' value={`${takeProfitLevel}%`} accent='#00b894' />
                <StatBox
                    label='Open Positions'
                    value={`${currentPositions} / ${maxPositions}`}
                    sub={currentPositions >= maxPositions ? '⚠ Max reached' : 'Slots available'}
                    accent={posStatus}
                />
            </div>

            {/* Status banner */}
            <div className={`ats-rm-status ${dailyPct > 75 ? 'ats-rm-status--warn' : 'ats-rm-status--ok'}`}>
                {dailyPct > 75
                    ? '⚠️ Approaching daily loss limit — reduce position size'
                    : '✅ Risk parameters within safe bounds'}
            </div>
        </div>
    );
});

export default RiskManager;
