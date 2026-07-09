import React, { useEffect, useState } from 'react';
import './hedging.scss';

const MARKETS = [
    'Volatility 10 Index',
    'Volatility 10 (1s) Index',
    'Volatility 25 Index',
    'Volatility 25 (1s) Index',
    'Volatility 50 Index',
    'Volatility 50 (1s) Index',
    'Volatility 75 Index',
    'Volatility 75 (1s) Index',
    'Volatility 100 Index',
    'Volatility 100 (1s) Index',
    'Boom 500 Index',
    'Boom 1000 Index',
    'Crash 500 Index',
    'Crash 1000 Index',
    'Step Index',
];

const TRADE_TYPES = ['Even/Odd', 'Over/Under', 'Matches/Differs', 'Rise/Fall'];
const DIGITS = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9];

const STRATEGIES = [
    {
        name: 'Classic Hedge',
        desc: 'Opposite positions on correlated markets for guaranteed coverage.',
        risk: 'Low',
        capital: '$10',
        markets: 'V50, V75',
        recovery: '80%',
        rating: '★★★★☆',
        color: '#00c2e0',
    },
    {
        name: 'Mirror Hedge',
        desc: 'Mirror positions on inverse markets to neutralise net exposure.',
        risk: 'Low',
        capital: '$15',
        markets: 'Boom/Crash',
        recovery: '75%',
        rating: '★★★★☆',
        color: '#7c3aed',
    },
    {
        name: 'Recovery Hedge',
        desc: 'Larger counter-position placed after a losing streak.',
        risk: 'Med',
        capital: '$20',
        markets: 'Any Vol Index',
        recovery: '88%',
        rating: '★★★☆☆',
        color: '#ff9f1c',
    },
    {
        name: 'Cross Hedge',
        desc: 'Hedge across different volatility classes for multi-market coverage.',
        risk: 'Med',
        capital: '$25',
        markets: 'V25 + V100',
        recovery: '70%',
        rating: '★★★☆☆',
        color: '#ff6444',
    },
    {
        name: 'Adaptive Hedge',
        desc: 'Dynamically adjusts hedge ratio based on live momentum score.',
        risk: 'High',
        capital: '$30',
        markets: 'V75, V100',
        recovery: '92%',
        rating: '★★★★★',
        color: '#00d26a',
    },
    {
        name: 'AI Smart Hedge',
        desc: 'Full AI-managed hedge engine using correlation + trend signals.',
        risk: 'Low',
        capital: '$50',
        markets: 'All',
        recovery: '95%',
        rating: '★★★★★',
        color: '#ff6444',
    },
];

