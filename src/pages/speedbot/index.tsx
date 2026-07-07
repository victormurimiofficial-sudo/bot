import React, { useEffect, useRef, useState } from 'react';
import './speedbot.scss';

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
    'Boom 300 Index',
    'Boom 500 Index',
    'Boom 1000 Index',
    'Crash 300 Index',
    'Crash 500 Index',
    'Crash 1000 Index',
    'Step Index',
    'Range Break 100 Index',
    'Range Break 200 Index',
];

const TRADE_TYPES = ['Even', 'Odd', 'Over', 'Under', 'Matches', 'Differs'];
const RECOVERY_TYPES = ['Even', 'Odd', 'Over', 'Under', 'Matches', 'Differs'];

const BASE_PRICES: Record<string, number> = {
    'Volatility 10 Index': 9500,
    'Volatility 10 (1s) Index': 9700,
    'Volatility 25 Index': 8300,
    'Volatility 25 (1s) Index': 8600,
    'Volatility 50 Index': 6700,
    'Volatility 50 (1s) Index': 6900,
    'Volatility 75 Index': 4100,
    'Volatility 75 (1s) Index': 4300,
    'Volatility 100 Index': 3200,
    'Volatility 100 (1s) Index': 3400,
    'Boom 300 Index': 12000,
    'Boom 500 Index': 9800,
    'Boom 1000 Index': 7500,
    'Crash 300 Index': 11500,
    'Crash 500 Index': 9200,
    'Crash 1000 Index': 7100,
    'Step Index': 7800,
    'Range Break 100 Index': 40,
    'Range Break 200 Index': 25,
};

