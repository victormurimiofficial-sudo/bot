import React, { useCallback, useEffect, useRef, useState } from 'react';
import './dtrader.scss';

// ─── Market Definitions ───────────────────────────────────────
const MARKETS = [
    { id: 'R_10', name: 'Volatility 10', group: 'Volatility', base: 9500, decimals: 2 },
    { id: '1HZ10V', name: 'Volatility 10 (1s)', group: 'Volatility', base: 9700, decimals: 2 },
    { id: 'R_15', name: 'Volatility 15', group: 'Volatility', base: 5200, decimals: 2 },
    { id: '1HZ15V', name: 'Volatility 15 (1s)', group: 'Volatility', base: 5400, decimals: 2 },
    { id: 'R_25', name: 'Volatility 25', group: 'Volatility', base: 8300, decimals: 2 },
    { id: '1HZ25V', name: 'Volatility 25 (1s)', group: 'Volatility', base: 8600, decimals: 2 },
    { id: 'R_50', name: 'Volatility 50', group: 'Volatility', base: 6700, decimals: 2 },
    { id: '1HZ50V', name: 'Volatility 50 (1s)', group: 'Volatility', base: 6900, decimals: 2 },
    { id: 'R_75', name: 'Volatility 75', group: 'Volatility', base: 4100, decimals: 2 },
    { id: '1HZ75V', name: 'Volatility 75 (1s)', group: 'Volatility', base: 4300, decimals: 2 },
    { id: 'R_100', name: 'Volatility 100', group: 'Volatility', base: 3200, decimals: 2 },
    { id: '1HZ100V', name: 'Volatility 100 (1s)', group: 'Volatility', base: 3400, decimals: 2 },
    { id: 'BOOM300N', name: 'Boom 300', group: 'Crash/Boom', base: 12000, decimals: 2 },
    { id: 'BOOM500', name: 'Boom 500', group: 'Crash/Boom', base: 9800, decimals: 2 },
    { id: 'BOOM1000', name: 'Boom 1000', group: 'Crash/Boom', base: 7500, decimals: 2 },
    { id: 'CRASH300N', name: 'Crash 300', group: 'Crash/Boom', base: 11500, decimals: 2 },
    { id: 'CRASH500', name: 'Crash 500', group: 'Crash/Boom', base: 9200, decimals: 2 },
    { id: 'CRASH1000', name: 'Crash 1000', group: 'Crash/Boom', base: 7100, decimals: 2 },
    { id: 'STPIDX', name: 'Step Index', group: 'Other', base: 7800, decimals: 2 },
    { id: 'RNGBR100', name: 'Range Break 100', group: 'Other', base: 40, decimals: 4 },
    { id: 'RNGBR200', name: 'Range Break 200', group: 'Other', base: 25, decimals: 4 },
];

const CONTRACT_TYPES = [
    { id: 'RISE_FALL', label: 'Rise / Fall' },
    { id: 'HIGHER_LOWER', label: 'Higher / Lower' },
    { id: 'TOUCH', label: 'Touch / No Touch' },
    { id: 'MATCHES_DIFFERS', label: 'Match / Differ' },
    { id: 'EVEN_ODD', label: 'Even / Odd' },
    { id: 'OVER_UNDER', label: 'Over / Under' },
];

const DURATION_UNITS = [
    { id: 't', label: 'Ticks', min: 1, max: 10 },
    { id: 's', label: 'Seconds', min: 15, max: 3600 },
    { id: 'm', label: 'Minutes', min: 1, max: 1440 },
];

// ─── Helpers ──────────────────────────────────────────────────
const formatPrice = (price: number, dec: number) => price.toFixed(dec);
const formatPnl = (n: number) => (n >= 0 ? '+' : '') + n.toFixed(2);

// ─── Simulated tick engine ────────────────────────────────────
type PriceState = { price: number; change: number; history: number[] };

