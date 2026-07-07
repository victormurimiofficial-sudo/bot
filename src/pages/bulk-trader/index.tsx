import React, { useEffect, useState } from 'react';
import './bulk-trader.scss';

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
];

const TRADE_TYPES = ['Even/Odd', 'Over/Under', 'Matches/Differs', 'Rise/Fall', 'Higher/Lower'];

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
};

function buildDigitPcts(): number[] {
    const arr = Array(10)
        .fill(0)
        .map(() => Math.random() * 0.16 + 0.04);
    const sum = arr.reduce((a, b) => a + b, 0);
    return arr.map(v => v / sum);
}

function randOutcomes(type: string): string[] {
    const pairs: Record<string, string[]> = {
        'Even/Odd': ['E', 'O'],
        'Over/Under': ['O', 'U'],
        'Matches/Differs': ['M', 'D'],
        'Rise/Fall': ['R', 'F'],
        'Higher/Lower': ['H', 'L'],
    };
    const opts = pairs[type] ?? ['E', 'O'];
    return Array(8)
        .fill('')
        .map(() => opts[Math.floor(Math.random() * 2)]);
}

const SIDE_COLORS: Record<string, [string, string]> = {
    'Even/Odd': ['#00c2e0', '#ff6444'],
    'Over/Under': ['#00d26a', '#ff444f'],
    'Matches/Differs': ['#7c3aed', '#ff9f1c'],
    'Rise/Fall': ['#00d26a', '#ff444f'],
    'Higher/Lower': ['#00d26a', '#ff444f'],
};