const HedgingCenter: React.FC = () => {
    const [primaryMarket, setPrimaryMarket] = useState('Volatility 50 Index');
    const [secondaryMarket, setSecondaryMarket] = useState('Volatility 75 Index');
    const [tradeType, setTradeType] = useState('Even/Odd');
    const [barrierDigit, setBarrierDigit] = useState(5);
    const [stakeA, setStakeA] = useState('1.00');
    const [stakeB, setStakeB] = useState('1.50');
    const [ticks, setTicks] = useState('5');
    const [riskPct, setRiskPct] = useState('10');
    const [multiplier, setMultiplier] = useState('1.5');
    const [stopLoss, setStopLoss] = useState('20');
    const [takeProfit, setTakeProfit] = useState('50');
    const [hedgeRatio, setHedgeRatio] = useState('0.65');
    const [hedgeActive, setHedgeActive] = useState(false);
    const [pnlA, setPnlA] = useState(0);
    const [pnlB, setPnlB] = useState(0);

    // Live metrics
    const [correlation, setCorrelation] = useState(0.72);
    const [marketStrength, setMarketStrength] = useState(68);
    const [volDiff, setVolDiff] = useState(14);
    const [hedgeConf, setHedgeConf] = useState(82);

    useEffect(() => {
        const interval = setInterval(() => {
            setCorrelation(c => Math.min(0.99, Math.max(0.3, c + (Math.random() - 0.5) * 0.04)));
            setMarketStrength(m => Math.min(99, Math.max(20, m + (Math.random() - 0.5) * 3)));
            setVolDiff(v => Math.min(40, Math.max(2, v + (Math.random() - 0.5) * 2)));
            setHedgeConf(h => Math.min(99, Math.max(50, h + (Math.random() - 0.5) * 2)));
            if (hedgeActive) {
                const s = parseFloat(stakeA);
                const winA = Math.random() > 0.48;
                const winB = !winA && Math.random() > 0.3;
                setPnlA(p => parseFloat((p + (winA ? s * 0.9 : -s * parseFloat(multiplier))).toFixed(2)));
                setPnlB(p => parseFloat((p + (winB ? parseFloat(stakeB) * 0.9 : -parseFloat(stakeB))).toFixed(2)));
            }
        }, 1200);
        return () => clearInterval(interval);
    }, [hedgeActive, stakeA, stakeB, multiplier]);

    const combinedPnl = parseFloat((pnlA + pnlB).toFixed(2));
    const aiRec = hedgeConf > 80 ? 'AI Smart Hedge' : correlation > 0.7 ? 'Classic Hedge' : 'Mirror Hedge';

    return (
        <div className='hedging'>
            {/* Header controls */}
            <div className='hedging__controls'>
                <div className='hedging__controls-row'>
                    <div className='hedging__field'>
                        <label className='hedging__label'>PRIMARY MARKET</label>
                        <select
                            className='hedging__select'
                            value={primaryMarket}
                            onChange={e => setPrimaryMarket(e.target.value)}
                        >
                            {MARKETS.map(m => (
                                <option key={m} value={m}>
                                    {m}
                                </option>
                            ))}
                        </select>
                    </div>
                    <div className='hedging__field'>
                        <label className='hedging__label'>TRADE TYPE</label>
                        <select
                            className='hedging__select'
                            value={tradeType}
                            onChange={e => setTradeType(e.target.value)}
                        >
                            {TRADE_TYPES.map(t => (
                                <option key={t} value={t}>
                                    {t}
                                </option>
                            ))}
                        </select>
                    </div>
                    {tradeType === 'Over/Under' && (
                        <div className='hedging__field'>
                            <label className='hedging__label'>BARRIER DIGIT</label>
                            <div className='hedging__digit-picker'>
                                {DIGITS.map(d => (
                                    <button
                                        key={d}
                                        className={`hedging__digit-btn${barrierDigit === d ? ' hedging__digit-btn--active' : ''}`}
                                        onClick={() => setBarrierDigit(d)}
                                    >
                                        {d}
                                    </button>
                                ))}
                            </div>
                            <span className='hedging__digit-hint'>
                                {barrierDigit === 5
                                    ? 'Over 5: last digit > 5 | Under 5: last digit < 5'
                                    : `Over ${barrierDigit}: last digit > ${barrierDigit} | Under ${barrierDigit}: last digit < ${barrierDigit}`}
                            </span>
                        </div>
                    )}
                    <div className='hedging__field'>
                        <label className='hedging__label'>SECONDARY MARKET</label>
                        <select
                            className='hedging__select'
                            value={secondaryMarket}
                            onChange={e => setSecondaryMarket(e.target.value)}
                        >
                            {MARKETS.map(m => (
                                <option key={m} value={m}>
                                    {m}
                                </option>
                            ))}
                        </select>
                    </div>
                </div>
                <div className='hedging__controls-row hedging__controls-row--4'>
                    {[
                        { label: 'STAKE A', val: stakeA, set: setStakeA },
                        { label: 'STAKE B', val: stakeB, set: setStakeB },
                        { label: 'TICKS', val: ticks, set: setTicks },
                        { label: 'RISK %', val: riskPct, set: setRiskPct },
                    ].map(({ label, val, set }) => (
                        <div className='hedging__field' key={label}>
                            <label className='hedging__label'>{label}</label>
                            <input
                                className='hedging__input'
                                type='number'
                                value={val}
                                min='0'
                                step='0.01'
                                onChange={e => set(e.target.value)}
                            />
                        </div>
                    ))}
                </div>
            </div>

            {/* Correlation cards */}
            <div className='hedging__metric-cards'>
                {[
                    {
                        label: 'Correlation',
                        val: correlation.toFixed(2),
                        color: correlation > 0.7 ? '#00d26a' : '#ff9f1c',
                    },
                    { label: 'Market Strength', val: `${marketStrength.toFixed(0)}%`, color: '#00c2e0' },
                    { label: 'Vol Difference', val: `${volDiff.toFixed(0)}%`, color: '#ff9f1c' },
                    {
                        label: 'Trend Direction',
                        val: pnlA >= 0 ? '↑ Bullish' : '↓ Bearish',
                        color: pnlA >= 0 ? '#00d26a' : '#ff444f',
                    },
                    { label: 'Risk Score', val: `${(100 - hedgeConf).toFixed(0)}%`, color: '#ff6444' },
                    { label: 'Hedge Confidence', val: `${hedgeConf.toFixed(0)}%`, color: '#00d26a' },
                ].map(c => (
                    <div className='hedging__metric-card' key={c.label}>
                        <span className='hedging__metric-label'>{c.label}</span>
                        <span className='hedging__metric-val' style={{ color: c.color }}>
                            {c.val}
                        </span>
                    </div>
                ))}
            </div>

            {/* Hedge Config */}
            <div className='hedging__config'>
                <h3 className='hedging__section-title'>Hedge Configuration</h3>
                <div className='hedging__config-grid'>
                    {[
                        { label: 'Multiplier', val: multiplier, set: setMultiplier },
                        { label: 'Stop Loss', val: stopLoss, set: setStopLoss },
                        { label: 'Take Profit', val: takeProfit, set: setTakeProfit },
                        { label: 'Hedge Ratio', val: hedgeRatio, set: setHedgeRatio },
                    ].map(({ label, val, set }) => (
                        <div className='hedging__field' key={label}>
                            <label className='hedging__label'>{label}</label>
                            <input
                                className='hedging__input hedging__input--small'
                                type='number'
                                value={val}
                                min='0'
                                step='0.01'
                                onChange={e => set(e.target.value)}
                            />
                        </div>
                    ))}
                </div>
            </div>

            {/* Live Monitor */}
            <div className='hedging__monitor'>
                <h3 className='hedging__section-title'>Live Hedge Monitor</h3>
                <div className='hedging__monitor-grid'>
                    {[
                        {
                            label: 'Trade A P/L',
                            val: `${pnlA >= 0 ? '+' : ''}${pnlA.toFixed(2)}`,
                            color: pnlA >= 0 ? '#00d26a' : '#ff444f',
                        },
                        {
                            label: 'Trade B P/L',
                            val: `${pnlB >= 0 ? '+' : ''}${pnlB.toFixed(2)}`,
                            color: pnlB >= 0 ? '#00d26a' : '#ff444f',
                        },
                        {
                            label: 'Combined P/L',
                            val: `${combinedPnl >= 0 ? '+' : ''}${combinedPnl.toFixed(2)}`,
                            color: combinedPnl >= 0 ? '#00d26a' : '#ff444f',
                        },
                        { label: 'Protection', val: `${hedgeConf.toFixed(0)}%`, color: '#00c2e0' },
                        { label: 'Recovery', val: `${(hedgeConf * 0.9).toFixed(0)}%`, color: '#7c3aed' },
                        {
                            label: 'Exposure',
                            val: `$${(parseFloat(stakeA) + parseFloat(stakeB)).toFixed(2)}`,
                            color: '#ff9f1c',
                        },
                    ].map(c => (
                        <div className='hedging__monitor-card' key={c.label}>
                            <span className='hedging__monitor-label'>{c.label}</span>
                            <span className='hedging__monitor-val' style={{ color: c.color }}>
                                {c.val}
                            </span>
                        </div>
                    ))}
                </div>
                {/* Risk meter */}
                <div className='hedging__risk-meter'>
                    <span className='hedging__label'>RISK METER</span>
                    <div className='hedging__risk-track'>
                        <div className='hedging__risk-fill' style={{ width: `${100 - hedgeConf}%` }} />
                    </div>
                    <span className='hedging__risk-val' style={{ color: hedgeConf > 75 ? '#00d26a' : '#ff9f1c' }}>
                        {(100 - hedgeConf).toFixed(0)}% Risk
                    </span>
                </div>
            </div>

            {/* AI Suggestion */}
            <div className='hedging__ai-suggest'>
                <div className='hedging__ai-header'>
                    <span>🤖 AI Hedge Suggestion</span>
                    <span className='hedging__ai-conf'>{hedgeConf.toFixed(0)}% confidence</span>
                </div>
                <div className='hedging__ai-rec'>
                    Recommended: <strong>{aiRec}</strong>
                </div>
                <div className='hedging__ai-details'>
                    <div>
                        <span>Reason</span>
                        <span>High correlation + favorable momentum</span>
                    </div>
                    <div>
                        <span>Expected Recovery</span>
                        <span className='hedging__good'>{(hedgeConf * 0.92).toFixed(0)}%</span>
                    </div>
                    <div>
                        <span>Expected Risk</span>
                        <span style={{ color: '#ff9f1c' }}>{(100 - hedgeConf).toFixed(0)}%</span>
                    </div>
                </div>
                <div className='hedging__ai-btns'>
                    <button className='hedging__apply-btn' onClick={() => setHedgeActive(true)}>
                        Apply Hedge
                    </button>
                    <button className='hedging__modify-btn'>Modify Hedge</button>
                </div>
            </div>

            {/* Strategy cards */}
            <div className='hedging__strategies'>
                <h3 className='hedging__section-title'>Hedge Strategies</h3>
                <div className='hedging__strategy-grid'>
                    {STRATEGIES.map(s => (
                        <div key={s.name} className='hedging__strategy-card' style={{ borderColor: s.color + '40' }}>
                            <div className='hedging__strategy-name' style={{ color: s.color }}>
                                {s.name}
                            </div>
                            <p className='hedging__strategy-desc'>{s.desc}</p>
                            <div className='hedging__strategy-meta'>
                                <span>
                                    Risk: <strong style={{ color: s.color }}>{s.risk}</strong>
                                </span>
                                <span>
                                    Capital: <strong>{s.capital}</strong>
                                </span>
                                <span>
                                    Recovery: <strong className='hedging__good'>{s.recovery}</strong>
                                </span>
                            </div>
                            <div className='hedging__strategy-footer'>
                                <span className='hedging__strategy-rating'>{s.rating}</span>
                                <button
                                    className='hedging__deploy-btn'
                                    style={{ borderColor: s.color + '60', color: s.color, background: s.color + '15' }}
                                >
                                    Deploy
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Bottom monitor */}
            <div className='hedging__bottom-bar'>
                <div className='hedging__bottom-items'>
                    {[
                        {
                            label: 'Open Hedge',
                            val: hedgeActive ? '1 Active' : 'None',
                            color: hedgeActive ? '#00d26a' : 'rgba(255,255,255,0.4)',
                        },
                        {
                            label: 'Protected Capital',
                            val: `$${(parseFloat(stakeA) * parseFloat(hedgeRatio)).toFixed(2)}`,
                            color: '#00c2e0',
                        },
                        {
                            label: 'Exposure',
                            val: `$${(parseFloat(stakeA) + parseFloat(stakeB)).toFixed(2)}`,
                            color: '#ff9f1c',
                        },
                        { label: 'Connection', val: '● Live', color: '#00d26a' },
                        { label: 'AI Engine', val: '● Active', color: '#7c3aed' },
                        {
                            label: 'Status',
                            val: hedgeActive ? '● Hedging' : '● Idle',
                            color: hedgeActive ? '#00d26a' : 'rgba(255,255,255,0.4)',
                        },
                    ].map(item => (
                        <div key={item.label} className='hedging__bottom-item'>
                            <span className='hedging__bottom-label'>{item.label}</span>
                            <span className='hedging__bottom-val' style={{ color: item.color }}>
                                {item.val}
                            </span>
                        </div>
                    ))}
                </div>
                <button
                    className={`hedging__toggle-btn ${hedgeActive ? 'hedging__toggle-btn--stop' : ''}`}
                    onClick={() => setHedgeActive(v => !v)}
                >
                    {hedgeActive ? '■ Stop Hedge' : '▶ Start Hedge'}
                </button>
            </div>
        </div>
    );
};

export default HedgingCenter;
