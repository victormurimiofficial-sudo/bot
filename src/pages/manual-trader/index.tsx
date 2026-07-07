import React, { useEffect, useState } from 'react';
import './manual-trader.scss';

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

const TRADE_TYPES = ['Even / Odd', 'Over / Under', 'Matches / Differs', 'Rise / Fall', 'Higher / Lower'];

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

type Trade = {
    id: number;
    market: string;
    type: string;
    stake: number;
    result: 'win' | 'loss';
    pnl: number;
    time: string;
};

const ManualTrader: React.FC = () => {
    const [market, setMarket] = useState('Volatility 100 Index');
    const [tradeType, setTradeType] = useState('Even / Odd');
    const [stake, setStake] = useState('0.50');
    const [ticks, setTicks] = useState('5');
    const [livePrice, setLivePrice] = useState(BASE_PRICES['Volatility 100 Index']);
    const [trades, setTrades] = useState<Trade[]>([]);
    const [pending, setPending] = useState<string | null>(null);
    const [totalPnl, setTotalPnl] = useState(0);

    useEffect(() => {
        const base = BASE_PRICES[market] ?? 3200;
        setLivePrice(base);
    }, [market]);

    useEffect(() => {
        const interval = setInterval(() => {
            const base = BASE_PRICES[market] ?? 3200;
            setLivePrice(p => Math.max(base * 0.5, p + p * (Math.random() - 0.5) * 0.008));
        }, 600);
        return () => clearInterval(interval);
    }, [market]);

    const placeTrade = (side: string) => {
        const s = parseFloat(stake) || 0.5;
        setPending(side);
        setTimeout(
            () => {
                const win = Math.random() > 0.45;
                const pnl = win ? parseFloat((s * 0.92).toFixed(2)) : -s;
                const now = new Date();
                const time = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}:${now.getSeconds().toString().padStart(2, '0')}`;
                const trade: Trade = {
                    id: Date.now(),
                    market,
                    type: side,
                    stake: s,
                    result: win ? 'win' : 'loss',
                    pnl,
                    time,
                };
                setTrades(prev => [trade, ...prev].slice(0, 20));
                setTotalPnl(prev => parseFloat((prev + pnl).toFixed(2)));
                setPending(null);
            },
            parseFloat(ticks) * 600
        );
    };

    const wins = trades.filter(t => t.result === 'win').length;
    const winRate = trades.length > 0 ? ((wins / trades.length) * 100).toFixed(1) : '—';

    // Determine buttons from trade type
    const getBtns = () => {
        if (tradeType === 'Even / Odd')
            return [
                { label: 'Even', color: '#00c2e0' },
                { label: 'Odd', color: '#ff6444' },
            ];
        if (tradeType === 'Over / Under')
            return [
                { label: 'Over', color: '#00d26a' },
                { label: 'Under', color: '#ff444f' },
            ];
        if (tradeType === 'Matches / Differs')
            return [
                { label: 'Matches', color: '#7c3aed' },
                { label: 'Differs', color: '#ff9f1c' },
            ];
        if (tradeType === 'Rise / Fall')
            return [
                { label: 'Rise', color: '#00d26a' },
                { label: 'Fall', color: '#ff444f' },
            ];
        return [
            { label: 'Higher', color: '#00d26a' },
            { label: 'Lower', color: '#ff444f' },
        ];
    };

    const dec = market.includes('Range') ? 4 : 2;

    return (
        <div className='manual-trader'>
            {/* Stats */}
            <div className='manual-trader__stats'>
                <div className='manual-trader__stat'>
                    <span className='manual-trader__stat-label'>TRADES</span>
                    <span className='manual-trader__stat-val'>{trades.length}</span>
                </div>
                <div className='manual-trader__stat'>
                    <span className='manual-trader__stat-label'>WIN RATE</span>
                    <span className='manual-trader__stat-val manual-trader__stat-val--good'>
                        {winRate}
                        {trades.length > 0 ? '%' : ''}
                    </span>
                </div>
                <div className='manual-trader__stat'>
                    <span className='manual-trader__stat-label'>TOTAL P/L</span>
                    <span
                        className={`manual-trader__stat-val ${totalPnl >= 0 ? 'manual-trader__stat-val--good' : 'manual-trader__stat-val--bad'}`}
                    >
                        {totalPnl >= 0 ? '+' : ''}
                        {totalPnl.toFixed(2)}
                    </span>
                </div>
                <div className='manual-trader__stat'>
                    <span className='manual-trader__stat-label'>LIVE PRICE</span>
                    <span className='manual-trader__stat-val manual-trader__stat-val--price'>
                        {livePrice.toFixed(dec)}
                    </span>
                </div>
            </div>

            {/* Trade form */}
            <div className='manual-trader__form'>
                <div className='manual-trader__field'>
                    <label className='manual-trader__label'>Market</label>
                    <select className='manual-trader__select' value={market} onChange={e => setMarket(e.target.value)}>
                        {MARKETS.map(m => (
                            <option key={m} value={m}>
                                {m}
                            </option>
                        ))}
                    </select>
                </div>
                <div className='manual-trader__field'>
                    <label className='manual-trader__label'>Trade Type</label>
                    <select
                        className='manual-trader__select'
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
                <div className='manual-trader__inputs-row'>
                    <div className='manual-trader__field'>
                        <label className='manual-trader__label'>Stake ($)</label>
                        <input
                            className='manual-trader__input'
                            type='number'
                            value={stake}
                            min='0.35'
                            step='0.01'
                            onChange={e => setStake(e.target.value)}
                        />
                    </div>
                    <div className='manual-trader__field'>
                        <label className='manual-trader__label'>Ticks</label>
                        <input
                            className='manual-trader__input'
                            type='number'
                            value={ticks}
                            min='1'
                            max='10'
                            onChange={e => setTicks(e.target.value)}
                        />
                    </div>
                </div>

                {/* Payout preview */}
                <div className='manual-trader__payout-card'>
                    <div className='manual-trader__payout-row'>
                        <span>Stake</span>
                        <span>${parseFloat(stake).toFixed(2)}</span>
                    </div>
                    <div className='manual-trader__payout-row'>
                        <span>Payout</span>
                        <span className='manual-trader__payout-green'>${(parseFloat(stake) * 1.92).toFixed(2)}</span>
                    </div>
                    <div className='manual-trader__payout-row'>
                        <span>Profit</span>
                        <span className='manual-trader__payout-green'>+${(parseFloat(stake) * 0.92).toFixed(2)}</span>
                    </div>
                </div>

                {/* Buy buttons */}
                <div className='manual-trader__buy-btns'>
                    {getBtns().map(btn => (
                        <button
                            key={btn.label}
                            className='manual-trader__buy-btn'
                            style={{
                                background: pending ? 'rgba(255,255,255,0.05)' : btn.color + '20',
                                borderColor: btn.color + '60',
                                color: btn.color,
                            }}
                            disabled={!!pending}
                            onClick={() => placeTrade(btn.label)}
                        >
                            {pending === btn.label ? (
                                <span className='manual-trader__pending'>Executing…</span>
                            ) : (
                                <>
                                    <span className='manual-trader__buy-label'>{btn.label}</span>
                                    <span className='manual-trader__buy-pct'>
                                        ~{(45 + Math.random() * 10).toFixed(1)}%
                                    </span>
                                </>
                            )}
                        </button>
                    ))}
                </div>
            </div>

            {/* Trade history */}
            <div className='manual-trader__history'>
                <h3 className='manual-trader__history-title'>Trade History</h3>
                {trades.length === 0 && (
                    <div className='manual-trader__history-empty'>No trades yet. Place your first trade above.</div>
                )}
                <div className='manual-trader__history-list'>
                    {trades.map(t => (
                        <div
                            key={t.id}
                            className={`manual-trader__hist-row ${t.result === 'win' ? 'manual-trader__hist-row--win' : 'manual-trader__hist-row--loss'}`}
                        >
                            <span className='manual-trader__hist-time'>{t.time}</span>
                            <span className='manual-trader__hist-market'>{t.market.replace(' Index', '')}</span>
                            <span className='manual-trader__hist-type'>{t.type}</span>
                            <span className='manual-trader__hist-stake'>${t.stake.toFixed(2)}</span>
                            <span
                                className={`manual-trader__hist-pnl ${t.pnl >= 0 ? 'manual-trader__hist-pnl--win' : 'manual-trader__hist-pnl--loss'}`}
                            >
                                {t.pnl >= 0 ? '+' : ''}
                                {t.pnl.toFixed(2)}
                            </span>
                            <span
                                className={`manual-trader__hist-result ${t.result === 'win' ? 'manual-trader__hist-result--win' : 'manual-trader__hist-result--loss'}`}
                            >
                                {t.result.toUpperCase()}
                            </span>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default ManualTrader;