const BulkTrader: React.FC = () => {
    const [market, setMarket] = useState('Volatility 100 Index');
    const [tradeType, setTradeType] = useState('Even/Odd');
    const [numTicks, setNumTicks] = useState('1000');
    const [livePrice, setLivePrice] = useState(BASE_PRICES['Volatility 100 Index']);
    const [digitPcts, setDigitPcts] = useState<number[]>(buildDigitPcts());
    const [outcomes, setOutcomes] = useState<string[]>(randOutcomes('Even/Odd'));
    const [ticks, setTicks] = useState('1');
    const [stake, setStake] = useState('0.50');
    const [noOfTrades, setNoOfTrades] = useState('1');
    const [pending, setPending] = useState<string | null>(null);
    const [results, setResults] = useState<{ side: string; win: boolean; pnl: number }[]>([]);

    useEffect(() => {
        const base = BASE_PRICES[market] ?? 3200;
        setLivePrice(base);
        setDigitPcts(buildDigitPcts());
    }, [market]);

    useEffect(() => {
        setOutcomes(randOutcomes(tradeType));
    }, [tradeType]);

    useEffect(() => {
        const interval = setInterval(() => {
            const base = BASE_PRICES[market] ?? 3200;
            setLivePrice(p => Math.max(base * 0.5, p + p * (Math.random() - 0.5) * 0.008));
            setDigitPcts(prev => {
                const next = [...prev];
                const i = Math.floor(Math.random() * 10);
                next[i] = Math.max(0.01, next[i] + (Math.random() - 0.5) * 0.015);
                const s = next.reduce((a, b) => a + b, 0);
                return next.map(v => v / s);
            });
            setOutcomes(prev => {
                const pairs: Record<string, string[]> = {
                    'Even/Odd': ['E', 'O'],
                    'Over/Under': ['O', 'U'],
                    'Matches/Differs': ['M', 'D'],
                    'Rise/Fall': ['R', 'F'],
                    'Higher/Lower': ['H', 'L'],
                };
                const opts = pairs[tradeType] ?? ['E', 'O'];
                const next = [...prev.slice(1), opts[Math.floor(Math.random() * 2)]];
                return next;
            });
        }, 700);
        return () => clearInterval(interval);
    }, [market, tradeType]);

    const sides = tradeType.split('/');
    const colors = SIDE_COLORS[tradeType] ?? ['#00c2e0', '#ff6444'];
    const dec = market.includes('Range') ? 4 : 2;

    // Aggregate win rates per side
    const side0Pct = (digitPcts.filter((_, i) => i % 2 === 0).reduce((a, b) => a + b, 0) * 100).toFixed(1);
    const side1Pct = (100 - parseFloat(side0Pct)).toFixed(1);

    const placeBulkTrade = (side: string) => {
        const count = parseInt(noOfTrades) || 1;
        const s = parseFloat(stake) || 0.5;
        setPending(side);
        let done = 0;
        const allRes: { side: string; win: boolean; pnl: number }[] = [];
        const doOne = () => {
            if (done >= count) {
                setResults(prev => [...allRes, ...prev].slice(0, 50));
                setPending(null);
                return;
            }
            setTimeout(
                () => {
                    const win = Math.random() > 0.45;
                    allRes.push({ side, win, pnl: win ? parseFloat((s * 0.92).toFixed(2)) : -s });
                    done++;
                    doOne();
                },
                parseInt(ticks) * 400 + Math.random() * 300
            );
        };
        doOne();
    };

    const r = 36;
    const circ = 2 * Math.PI * r;

    return (
        <div className='bulk-trader'>
            {/* Controls */}
            <div className='bulk-trader__controls'>
                <div className='bulk-trader__control-row'>
                    <div className='bulk-trader__field'>
                        <label className='bulk-trader__label'>MARKET</label>
                        <select
                            className='bulk-trader__select'
                            value={market}
                            onChange={e => setMarket(e.target.value)}
                        >
                            {MARKETS.map(m => (
                                <option key={m} value={m}>
                                    {m}
                                </option>
                            ))}
                        </select>
                    </div>
                    <div className='bulk-trader__field'>
                        <label className='bulk-trader__label'>TRADE TYPE</label>
                        <select
                            className='bulk-trader__select'
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
                </div>
                <div className='bulk-trader__field'>
                    <label className='bulk-trader__label'>NUMBER OF TICKS</label>
                    <input
                        className='bulk-trader__input bulk-trader__input--center'
                        type='number'
                        value={numTicks}
                        onChange={e => setNumTicks(e.target.value)}
                    />
                </div>
            </div>

            {/* Current tick */}
            <div className='bulk-trader__tick-display'>
                <span className='bulk-trader__tick-label'>CURRENT TICK</span>
                <span className='bulk-trader__tick-price'>{livePrice.toFixed(dec)}</span>
            </div>

            {/* Digit circles */}
            <div className='bulk-trader__digit-grid'>
                {digitPcts.map((pct, i) => {
                    const offset = circ - circ * pct;
                    const isHigh = pct > 0.12;
                    const color = isHigh ? '#ff6444' : pct > 0.09 ? '#ff9f1c' : '#00c2e0';
                    return (
                        <div className='bulk-trader__circle-wrap' key={i}>
                            <svg width='76' height='76' viewBox='0 0 80 80'>
                                <circle
                                    cx='40'
                                    cy='40'
                                    r={r}
                                    fill='#112240'
                                    stroke='rgba(255,255,255,0.05)'
                                    strokeWidth='6'
                                />
                                <circle
                                    cx='40'
                                    cy='40'
                                    r={r}
                                    fill='none'
                                    stroke={color}
                                    strokeWidth='6'
                                    strokeDasharray={circ}
                                    strokeDashoffset={offset}
                                    strokeLinecap='round'
                                    transform='rotate(-90 40 40)'
                                    style={{ transition: 'stroke-dashoffset 0.5s' }}
                                />
                                <text x='40' y='36' textAnchor='middle' fill='#fff' fontSize='16' fontWeight='700'>
                                    {i}
                                </text>
                                <text x='40' y='50' textAnchor='middle' fill={color} fontSize='9' fontWeight='600'>
                                    {(pct * 100).toFixed(1)}%
                                </text>
                            </svg>
                        </div>
                    );
                })}
            </div>

            {/* Outcomes row */}
            <div className='bulk-trader__outcomes'>
                {outcomes.map((o, i) => {
                    const isFirst = sides[0][0] === o;
                    return (
                        <span
                            key={i}
                            className='bulk-trader__outcome-chip'
                            style={{
                                background: isFirst ? colors[0] + '30' : colors[1] + '30',
                                color: isFirst ? colors[0] : colors[1],
                                border: `1px solid ${isFirst ? colors[0] : colors[1]}50`,
                            }}
                        >
                            {o}
                        </span>
                    );
                })}
            </div>

            {/* Inputs */}
            <div className='bulk-trader__inputs-row'>
                {[
                    { label: 'TICKS', val: ticks, set: setTicks },
                    { label: 'STAKE', val: stake, set: setStake },
                    { label: 'NO OF TRADES', val: noOfTrades, set: setNoOfTrades },
                ].map(({ label, val, set }) => (
                    <div className='bulk-trader__input-group' key={label}>
                        <label className='bulk-trader__label'>{label}</label>
                        <input
                            className='bulk-trader__input bulk-trader__input--center'
                            type='number'
                            value={val}
                            min='1'
                            step='0.01'
                            onChange={e => set(e.target.value)}
                        />
                    </div>
                ))}
            </div>

            {/* Buy buttons */}
            <div className='bulk-trader__buy-btns'>
                {sides.map((side, idx) => (
                    <button
                        key={side}
                        className='bulk-trader__buy-btn'
                        style={{ background: colors[idx], opacity: pending ? 0.5 : 1 }}
                        disabled={!!pending}
                        onClick={() => placeBulkTrade(side)}
                    >
                        <span className='bulk-trader__buy-side'>{pending === side ? 'Running…' : side}</span>
                        <span className='bulk-trader__buy-pct'>{idx === 0 ? side0Pct : side1Pct}%</span>
                    </button>
                ))}
            </div>

            {/* Results feed */}
            {results.length > 0 && (
                <div className='bulk-trader__results'>
                    <div className='bulk-trader__results-header'>
                        <span>Recent Bulk Results</span>
                        <span
                            className={
                                results.filter(r => r.win).length / results.length > 0.5
                                    ? 'bulk-trader__results-good'
                                    : 'bulk-trader__results-bad'
                            }
                        >
                            {results.filter(r => r.win).length}/{results.length} wins ·&nbsp;
                            {results.reduce((a, r) => a + r.pnl, 0) >= 0 ? '+' : ''}
                            {results.reduce((a, r) => a + r.pnl, 0).toFixed(2)}
                        </span>
                    </div>
                    <div className='bulk-trader__results-chips'>
                        {results.slice(0, 16).map((r, i) => (
                            <span
                                key={i}
                                className={`bulk-trader__result-chip ${r.win ? 'bulk-trader__result-chip--win' : 'bulk-trader__result-chip--loss'}`}
                            >
                                {r.side[0]}
                            </span>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

export default BulkTrader;