function useLivePrices(markets: typeof MARKETS) {
    const [prices, setPrices] = useState<Record<string, PriceState>>(() => {
        const init: Record<string, PriceState> = {};
        markets.forEach(m => {
            init[m.id] = { price: m.base, change: 0, history: Array(60).fill(m.base) };
        });
        return init;
    });

    useEffect(() => {
        // Try to connect to real Deriv WS; fall back to simulation
        let ws: WebSocket | null = null;
        const subscriptions: Set<string> = new Set();

        const tryWs = () => {
            try {
                ws = new WebSocket('wss://ws.derivws.com/websockets/v3?app_id=36300');
                ws.onopen = () => {
                    markets.forEach(m => {
                        if (!subscriptions.has(m.id)) {
                            ws?.send(JSON.stringify({ ticks: m.id, subscribe: 1 }));
                            subscriptions.add(m.id);
                        }
                    });
                };
                ws.onmessage = (ev: MessageEvent) => {
                    try {
                        const data = JSON.parse(ev.data);
                        if (data.msg_type === 'tick' && data.tick) {
                            const { symbol, quote } = data.tick as { symbol: string; quote: number };
                            setPrices(prev => {
                                const prev_item = prev[symbol];
                                if (!prev_item) return prev;
                                const newHistory = [...prev_item.history.slice(1), quote];
                                return {
                                    ...prev,
                                    [symbol]: {
                                        price: quote,
                                        change: parseFloat(
                                            (((quote - prev_item.price) / prev_item.price) * 100).toFixed(4)
                                        ),
                                        history: newHistory,
                                    },
                                };
                            });
                        }
                    } catch (_) {
                        /* ignore parse errors */
                    }
                };
                ws.onerror = () => {
                    ws = null;
                    startSimulation();
                };
                ws.onclose = () => {
                    ws = null;
                };
            } catch (_) {
                startSimulation();
            }
        };

        let simInterval: ReturnType<typeof setInterval> | null = null;
        const startSimulation = () => {
            if (simInterval) return;
            simInterval = setInterval(() => {
                setPrices(prev => {
                    const next = { ...prev };
                    markets.forEach(m => {
                        const old = next[m.id];
                        const volatilityFactor = m.id.includes('100')
                            ? 0.0015
                            : m.id.includes('75')
                              ? 0.0012
                              : m.id.includes('50')
                                ? 0.001
                                : m.id.includes('25')
                                  ? 0.0007
                                  : 0.0004;
                        const delta = (Math.random() - 0.5) * 2 * old.price * volatilityFactor;
                        const newPrice = Math.max(old.price + delta, m.base * 0.5);
                        const newHistory = [...old.history.slice(1), newPrice];
                        next[m.id] = {
                            price: newPrice,
                            change: parseFloat((((newPrice - old.price) / old.price) * 100).toFixed(4)),
                            history: newHistory,
                        };
                    });
                    return next;
                });
            }, 800);
        };

        tryWs();
        // Also start sim as backup after 3s if WS hasn't produced data
        const fallbackTimer = setTimeout(() => {
            if (!ws || ws.readyState !== WebSocket.OPEN) startSimulation();
        }, 3000);

        return () => {
            clearTimeout(fallbackTimer);
            if (simInterval) clearInterval(simInterval);
            if (ws) {
                if (subscriptions.size > 0) {
                    ws?.send(JSON.stringify({ forget_all: 'ticks' }));
                }
                ws.close();
            }
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    return prices;
}

// ─── Sparkline Chart ──────────────────────────────────────────
const SparklineChart: React.FC<{ history: number[]; up: boolean }> = ({ history, up }) => {
    const min = Math.min(...history);
    const max = Math.max(...history);
    const range = max - min || 1;
    const w = 300;
    const h = 140;
    const pts = history.map((v, i) => `${(i / (history.length - 1)) * w},${h - ((v - min) / range) * h}`).join(' ');
    const color = up ? '#00d26a' : '#ff6b6b';
    return (
        <svg viewBox={`0 0 ${w} ${h}`} preserveAspectRatio='none' className='dtrader__chart-svg'>
            <defs>
                <linearGradient id='dt-grad' x1='0' y1='0' x2='0' y2='1'>
                    <stop offset='0%' stopColor={color} stopOpacity='0.3' />
                    <stop offset='100%' stopColor={color} stopOpacity='0.02' />
                </linearGradient>
            </defs>
            {[0.2, 0.4, 0.6, 0.8].map(t => (
                <line key={t} x1='0' y1={h * t} x2={w} y2={h * t} className='dtrader__chart-grid-line' />
            ))}
            <polygon points={`0,${h} ${pts} ${w},${h}`} fill='url(#dt-grad)' />
            <polyline points={pts} fill='none' stroke={color} strokeWidth='2' />
        </svg>
    );
};

// ─── Trade types ──────────────────────────────────────────────
type TradeDirection = 'CALL' | 'PUT';
type TradeStatus = 'open' | 'won' | 'lost';

interface Trade {
    id: string;
    market: string;
    symbol: string;
    type: string;
    direction: TradeDirection;
    stake: number;
    payout: number;
    pnl: number;
    entryPrice: number;
    exitPrice: number | null;
    status: TradeStatus;
    timestamp: number;
    ticksLeft: number;
    duration: number;
}

// ─── Main DTrader Component ───────────────────────────────────
const DTrader: React.FC = () => {
    const [selectedMarket, setSelectedMarket] = useState(MARKETS[0]);
    const [contractType, setContractType] = useState('RISE_FALL');
    const [duration, setDuration] = useState(5);
    const [durationUnit, setDurationUnit] = useState('t');
    const [stake, setStake] = useState('10.00');
    const [selectedDigit, setSelectedDigit] = useState(5);
    const [trades, setTrades] = useState<Trade[]>([]);
    const [activePanel, setActivePanel] = useState<'positions' | 'history' | 'stats'>('positions');
    const [toast, setToast] = useState<{ msg: string; type: 'profit' | 'loss' | 'info' } | null>(null);
    const tradeIdRef = useRef(0);
    const prices = useLivePrices(MARKETS);

    const groups = Array.from(new Set(MARKETS.map(m => m.group)));

    const currentPrice = prices[selectedMarket.id];
    const isUp = (currentPrice?.change ?? 0) >= 0;

    // Payout multiplier based on contract type
    const payoutMultiplier =
        contractType === 'RISE_FALL'
            ? 1.85
            : contractType === 'EVEN_ODD'
              ? 1.96
              : contractType === 'MATCHES_DIFFERS'
                ? 9.0
                : contractType === 'OVER_UNDER'
                  ? 1.96
                  : contractType === 'HIGHER_LOWER'
                    ? 1.75
                    : 1.85;

    const stakeNum = parseFloat(stake) || 0;
    const potentialPayout = stakeNum * payoutMultiplier;
    const potentialProfit = potentialPayout - stakeNum;

    const showToast = useCallback((msg: string, type: 'profit' | 'loss' | 'info') => {
        setToast({ msg, type });
        setTimeout(() => setToast(null), 3500);
    }, []);

    const placeTrade = useCallback(
        (direction: TradeDirection) => {
            if (stakeNum < 0.35) {
                showToast('Minimum stake is $0.35', 'info');
                return;
            }
            const id = `TRD-${Date.now()}-${++tradeIdRef.current}`;
            const durationTicks =
                durationUnit === 't' ? duration : Math.ceil(duration * (durationUnit === 'm' ? 60 : 1));
            const dirLabel =
                contractType === 'RISE_FALL'
                    ? direction === 'CALL'
                        ? 'Rise'
                        : 'Fall'
                    : contractType === 'EVEN_ODD'
                      ? direction === 'CALL'
                          ? 'Even'
                          : 'Odd'
                      : contractType === 'OVER_UNDER'
                        ? direction === 'CALL'
                            ? 'Over'
                            : 'Under'
                        : contractType === 'MATCHES_DIFFERS'
                          ? direction === 'CALL'
                              ? `Match ${selectedDigit}`
                              : `Differ ${selectedDigit}`
                          : direction === 'CALL'
                            ? 'Higher'
                            : 'Lower';

            const newTrade: Trade = {
                id,
                market: selectedMarket.name,
                symbol: selectedMarket.id,
                type: dirLabel,
                direction,
                stake: stakeNum,
                payout: potentialPayout,
                pnl: 0,
                entryPrice: currentPrice?.price ?? selectedMarket.base,
                exitPrice: null,
                status: 'open',
                timestamp: Date.now(),
                ticksLeft: durationTicks,
                duration: durationTicks,
            };
            setTrades(prev => [newTrade, ...prev]);
            showToast(`⚡ Trade placed — ${selectedMarket.name} ${dirLabel} $${stakeNum.toFixed(2)}`, 'info');
        },
        [
            stakeNum,
            duration,
            durationUnit,
            contractType,
            selectedMarket,
            currentPrice,
            potentialPayout,
            selectedDigit,
            showToast,
        ]
    );

    // Settle open trades
    useEffect(() => {
        const interval = setInterval(() => {
            setTrades(prev =>
                prev.map(t => {
                    if (t.status !== 'open') return t;
                    const newTicks = t.ticksLeft - 1;
                    if (newTicks > 0) return { ...t, ticksLeft: newTicks };

                    // Settle
                    const exitPrice = prices[t.symbol]?.price ?? t.entryPrice;
                    const won = Math.random() > 0.45; // slight house edge simulation
                    const pnl = won ? t.payout - t.stake : -t.stake;
                    if (won) {
                        showToast(`✅ Won +$${(t.payout - t.stake).toFixed(2)} on ${t.market}`, 'profit');
                    } else {
                        showToast(`❌ Lost -$${t.stake.toFixed(2)} on ${t.market}`, 'loss');
                    }
                    return {
                        ...t,
                        ticksLeft: 0,
                        exitPrice,
                        status: won ? 'won' : 'lost',
                        pnl,
                    };
                })
            );
        }, 1000);
        return () => clearInterval(interval);
    }, [prices, showToast]);

    const openTrades = trades.filter(t => t.status === 'open');
    const closedTrades = trades.filter(t => t.status !== 'open').slice(0, 30);
    const totalPnl = closedTrades.reduce((sum, t) => sum + t.pnl, 0);
    const wonCount = closedTrades.filter(t => t.status === 'won').length;
    const winRate = closedTrades.length ? Math.round((wonCount / closedTrades.length) * 100) : 0;

    const needsDigit = contractType === 'MATCHES_DIFFERS' || contractType === 'OVER_UNDER';
    const buyLabel =
        contractType === 'RISE_FALL'
            ? '▲ Rise'
            : contractType === 'EVEN_ODD'
              ? 'Even'
              : contractType === 'OVER_UNDER'
                ? `Over ${selectedDigit}`
                : contractType === 'MATCHES_DIFFERS'
                  ? `Match ${selectedDigit}`
                  : contractType === 'HIGHER_LOWER'
                    ? '▲ Higher'
                    : '▲ Rise';
    const sellLabel =
        contractType === 'RISE_FALL'
            ? '▼ Fall'
            : contractType === 'EVEN_ODD'
              ? 'Odd'
              : contractType === 'OVER_UNDER'
                ? `Under ${selectedDigit}`
                : contractType === 'MATCHES_DIFFERS'
                  ? `Differ ${selectedDigit}`
                  : contractType === 'HIGHER_LOWER'
                    ? '▼ Lower'
                    : '▼ Fall';

    return (
        <div className='dtrader'>
            {/* ── Market List ── */}
            <div className='dtrader__market-list'>
                {groups.map(group => (
                    <React.Fragment key={group}>
                        <div className='dtrader__market-section-title'>{group}</div>
                        {MARKETS.filter(m => m.group === group).map(m => {
                            const mp = prices[m.id];
                            const mUp = (mp?.change ?? 0) >= 0;
                            return (
                                <div
                                    key={m.id}
                                    className={`dtrader__market-item ${selectedMarket.id === m.id ? 'dtrader__market-item--active' : ''}`}
                                    onClick={() => setSelectedMarket(m)}
                                >
                                    <span className='dtrader__market-item-name'>{m.name}</span>
                                    <span className='dtrader__market-item-price'>
                                        {mp ? formatPrice(mp.price, m.decimals) : '—'}
                                    </span>
                                    {mp && (
                                        <span
                                            className={`dtrader__market-item-change dtrader__market-item-change--${mUp ? 'up' : 'down'}`}
                                        >
                                            {mUp ? '▲' : '▼'} {Math.abs(mp.change).toFixed(4)}%
                                        </span>
                                    )}
                                </div>
                            );
                        })}
                    </React.Fragment>
                ))}
            </div>

            {/* ── Center ── */}
            <div className='dtrader__center'>
                {/* Market Header */}
                <div className='dtrader__market-header'>
                    <div className='dtrader__market-icon'>{selectedMarket.name.charAt(0)}</div>
                    <div>
                        <div className='dtrader__market-title'>{selectedMarket.name}</div>
                        <div className='dtrader__market-subtitle'>{selectedMarket.id} · Synthetic Index</div>
                    </div>
                    <div className='dtrader__live-price'>
                        <div className='dtrader__live-price-val'>
                            <span className='dtrader__live-dot' />
                            {currentPrice ? formatPrice(currentPrice.price, selectedMarket.decimals) : '—'}
                        </div>
                        {currentPrice && (
                            <div
                                className={`dtrader__live-price-change dtrader__live-price-change--${isUp ? 'up' : 'down'}`}
                            >
                                {isUp ? '▲' : '▼'} {Math.abs(currentPrice.change).toFixed(4)}%
                            </div>
                        )}
                    </div>
                </div>

                {/* Sparkline Chart */}
                <div className='dtrader__chart-area'>
                    {currentPrice && <SparklineChart history={currentPrice.history} up={isUp} />}
                </div>

                {/* Trade Form */}
                <div className='dtrader__trade-form'>
                    {/* Contract Types */}
                    <div className='dtrader__contract-types'>
                        {CONTRACT_TYPES.map(ct => (
                            <button
                                key={ct.id}
                                className={`dtrader__contract-btn ${contractType === ct.id ? 'dtrader__contract-btn--active' : ''}`}
                                onClick={() => setContractType(ct.id)}
                            >
                                {ct.label}
                            </button>
                        ))}
                    </div>

                    {/* Duration + Stake */}
                    <div className='dtrader__form-row'>
                        <div className='dtrader__field'>
                            <label>Duration</label>
                            <div style={{ display: 'flex', gap: '6px' }}>
                                <input
                                    type='number'
                                    className='dtrader__input'
                                    value={duration}
                                    min={1}
                                    max={durationUnit === 't' ? 10 : 3600}
                                    onChange={e => setDuration(Number(e.target.value))}
                                    style={{ width: '70px' }}
                                />
                                <select
                                    className='dtrader__select'
                                    value={durationUnit}
                                    onChange={e => setDurationUnit(e.target.value)}
                                >
                                    {DURATION_UNITS.map(du => (
                                        <option key={du.id} value={du.id}>
                                            {du.label}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        </div>
                        <div className='dtrader__field'>
                            <label>Stake (USD)</label>
                            <input
                                type='number'
                                className='dtrader__input'
                                value={stake}
                                min={0.35}
                                step={0.5}
                                onChange={e => setStake(e.target.value)}
                            />
                        </div>
                    </div>

                    {/* Digit selector for Match/Differ, Over/Under */}
                    {needsDigit && (
                        <div className='dtrader__field'>
                            <label>{contractType === 'MATCHES_DIFFERS' ? 'Last Digit' : 'Barrier Digit'}</label>
                            <div className='dtrader__digit-selector'>
                                {Array.from({ length: 10 }, (_, i) => (
                                    <button
                                        key={i}
                                        className={`dtrader__digit-btn ${selectedDigit === i ? 'dtrader__digit-btn--active' : ''}`}
                                        onClick={() => setSelectedDigit(i)}
                                    >
                                        {i}
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Payout Preview */}
                    <div className='dtrader__payout-preview'>
                        <div className='dtrader__payout-preview-item'>
                            <span className='dtrader__payout-preview-label'>Stake</span>
                            <span className='dtrader__payout-preview-val'>${stakeNum.toFixed(2)}</span>
                        </div>
                        <div className='dtrader__payout-preview-item'>
                            <span className='dtrader__payout-preview-label'>Payout</span>
                            <span className='dtrader__payout-preview-val'>${potentialPayout.toFixed(2)}</span>
                        </div>
                        <div className='dtrader__payout-preview-item'>
                            <span className='dtrader__payout-preview-label'>Profit</span>
                            <span className='dtrader__payout-preview-val dtrader__payout-preview-val--profit'>
                                +${potentialProfit.toFixed(2)}
                            </span>
                        </div>
                        <div className='dtrader__payout-preview-item'>
                            <span className='dtrader__payout-preview-label'>Multiplier</span>
                            <span className='dtrader__payout-preview-val'>{payoutMultiplier}x</span>
                        </div>
                    </div>

                    {/* Buy / Sell */}
                    <div className='dtrader__buy-row'>
                        <button className='dtrader__buy-btn' onClick={() => placeTrade('CALL')}>
                            {buyLabel}
                        </button>
                        <button className='dtrader__sell-btn' onClick={() => placeTrade('PUT')}>
                            {sellLabel}
                        </button>
                    </div>
                </div>
            </div>

            {/* ── Right Panel ── */}
            <div className='dtrader__right-panel'>
                <div className='dtrader__panel-tabs'>
                    {(['positions', 'history', 'stats'] as const).map(tab => (
                        <div
                            key={tab}
                            className={`dtrader__panel-tab ${activePanel === tab ? 'dtrader__panel-tab--active' : ''}`}
                            onClick={() => setActivePanel(tab)}
                        >
                            {tab === 'positions'
                                ? `Open (${openTrades.length})`
                                : tab === 'history'
                                  ? 'History'
                                  : 'Stats'}
                        </div>
                    ))}
                </div>

                <div className='dtrader__panel-body'>
                    {activePanel === 'positions' &&
                        (openTrades.length === 0 ? (
                            <div className='dtrader__empty-state'>
                                <span className='dtrader__empty-state-icon'>📊</span>
                                <span>No open positions</span>
                                <span style={{ fontSize: '11px', color: '#2d3748' }}>Place a trade to get started</span>
                            </div>
                        ) : (
                            openTrades.map(t => (
                                <div key={t.id} className='dtrader__position-card dtrader__position-card--open'>
                                    <div className='dtrader__position-card-header'>
                                        <span className='dtrader__position-card-market'>{t.market}</span>
                                        <span
                                            className={`dtrader__position-card-type dtrader__position-card-type--${t.direction.toLowerCase()}`}
                                        >
                                            {t.type}
                                        </span>
                                    </div>
                                    <div className='dtrader__position-card-row'>
                                        <span>Stake: ${t.stake.toFixed(2)}</span>
                                        <span>Payout: ${t.payout.toFixed(2)}</span>
                                    </div>
                                    <div className='dtrader__position-card-row'>
                                        <span>Entry: {formatPrice(t.entryPrice, selectedMarket.decimals)}</span>
                                        <span style={{ color: '#f6c90e' }}>
                                            {t.ticksLeft} tick{t.ticksLeft !== 1 ? 's' : ''} left
                                        </span>
                                    </div>
                                    {/* Progress bar */}
                                    <div
                                        style={{
                                            height: '3px',
                                            borderRadius: '2px',
                                            background: '#1e2330',
                                            marginTop: '8px',
                                            overflow: 'hidden',
                                        }}
                                    >
                                        <div
                                            style={{
                                                height: '100%',
                                                borderRadius: '2px',
                                                background: '#f6c90e',
                                                width: `${((t.duration - t.ticksLeft) / t.duration) * 100}%`,
                                                transition: 'width 0.9s linear',
                                            }}
                                        />
                                    </div>
                                </div>
                            ))
                        ))}

                    {activePanel === 'history' &&
                        (closedTrades.length === 0 ? (
                            <div className='dtrader__empty-state'>
                                <span className='dtrader__empty-state-icon'>📜</span>
                                <span>No trade history yet</span>
                            </div>
                        ) : (
                            closedTrades.map(t => (
                                <div
                                    key={t.id}
                                    className={`dtrader__position-card dtrader__position-card--${t.status === 'won' ? 'profit' : 'loss'}`}
                                >
                                    <div className='dtrader__position-card-header'>
                                        <span className='dtrader__position-card-market'>{t.market}</span>
                                        <span
                                            className={`dtrader__position-card-pnl dtrader__position-card-pnl--${t.status === 'won' ? 'profit' : 'loss'}`}
                                        >
                                            {formatPnl(t.pnl)}
                                        </span>
                                    </div>
                                    <div className='dtrader__position-card-row'>
                                        <span>
                                            {t.type} · ${t.stake.toFixed(2)}
                                        </span>
                                        <span style={{ color: '#2d3748', fontSize: '10px' }}>
                                            {new Date(t.timestamp).toLocaleTimeString()}
                                        </span>
                                    </div>
                                </div>
                            ))
                        ))}

                    {activePanel === 'stats' && (
                        <div className='dtrader__stats-grid'>
                            <div className='dtrader__stat-card'>
                                <div className='dtrader__stat-card-label'>Total Trades</div>
                                <div className='dtrader__stat-card-value'>{closedTrades.length}</div>
                            </div>
                            <div className='dtrader__stat-card'>
                                <div className='dtrader__stat-card-label'>Win Rate</div>
                                <div
                                    className={`dtrader__stat-card-value dtrader__stat-card-value--${winRate >= 50 ? 'profit' : 'loss'}`}
                                >
                                    {winRate}%
                                </div>
                            </div>
                            <div className='dtrader__stat-card'>
                                <div className='dtrader__stat-card-label'>Total P&L</div>
                                <div
                                    className={`dtrader__stat-card-value dtrader__stat-card-value--${totalPnl >= 0 ? 'profit' : 'loss'}`}
                                >
                                    {formatPnl(totalPnl)}
                                </div>
                            </div>
                            <div className='dtrader__stat-card'>
                                <div className='dtrader__stat-card-label'>Won / Lost</div>
                                <div className='dtrader__stat-card-value'>
                                    <span style={{ color: '#00d26a' }}>{wonCount}</span>
                                    <span style={{ color: '#4a5568' }}>/</span>
                                    <span style={{ color: '#ff6b6b' }}>{closedTrades.length - wonCount}</span>
                                </div>
                            </div>
                            <div className='dtrader__stat-card'>
                                <div className='dtrader__stat-card-label'>Best Trade</div>
                                <div className='dtrader__stat-card-value dtrader__stat-card-value--profit'>
                                    {closedTrades.length
                                        ? `+${Math.max(...closedTrades.map(t => t.pnl)).toFixed(2)}`
                                        : '—'}
                                </div>
                            </div>
                            <div className='dtrader__stat-card'>
                                <div className='dtrader__stat-card-label'>Worst Trade</div>
                                <div className='dtrader__stat-card-value dtrader__stat-card-value--loss'>
                                    {closedTrades.length
                                        ? `${Math.min(...closedTrades.map(t => t.pnl)).toFixed(2)}`
                                        : '—'}
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* ── Toast ── */}
            {toast && <div className={`dtrader__toast dtrader__toast--${toast.type}`}>{toast.msg}</div>}
        </div>
    );
};

export default DTrader;
