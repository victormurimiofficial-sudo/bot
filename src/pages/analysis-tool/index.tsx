import React, { useEffect, useState } from 'react';
import './analysis-tool.scss';

const MARKETS = [
    'Volatility 10 (1s) Index',
    'Volatility 10 Index',
    'Volatility 25 (1s) Index',
    'Volatility 25 Index',
    'Volatility 50 (1s) Index',
    'Volatility 50 Index',
    'Volatility 75 (1s) Index',
    'Volatility 75 Index',
    'Volatility 100 (1s) Index',
    'Volatility 100 Index',
    'Boom 300 Index',
    'Boom 500 Index',
    'Boom 1000 Index',
    'Crash 300 Index',
    'Crash 500 Index',
    'Crash 1000 Index',
    'Step Index',
];

const BASE_PRICES: Record<string, number> = {
    'Volatility 10 (1s) Index': 9700,
    'Volatility 10 Index': 9500,
    'Volatility 25 (1s) Index': 8600,
    'Volatility 25 Index': 8300,
    'Volatility 50 (1s) Index': 6900,
    'Volatility 50 Index': 6700,
    'Volatility 75 (1s) Index': 4300,
    'Volatility 75 Index': 4100,
    'Volatility 100 (1s) Index': 3400,
    'Volatility 100 Index': 3200,
    'Boom 300 Index': 12000,
    'Boom 500 Index': 9800,
    'Boom 1000 Index': 7500,
    'Crash 300 Index': 11500,
    'Crash 500 Index': 9200,
    'Crash 1000 Index': 7100,
    'Step Index': 7800,
};

const SCANNER_MARKETS = [
    {
        name: 'V10 (1s)',
        price: 9703,
        trend: '↑',
        momentum: 72,
        vol: 'Low',
        signal: 88,
        confidence: 91,
        risk: 'Low',
        rec: 'Even',
    },
    {
        name: 'V25 (1s)',
        price: 8621,
        trend: '↑',
        momentum: 65,
        vol: 'Med',
        signal: 74,
        confidence: 78,
        risk: 'Med',
        rec: 'Matches',
    },
    {
        name: 'V50 (1s)',
        price: 6893,
        trend: '↓',
        momentum: 48,
        vol: 'Med',
        signal: 61,
        confidence: 66,
        risk: 'Med',
        rec: 'Under',
    },
    {
        name: 'V75 (1s)',
        price: 4312,
        trend: '↓',
        momentum: 38,
        vol: 'High',
        signal: 55,
        confidence: 58,
        risk: 'High',
        rec: 'Odd',
    },
    {
        name: 'V100 (1s)',
        price: 3401,
        trend: '↑',
        momentum: 81,
        vol: 'High',
        signal: 93,
        confidence: 95,
        risk: 'Low',
        rec: 'Over',
    },
    {
        name: 'Boom 500',
        price: 9805,
        trend: '↑',
        momentum: 70,
        vol: 'Med',
        signal: 77,
        confidence: 82,
        risk: 'Med',
        rec: 'Rise',
    },
    {
        name: 'Crash 500',
        price: 9188,
        trend: '↓',
        momentum: 42,
        vol: 'High',
        signal: 60,
        confidence: 64,
        risk: 'High',
        rec: 'Fall',
    },
    {
        name: 'Step Index',
        price: 7812,
        trend: '↑',
        momentum: 55,
        vol: 'Low',
        signal: 68,
        confidence: 72,
        risk: 'Low',
        rec: 'Even',
    },
];

function buildDigitCounts(): number[] {
    const arr = Array(10)
        .fill(0)
        .map(() => Math.random() * 0.2 + 0.04);
    const sum = arr.reduce((a, b) => a + b, 0);
    return arr.map(v => v / sum);
}