const SpeedBot: React.FC = () => {
    const [market, setMarket] = useState('Volatility 100 Index');
    const [tradeType, setTradeType] = useState('Even');
    const [speed, setSpeed] = useState<'FAST' | 'NORMAL'>('NORMAL');
    const [ticks, setTicks] = useState(1);
    const [stake, setStake] = useState('0.50');
    const [takeProfit, setTakeProfit] = useState('10');
    const [stopLoss, setStopLoss] = useState('50');
    const [altEvenOdd, setAltEvenOdd] = useState(false);
    const [altOnLoss, setAltOnLoss] = useState(false);
    const [martingale, setMartingale] = useState(true);
    const [martMultiplier, setMartMultiplier] = useState('1.15');
    const [recoveryMode, setRecoveryMode] = useState(false);
    const [recoveryType, setRecoveryType] = useState('Even');
    const [isRunning, setIsRunning] = useState(false);
    const [livePrice, setLivePrice] = useState(BASE_PRICES['Volatility 100 Index']);
    const [pnl, setPnl] = useState(0);
    const [trades, setTrades] = useState(0);
    const [wins, setWins] = useState(0);
    const [showTypeDropdown, setShowTypeDropdown] = useState(false);
    const [showRecoveryDropdown, setShowRecoveryDropdown] = useState(false);
    const [ticksProcessed, setTicksProcessed] = useState(0);
    const [lastDigit, setLastDigit] = useState(1);
    const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

    useEffect(() => {
        const base = BASE_PRICES[market] ?? 3200;
        setLivePrice(base);
    }, [market]);

    useEffect(() => {
        const interval = setInterval(
            () => {
                const base = BASE_PRICES[market] ?? 3200;
                const vol = market.includes('100') ? 0.015 : market.includes('75') ? 0.012 : 0.008;
                setLivePrice(p => Math.max(base * 0.5, p + p * (Math.random() - 0.5) * vol));
                const d = Math.floor(Math.random() * 10);
                setLastDigit(d);
                if (isRunning) setTicksProcessed(t => t + 1);
            },
            speed === 'FAST' ? 300 : 700
        );
        return () => clearInterval(interval);
    }, [market, speed, isRunning]);

    useEffect(() => {
        if (!isRunning) {
            if (timerRef.current) clearInterval(timerRef.current);
            return;
        }
        timerRef.current = setInterval(
            () => {
                const s = parseFloat(stake) || 0.5;
                const win = Math.random() > 0.45;
                const mult = parseFloat(martMultiplier) || 1.15;
                const profit = win ? s * 0.9 : -(martingale ? s * mult : s);
                setTrades(t => t + 1);
                if (win) setWins(w => w + 1);
                setPnl(p => parseFloat((p + profit).toFixed(2)));
            },
            speed === 'FAST' ? 600 : 1400
        );
        return () => {
            if (timerRef.current) clearInterval(timerRef.current);
        };
    }, [isRunning, stake, speed, martingale, martMultiplier]);

    const winRate = trades > 0 ? ((wins / trades) * 100).toFixed(1) : '0.0';
    const dec = market.includes('Range') ? 4 : 2;

    return (
        <div className='speedbot'>
            {/* ── Top Stats ── */}
            <div className='speedbot__stats-bar'>
                <div className='speedbot__stat'>
                    <span className='speedbot__stat-label'>TRADES</span>
                    <span className='speedbot__stat-val'>{trades}</span>
                </div>
                <div className='speedbot__stat'>
                    <span className='speedbot__stat-label'>WIN RATE</span>
                    <span className='speedbot__stat-val speedbot__stat-val--good'>{winRate}%</span>
                </div>
                <div className='speedbot__stat'>
                    <span className='speedbot__stat-label'>P/L</span>
                    <span
                        className={`speedbot__stat-val ${pnl >= 0 ? 'speedbot__stat-val--good' : 'speedbot__stat-val--bad'}`}
                    >
                        {pnl >= 0 ? '+' : ''}
                        {pnl.toFixed(2)}
                    </span>
                </div>
            </div>

            {/* ── Header ── */}
            <div className='speedbot__header'>
                <h1 className='speedbot__title'>EXECUTE TRADE ON EVERY TICK</h1>
                <div className='speedbot__speed-row'>
                    <button
                        className={`speedbot__run-btn ${isRunning ? 'speedbot__run-btn--stop' : ''}`}
                        onClick={() => setIsRunning(r => !r)}
                    >
                        {isRunning ? '■ STOP' : '▶ START'}
                    </button>
                    <div className='speedbot__speed-group'>
                        <span className='speedbot__speed-label'>Execution Speed</span>
                        <div className='speedbot__speed-btns'>
                            <button
                                className={`speedbot__speed-btn ${speed === 'FAST' ? 'speedbot__speed-btn--active' : ''}`}
                                onClick={() => setSpeed('FAST')}
                            >
                                ⚡ FAST
                            </button>
                            <button
                                className={`speedbot__speed-btn ${speed === 'NORMAL' ? 'speedbot__speed-btn--active speedbot__speed-btn--normal' : ''}`}
                                onClick={() => setSpeed('NORMAL')}
                            >
                                ▶▶ NORMAL
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* ── Market + Price ── */}
            <div className='speedbot__section'>
                <div className='speedbot__market-row'>
                    <select
                        className='speedbot__select speedbot__select--market'
                        value={market}
                        onChange={e => setMarket(e.target.value)}
                    >
                        {MARKETS.map(m => (
                            <option key={m} value={m}>
                                {m}
                            </option>
                        ))}
                    </select>
                    <span className='speedbot__live-price'>{livePrice.toFixed(dec)}</span>
                </div>
            </div>

            {/* ── Trade Type ── */}
            <div className='speedbot__section'>
                <div className='speedbot__field-row'>
                    <div className='speedbot__dropdown-wrap'>
                        <button
                            className='speedbot__dropdown-btn'
                            onClick={() => {
                                setShowTypeDropdown(v => !v);
                                setShowRecoveryDropdown(false);
                            }}
                        >
                            {tradeType} <span>▾</span>
                        </button>
                        {showTypeDropdown && (
                            <div className='speedbot__dropdown'>
                                {TRADE_TYPES.map(t => (
                                    <button
                                        key={t}
                                        className={`speedbot__dropdown-item ${t === tradeType ? 'speedbot__dropdown-item--active' : ''}`}
                                        onClick={() => {
                                            setTradeType(t);
                                            setShowTypeDropdown(false);
                                        }}
                                    >
                                        {t === tradeType && <span className='speedbot__check'>✓</span>} {t}
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* ── Inputs ── */}
            <div className='speedbot__section'>
                <div className='speedbot__inputs-grid'>
                    {[
                        {
                            label: 'Ticks',
                            value: String(ticks),
                            onChange: (v: string) => setTicks(Number(v)),
                            type: 'number',
                        },
                        { label: 'Stake', value: stake, onChange: setStake, type: 'number' },
                        { label: 'Take Profit', value: takeProfit, onChange: setTakeProfit, type: 'number' },
                        { label: 'Stop Loss', value: stopLoss, onChange: setStopLoss, type: 'number' },
                    ].map(({ label, value, onChange, type }) => (
                        <div className='speedbot__input-group' key={label}>
                            <label className='speedbot__input-label'>{label}</label>
                            <input
                                className='speedbot__input'
                                type={type}
                                value={value}
                                min='0'
                                step='0.01'
                                onChange={e => onChange(e.target.value)}
                            />
                        </div>
                    ))}
                </div>
            </div>

            {/* ── Toggles ── */}
            <div className='speedbot__section speedbot__toggles-grid'>
                {[
                    { label: 'Alternate Even and Odd', val: altEvenOdd, set: setAltEvenOdd },
                    { label: 'Alternate on Loss', val: altOnLoss, set: setAltOnLoss },
                ].map(({ label, val, set }) => (
                    <div className='speedbot__toggle-row' key={label}>
                        <span className='speedbot__toggle-label'>{label}</span>
                        <button
                            className={`speedbot__toggle ${val ? 'speedbot__toggle--on' : ''}`}
                            onClick={() => set((v: boolean) => !v)}
                            aria-label={label}
                        >
                            <span className='speedbot__toggle-knob' />
                        </button>
                    </div>
                ))}
            </div>

            {/* ── Martingale ── */}
            <div className='speedbot__section'>
                <div className='speedbot__toggle-row speedbot__toggle-row--martingale'>
                    <span className='speedbot__toggle-label speedbot__toggle-label--lg'>Enable Martingale</span>
                    <button
                        className={`speedbot__toggle speedbot__toggle--orange ${martingale ? 'speedbot__toggle--on' : ''}`}
                        onClick={() => setMartingale(v => !v)}
                    >
                        <span className='speedbot__toggle-knob' />
                    </button>
                </div>
                {martingale && (
                    <div className='speedbot__toggle-row speedbot__toggle-row--sub'>
                        <span className='speedbot__toggle-label'>Martingale Multiplier</span>
                        <input
                            className='speedbot__input speedbot__input--small'
                            type='number'
                            value={martMultiplier}
                            min='1'
                            step='0.01'
                            onChange={e => setMartMultiplier(e.target.value)}
                        />
                    </div>
                )}
            </div>

            {/* ── Recovery Mode ── */}
            <div className='speedbot__section'>
                <div className='speedbot__toggle-row'>
                    <span className='speedbot__toggle-label speedbot__toggle-label--lg'>Recovery Mode</span>
                    <button
                        className={`speedbot__toggle ${recoveryMode ? 'speedbot__toggle--on' : ''}`}
                        onClick={() => setRecoveryMode(v => !v)}
                    >
                        <span className='speedbot__toggle-knob' />
                    </button>
                </div>
                {recoveryMode && (
                    <div className='speedbot__toggle-row speedbot__toggle-row--sub'>
                        <span className='speedbot__toggle-label'>Recovery Trade Type</span>
                        <div className='speedbot__dropdown-wrap'>
                            <button
                                className='speedbot__dropdown-btn speedbot__dropdown-btn--danger'
                                onClick={() => {
                                    setShowRecoveryDropdown(v => !v);
                                    setShowTypeDropdown(false);
                                }}
                            >
                                {recoveryType} <span>▾</span>
                            </button>
                            {showRecoveryDropdown && (
                                <div className='speedbot__dropdown speedbot__dropdown--right'>
                                    {RECOVERY_TYPES.map(t => (
                                        <button
                                            key={t}
                                            className={`speedbot__dropdown-item ${t === recoveryType ? 'speedbot__dropdown-item--active' : ''}`}
                                            onClick={() => {
                                                setRecoveryType(t);
                                                setShowRecoveryDropdown(false);
                                            }}
                                        >
                                            {t === recoveryType && <span className='speedbot__check'>✓</span>} {t}
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>

            {/* ── Chevron expand indicator ── */}
            <div className='speedbot__expand-row'>
                <span className='speedbot__chevron'>⌃</span>
            </div>

            {/* ── Status Bar ── */}
            <div className='speedbot__status-bar'>
                <div className='speedbot__status-info'>
                    <span>Ticks Processed: {ticksProcessed}</span>
                    <span>Last Digit: {lastDigit}</span>
                    <span>
                        Speed P/L: {pnl >= 0 ? '+' : ''}
                        {pnl.toFixed(2)}
                    </span>
                </div>
                <div className={`speedbot__status-badge ${isRunning ? 'speedbot__status-badge--running' : ''}`}>
                    {isRunning ? '● Bot is running' : '● Bot is not running'}
                </div>
            </div>
        </div>
    );
};

export default SpeedBot;