const OUTCOME_HISTORY_LEN = 10;
function randHistory(type: 'ou' | 'md' | 'eo'): string[] {
    const sets: Record<string, string[]> = { ou: ['O', 'U'], md: ['M', 'D'], eo: ['E', 'O'] };
    return Array(OUTCOME_HISTORY_LEN)
        .fill('')
        .map(() => {
            const opts = sets[type];
            return opts[Math.floor(Math.random() * opts.length)];
        });
}

const AnalysisTool: React.FC = () => {
    const [activeTab, setActiveTab] = useState<'circles' | 'scanner'>('circles');
    const [market, setMarket] = useState('Volatility 10 (1s) Index');
    const [tickCount, setTickCount] = useState(1000);
    const [livePrice, setLivePrice] = useState(BASE_PRICES['Volatility 10 (1s) Index']);
    const [digitPcts, setDigitPcts] = useState<number[]>(buildDigitCounts());
    const [ouHistory, setOuHistory] = useState<string[]>(randHistory('ou'));
    const [mdHistory, setMdHistory] = useState<string[]>(randHistory('md'));
    const [eoHistory, setEoHistory] = useState<string[]>(randHistory('eo'));
    const [running, setRunning] = useState(false);

    // Derived stats
    const overPct = (digitPcts.slice(5).reduce((a, b) => a + b, 0) * 100).toFixed(1);
    const underPct = (digitPcts.slice(0, 5).reduce((a, b) => a + b, 0) * 100).toFixed(1);
    const matchPct = (digitPcts.reduce((a, b, i) => a + (i % 2 === 0 ? b : 0), 0) * 100).toFixed(1);
    const differPct = (100 - parseFloat(matchPct)).toFixed(1);
    const evenPct = (digitPcts.reduce((a, b, i) => a + (i % 2 === 0 ? b : 0), 0) * 100).toFixed(1);
    const oddPct = (100 - parseFloat(evenPct)).toFixed(1);
    const topDigit = digitPcts.indexOf(Math.max(...digitPcts));
    const aiRec =
        parseFloat(overPct) > 55
            ? 'Over'
            : parseFloat(evenPct) > 52
              ? 'Even'
              : parseFloat(underPct) > 55
                ? 'Under'
                : 'Matches';
    const aiConf = Math.floor(60 + Math.random() * 30);

    useEffect(() => {
        const base = BASE_PRICES[market] ?? 3200;
        setLivePrice(base);
        setDigitPcts(buildDigitCounts());
    }, [market]);

    useEffect(() => {
        const interval = setInterval(() => {
            const base = BASE_PRICES[market] ?? 3200;
            setLivePrice(p => Math.max(base * 0.5, p + p * (Math.random() - 0.5) * 0.008));
            setDigitPcts(prev => {
                const next = [...prev];
                const i = Math.floor(Math.random() * 10);
                next[i] = Math.max(0.01, next[i] + (Math.random() - 0.5) * 0.01);
                const s = next.reduce((a, b) => a + b, 0);
                return next.map(v => v / s);
            });
            setOuHistory(h => {
                const d = Math.random() > 0.4 ? 'O' : 'U';
                return [...h.slice(1), d];
            });
            setMdHistory(h => {
                const d = Math.random() > 0.15 ? 'D' : 'M';
                return [...h.slice(1), d];
            });
            setEoHistory(h => {
                const d = Math.random() > 0.5 ? 'E' : 'O';
                return [...h.slice(1), d];
            });
        }, 700);
        return () => clearInterval(interval);
    }, [market]);

    const dec = market.includes('Range') ? 4 : 2;
    const colorForDigit = (pct: number) => {
        if (pct > 0.15) return '#ff6444';
        if (pct > 0.12) return '#ff9f1c';
        if (pct > 0.09) return '#00c2e0';
        return 'rgba(255,255,255,0.3)';
    };

    return (
        <div className='analysis-tool'>
            {/* Sub-tabs */}
            <div className='analysis-tool__tabs'>
                {(['circles', 'scanner'] as const).map(t => (
                    <button
                        key={t}
                        className={`analysis-tool__tab ${activeTab === t ? 'analysis-tool__tab--active' : ''}`}
                        onClick={() => setActiveTab(t)}
                    >
                        {t === 'circles' ? 'Circles' : 'Scanner'}
                    </button>
                ))}
            </div>

            {activeTab === 'circles' && (
                <div className='analysis-tool__circles'>
                    {/* Market row */}
                    <div className='analysis-tool__market-row'>
                        <select
                            className='analysis-tool__select'
                            value={market}
                            onChange={e => setMarket(e.target.value)}
                        >
                            {MARKETS.map(m => (
                                <option key={m} value={m}>
                                    {m}
                                </option>
                            ))}
                        </select>
                        <div className='analysis-tool__ticks-group'>
                            <span className='analysis-tool__field-label'>TICKS</span>
                            <input
                                className='analysis-tool__input'
                                type='number'
                                value={tickCount}
                                onChange={e => setTickCount(Number(e.target.value))}
                            />
                        </div>
                        <div className='analysis-tool__price-group'>
                            <span className='analysis-tool__price-label'>LIVE PRICE</span>
                            <span className='analysis-tool__price'>{livePrice.toFixed(dec)}</span>
                        </div>
                    </div>

                    {/* Digit circles */}
                    <div className='analysis-tool__digit-grid'>
                        {digitPcts.map((pct, i) => {
                            const r = 38;
                            const circ = 2 * Math.PI * r;
                            const offset = circ - circ * pct;
                            const color = colorForDigit(pct);
                            const isTop = i === topDigit;
                            return (
                                <div
                                    className={`analysis-tool__circle-wrap ${isTop ? 'analysis-tool__circle-wrap--top' : ''}`}
                                    key={i}
                                >
                                    <svg width='90' height='90' viewBox='0 0 90 90'>
                                        <circle
                                            cx='45'
                                            cy='45'
                                            r={r}
                                            fill='#112240'
                                            stroke='rgba(255,255,255,0.06)'
                                            strokeWidth='6'
                                        />
                                        <circle
                                            cx='45'
                                            cy='45'
                                            r={r}
                                            fill='none'
                                            stroke={color}
                                            strokeWidth='6'
                                            strokeDasharray={circ}
                                            strokeDashoffset={offset}
                                            strokeLinecap='round'
                                            transform='rotate(-90 45 45)'
                                            style={{
                                                filter: isTop ? `drop-shadow(0 0 6px ${color})` : 'none',
                                                transition: 'stroke-dashoffset 0.5s',
                                            }}
                                        />
                                        <text
                                            x='45'
                                            y='40'
                                            textAnchor='middle'
                                            fill='#fff'
                                            fontSize='18'
                                            fontWeight='700'
                                        >
                                            {i}
                                        </text>
                                        <text
                                            x='45'
                                            y='56'
                                            textAnchor='middle'
                                            fill={color}
                                            fontSize='10'
                                            fontWeight='600'
                                        >
                                            {(pct * 100).toFixed(1)}%
                                        </text>
                                    </svg>
                                    {isTop && <span className='analysis-tool__top-marker'>▲</span>}
                                </div>
                            );
                        })}
                    </div>

                    {/* Statistical panels */}
                    {[
                        {
                            title: 'OVER / UNDER',
                            side:
                                parseFloat(overPct) > parseFloat(underPct)
                                    ? `${Math.floor(parseFloat(overPct) / 10)}x Over`
                                    : `${Math.floor(parseFloat(underPct) / 10)}x Under`,
                            left: { label: 'OVER', pct: overPct, color: '#00d26a' },
                            right: { label: 'UNDER', pct: underPct, color: '#ff6444' },
                            history: ouHistory,
                            colorMap: { O: '#ff6444', U: '#00c2e0' },
                        },
                        {
                            title: 'MATCH / DIFFER',
                            side:
                                parseFloat(differPct) > 70
                                    ? `${Math.floor(parseFloat(differPct) / 10)}x Differ`
                                    : `${Math.floor(parseFloat(matchPct) / 10)}x Match`,
                            left: { label: 'MATCH', pct: matchPct, color: '#ff6444' },
                            right: { label: 'DIFFER', pct: differPct, color: '#7c3aed' },
                            history: mdHistory,
                            colorMap: { M: '#ff6444', D: '#7c3aed' },
                        },
                        {
                            title: 'EVEN / ODD',
                            side: parseFloat(evenPct) > parseFloat(oddPct) ? '1x Even' : '1x Odd',
                            left: { label: 'EVEN', pct: evenPct, color: '#ff6444' },
                            right: { label: 'ODD', pct: oddPct, color: '#ff9f1c' },
                            history: eoHistory,
                            colorMap: { E: '#1a3a5c', O: '#ff6444' },
                        },
                    ].map(panel => (
                        <div className='analysis-tool__panel' key={panel.title}>
                            <div className='analysis-tool__panel-header'>
                                <span className='analysis-tool__panel-title'>{panel.title}</span>
                                <span className='analysis-tool__panel-side'>{panel.side}</span>
                            </div>
                            <div className='analysis-tool__panel-digits'>
                                {digitPcts.map((_, i) => (
                                    <div key={i} className='analysis-tool__panel-digit'>
                                        {i}
                                    </div>
                                ))}
                            </div>
                            <div className='analysis-tool__panel-bars'>
                                {[panel.left, panel.right].map(side => (
                                    <div className='analysis-tool__bar-row' key={side.label}>
                                        <span className='analysis-tool__bar-label'>{side.label}</span>
                                        <div className='analysis-tool__bar-track'>
                                            <div
                                                className='analysis-tool__bar-fill'
                                                style={{ width: `${side.pct}%`, background: side.color }}
                                            />
                                        </div>
                                        <span className='analysis-tool__bar-pct'>{side.pct}%</span>
                                    </div>
                                ))}
                            </div>
                            <div className='analysis-tool__history'>
                                {panel.history.map((h, i) => (
                                    <span
                                        key={i}
                                        className='analysis-tool__hist-item'
                                        style={{
                                            background: (panel.colorMap as Record<string, string>)[h] ?? '#1a3a5c',
                                        }}
                                    >
                                        {h}
                                    </span>
                                ))}
                                <button className='analysis-tool__more-btn'>+ More</button>
                            </div>
                        </div>
                    ))}

                    {/* AI Recommendation */}
                    <div className='analysis-tool__ai-rec'>
                        <div className='analysis-tool__ai-rec-header'>
                            <span>🤖 AI Recommendation</span>
                            <span className='analysis-tool__ai-conf'>{aiConf}% confidence</span>
                        </div>
                        <div className='analysis-tool__ai-trade'>
                            Recommended: <strong>{aiRec}</strong>
                        </div>
                        <div className='analysis-tool__ai-details'>
                            <div>
                                <span>Market Condition</span>
                                <span>Trending</span>
                            </div>
                            <div>
                                <span>Risk Rating</span>
                                <span style={{ color: '#00d26a' }}>Low</span>
                            </div>
                            <div>
                                <span>Expected Duration</span>
                                <span>5–10 ticks</span>
                            </div>
                        </div>
                        <button className='analysis-tool__load-btn'>Load Into Bot</button>
                    </div>
                </div>
            )}

            {activeTab === 'scanner' && (
                <div className='analysis-tool__scanner'>
                    <div className='analysis-tool__scanner-filters'>
                        {['Min Confidence', 'Risk Level', 'Trade Type', 'Market', 'Time Window'].map(f => (
                            <select key={f} className='analysis-tool__scanner-filter'>
                                <option>{f}</option>
                            </select>
                        ))}
                    </div>
                    <div className='analysis-tool__scanner-table-wrap'>
                        <table className='analysis-tool__scanner-table'>
                            <thead>
                                <tr>
                                    {[
                                        'Market',
                                        'Price',
                                        'Trend',
                                        'Momentum',
                                        'Vol',
                                        'Signal',
                                        'Confidence',
                                        'Risk',
                                        'Rec',
                                        'Action',
                                    ].map(h => (
                                        <th key={h}>{h}</th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {SCANNER_MARKETS.map((row, i) => (
                                    <tr key={i}>
                                        <td className='analysis-tool__market-name'>{row.name}</td>
                                        <td>{row.price.toFixed(2)}</td>
                                        <td style={{ color: row.trend === '↑' ? '#00d26a' : '#ff444f' }}>
                                            {row.trend}
                                        </td>
                                        <td>
                                            <div className='analysis-tool__mini-bar'>
                                                <div
                                                    style={{
                                                        width: `${row.momentum}%`,
                                                        background: row.momentum > 60 ? '#00d26a' : '#ff9f1c',
                                                    }}
                                                />
                                            </div>
                                        </td>
                                        <td>
                                            <span
                                                className={`analysis-tool__badge analysis-tool__badge--${row.vol.toLowerCase()}`}
                                            >
                                                {row.vol}
                                            </span>
                                        </td>
                                        <td>
                                            <span style={{ color: '#00c2e0' }}>{row.signal}%</span>
                                        </td>
                                        <td>
                                            <span style={{ color: row.confidence > 80 ? '#00d26a' : '#ff9f1c' }}>
                                                {row.confidence}%
                                            </span>
                                        </td>
                                        <td>
                                            <span
                                                className={`analysis-tool__badge analysis-tool__badge--${row.risk.toLowerCase()}`}
                                            >
                                                {row.risk}
                                            </span>
                                        </td>
                                        <td>
                                            <strong style={{ color: '#ff6444' }}>{row.rec}</strong>
                                        </td>
                                        <td>
                                            <button className='analysis-tool__action-btn'>Open Bot</button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {/* Side panel */}
                    <div className='analysis-tool__side-panel'>
                        {[
                            { label: 'Highest Confidence', value: 'V100 (1s) — 95%', color: '#00d26a' },
                            { label: 'Safest Trade', value: 'V10 (1s) — Even', color: '#00c2e0' },
                            { label: 'Highest Volatility', value: 'V75 (1s)', color: '#ff9f1c' },
                            { label: 'Strongest Momentum', value: 'V100 (1s) — 81', color: '#7c3aed' },
                            { label: 'Recovery Opportunity', value: 'Crash 500', color: '#ff6444' },
                        ].map(item => (
                            <div className='analysis-tool__side-card' key={item.label}>
                                <span className='analysis-tool__side-label'>{item.label}</span>
                                <span className='analysis-tool__side-value' style={{ color: item.color }}>
                                    {item.value}
                                </span>
                            </div>
                        ))}
                    </div>

                    {/* Live feed */}
                    <div className='analysis-tool__live-feed'>
                        <span className='analysis-tool__live-dot'>●</span>
                        <span>
                            Live: V100 (1s) Even signal 95% · V25 (1s) Matches 78% · Crash 500 momentum falling · V50
                            Under streak 3x
                        </span>
                    </div>
                </div>
            )}

            {/* Bottom bar */}
            <div className='analysis-tool__bottom-bar'>
                <button
                    className={`analysis-tool__run-btn ${running ? 'analysis-tool__run-btn--stop' : ''}`}
                    onClick={() => setRunning(r => !r)}
                >
                    {running ? '■ Stop' : '▶ Run'}
                </button>
                <div className='analysis-tool__bottom-info'>
                    <span>
                        Execution Speed: <strong>NORMAL SPEED</strong>
                    </span>
                    <span style={{ color: running ? '#00d26a' : 'rgba(255,255,255,0.4)' }}>
                        ● {running ? 'Active' : 'Idle'}
                    </span>
                </div>
            </div>
        </div>
    );
};

export default AnalysisTool;
