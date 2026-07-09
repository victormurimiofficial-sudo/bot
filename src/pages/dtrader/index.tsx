import React, { useEffect, useRef, useState, useCallback } from 'react';
import { api_base } from '@/external/bot-skeleton';
import './dtrader.scss';

/* ──────────────────────────────────────────────
   Constants
────────────────────────────────────────────── */
const MARKETS: { label: string; symbol: string }[] = [
    { label: 'Volatility 10 Index', symbol: 'R_10' },
    { label: 'Volatility 10 (1s) Index', symbol: '1HZ10V' },
    { label: 'Volatility 25 Index', symbol: 'R_25' },
    { label: 'Volatility 25 (1s) Index', symbol: '1HZ25V' },
    { label: 'Volatility 50 Index', symbol: 'R_50' },
    { label: 'Volatility 50 (1s) Index', symbol: '1HZ50V' },
    { label: 'Volatility 75 Index', symbol: 'R_75' },
    { label: 'Volatility 75 (1s) Index', symbol: '1HZ75V' },
    { label: 'Volatility 100 Index', symbol: 'R_100' },
    { label: 'Volatility 100 (1s) Index', symbol: '1HZ100V' },
    { label: 'Boom 300 Index', symbol: 'BOOM300N' },
    { label: 'Boom 500 Index', symbol: 'BOOM500' },
    { label: 'Boom 1000 Index', symbol: 'BOOM1000' },
    { label: 'Crash 300 Index', symbol: 'CRASH300N' },
    { label: 'Crash 500 Index', symbol: 'CRASH500' },
    { label: 'Crash 1000 Index', symbol: 'CRASH1000' },
    { label: 'Step Index', symbol: 'STPINDX' },
];

type TradeTypeDef = {
    label: string;
    sides: { label: string; contract_type: string; color: string }[];
    hasBarrier: boolean;
    barrierLabel?: string;
};

const TRADE_TYPES: TradeTypeDef[] = [
    {
        label: 'Rise / Fall',
        hasBarrier: false,
        sides: [
            { label: 'Rise', contract_type: 'CALL', color: '#00b057' },
            { label: 'Fall', contract_type: 'PUT', color: '#ff444f' },
        ],
    },
    {
        label: 'Even / Odd',
        hasBarrier: false,
        sides: [
            { label: 'Even', contract_type: 'DIGITEVEN', color: '#00c2e0' },
            { label: 'Odd', contract_type: 'DIGITODD', color: '#ff6444' },
        ],
    },
    {
        label: 'Over / Under',
        hasBarrier: true,
        barrierLabel: 'Digit (0–9)',
        sides: [
            { label: 'Over', contract_type: 'DIGITOVER', color: '#00b057' },
            { label: 'Under', contract_type: 'DIGITUNDER', color: '#ff444f' },
        ],
    },
    {
        label: 'Matches / Differs',
        hasBarrier: true,
        barrierLabel: 'Digit (0–9)',
        sides: [
            { label: 'Matches', contract_type: 'DIGITMATCH', color: '#7c3aed' },
            { label: 'Differs', contract_type: 'DIGITDIFF', color: '#ff9f1c' },
        ],
    },
    {
        label: 'Higher / Lower',
        hasBarrier: true,
        barrierLabel: 'Barrier (e.g. +0.5)',
        sides: [
            { label: 'Higher', contract_type: 'CALL', color: '#00b057' },
            { label: 'Lower', contract_type: 'PUT', color: '#ff444f' },
        ],
    },
];

type ActiveContract = {
    contract_id: number;
    buy_price: number;
    payout: number;
    longcode: string;
    contract_type: string;
    profit?: number;
    status?: string;
    is_sold?: number;
    exit_tick?: string;
};

type TradeRecord = {
    id: number;
    time: string;
    symbol: string;
    type: string;
    side: string;
    stake: number;
    payout: number;
    profit: number;
    status: 'won' | 'lost';
};

type Proposal = {
    id: string;
    ask_price: number;
    payout: number;
    longcode: string;
};

/* ──────────────────────────────────────────────
   Component
────────────────────────────────────────────── */
const DTrader: React.FC = () => {
    const [marketIdx, setMarketIdx] = useState(8); // R_100 default
    const [tradeTypeIdx, setTradeTypeIdx] = useState(0);
    const [stake, setStake] = useState('1.00');
    const [duration, setDuration] = useState('5');
    const [barrier, setBarrier] = useState('5');
    const [livePrice, setLivePrice] = useState<string | null>(null);
    const [lastDigit, setLastDigit] = useState<number | null>(null);
    const [proposals, setProposals] = useState<Record<string, Proposal | null>>({});
    const [proposalLoading, setProposalLoading] = useState(false);
    const [activeContracts, setActiveContracts] = useState<ActiveContract[]>([]);
    const [history, setHistory] = useState<TradeRecord[]>([]);
    const [buying, setBuying] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [isAuthorized, setIsAuthorized] = useState(false);
    const [totalPnl, setTotalPnl] = useState(0);

    const tickSubRef = useRef<{ unsubscribe: () => void } | null>(null);
    const proposalSubRef = useRef<{ unsubscribe: () => void } | null>(null);
    const contractSubsRef = useRef<Map<number, { unsubscribe: () => void }>>(new Map());
    const proposalTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const mountedRef = useRef(true);
    // Version tokens to discard stale async responses
    const tickVersionRef = useRef(0);
    const proposalVersionRef = useRef(0);

    const market = MARKETS[marketIdx];
    const tradeType = TRADE_TYPES[tradeTypeIdx];

    /* ── Authorization check ── */
    useEffect(() => {
        const checkAuth = () => {
            const authorized = api_base?.is_authorized ?? false;
            setIsAuthorized(authorized);
        };
        checkAuth();
        const interval = setInterval(checkAuth, 2000);
        return () => clearInterval(interval);
    }, []);

    /* ── Tick subscription ── */
    const subscribeTicks = useCallback(async (symbol: string) => {
        // Increment version so any in-flight async from prior call is discarded
        const myVersion = ++tickVersionRef.current;

        // Tear down old subscription synchronously before any await
        if (tickSubRef.current) {
            tickSubRef.current.unsubscribe();
            tickSubRef.current = null;
        }
        setLivePrice(null);
        setLastDigit(null);

        try {
            if (!api_base?.api) return;

            // Attach listener BEFORE the await so no ticks slip through
            const msgSub = api_base.api.onMessage()?.subscribe(({ data }: any) => {
                if (!mountedRef.current || tickVersionRef.current !== myVersion) return;
                if (data?.msg_type === 'tick' && data?.tick) {
                    const quote: number = data.tick.quote;
                    const quoteStr = quote.toFixed(2);
                    setLivePrice(quoteStr);
                    setLastDigit(parseInt(quoteStr.slice(-1), 10));
                }
            });

            // Store ref immediately so a subsequent call can unsubscribe it
            if (msgSub) tickSubRef.current = msgSub;

            // Now kick off the network request
            await api_base.api.send({ forget_all: 'ticks' }).catch(() => null);

            if (tickVersionRef.current !== myVersion) {
                // A newer call already took over; clean up our listener
                msgSub?.unsubscribe();
                if (tickSubRef.current === msgSub) tickSubRef.current = null;
                return;
            }

            const res = await api_base.api.send({ ticks: symbol, subscribe: 1 });

            if (tickVersionRef.current !== myVersion) return; // stale

            if (res?.tick) {
                const quote: number = res.tick.quote;
                const quoteStr = quote.toFixed(2);
                setLivePrice(quoteStr);
                setLastDigit(parseInt(quoteStr.slice(-1), 10));
            }
        } catch (e: any) {
            if (mountedRef.current && tickVersionRef.current === myVersion) {
                setError(e?.error?.message ?? 'Failed to subscribe to ticks');
            }
        }
    }, []);

    useEffect(() => {
        mountedRef.current = true;
        return () => {
            mountedRef.current = false;
            tickSubRef.current?.unsubscribe();
            proposalSubRef.current?.unsubscribe();
            msgSubRef.current?.unsubscribe();
            contractSubsRef.current.forEach(sub => sub.unsubscribe());
            if (proposalTimerRef.current) clearTimeout(proposalTimerRef.current);
        };
    }, []);

    useEffect(() => {
        subscribeTicks(market.symbol);
    }, [market.symbol, subscribeTicks]);

    /* ── Proposal request ── */
    const fetchProposals = useCallback(async () => {
        if (!api_base?.api || !isAuthorized) return;

        // Increment nonce so any in-flight responses from prior fetch are rejected
        const myVersion = ++proposalVersionRef.current;

        setProposalLoading(true);
        setProposals({});
        setError(null);

        const stakeNum = parseFloat(stake) || 1;
        const durationNum = parseInt(duration) || 5;
        const isDigit = ['DIGITEVEN', 'DIGITODD', 'DIGITOVER', 'DIGITUNDER', 'DIGITMATCH', 'DIGITDIFF'];

        // Use a unique passthrough nonce so responses can be correlated to this exact fetch
        const fetchNonce = `pv${myVersion}`;

        const requests = tradeType.sides.map(side => ({
            proposal: 1,
            amount: stakeNum,
            basis: 'stake',
            contract_type: side.contract_type,
            currency: 'USD',
            duration: durationNum,
            duration_unit: 't',
            symbol: market.symbol,
            passthrough: { fetchNonce },
            ...(tradeType.hasBarrier && isDigit.includes(side.contract_type) && { barrier }),
            ...(tradeType.hasBarrier && !isDigit.includes(side.contract_type) && { barrier: `+${barrier}` }),
        }));

        // Tear down old proposal subscription synchronously before any await
        proposalSubRef.current?.unsubscribe();
        proposalSubRef.current = null;

        const newProposals: Record<string, Proposal | null> = {};
        for (const side of tradeType.sides) newProposals[side.contract_type] = null;
        setProposals({ ...newProposals });

        try {
            // Attach listener before sends; only accept responses with our fetchNonce
            const sub = api_base.api.onMessage()?.subscribe(({ data }: any) => {
                if (!mountedRef.current) return;
                if (proposalVersionRef.current !== myVersion) return; // stale fetch
                if (data?.msg_type === 'proposal' && data?.proposal) {
                    const p = data.proposal;
                    const ct = data.echo_req?.contract_type;
                    const nonce = data.echo_req?.passthrough?.fetchNonce ?? data.passthrough?.fetchNonce;
                    if (ct && nonce === fetchNonce) {
                        setProposals(prev => ({
                            ...prev,
                            [ct]: { id: p.id, ask_price: p.ask_price, payout: p.payout, longcode: p.longcode },
                        }));
                    }
                }
            });
            if (sub) proposalSubRef.current = sub;

            // Send all proposal requests
            await Promise.all(requests.map(r => api_base.api.send(r)));
        } catch (e: any) {
            if (mountedRef.current && proposalVersionRef.current === myVersion) {
                setError(e?.error?.message ?? 'Failed to fetch proposals');
            }
        } finally {
            if (mountedRef.current && proposalVersionRef.current === myVersion) {
                setProposalLoading(false);
            }
        }
    }, [stake, duration, barrier, tradeType, market, isAuthorized]);

    // Debounce proposal fetch on form changes
    useEffect(() => {
        if (!isAuthorized) return;
        if (proposalTimerRef.current) clearTimeout(proposalTimerRef.current);
        proposalTimerRef.current = setTimeout(() => {
            fetchProposals();
        }, 600);
        return () => {
            if (proposalTimerRef.current) clearTimeout(proposalTimerRef.current);
        };
    }, [fetchProposals, isAuthorized]);

    /* ── Buy handler ── */
    const handleBuy = async (side: (typeof tradeType.sides)[0]) => {
        const proposal = proposals[side.contract_type];
        if (!proposal || !api_base?.api || !isAuthorized) return;

        setBuying(side.contract_type);
        setError(null);

        try {
            const res = await api_base.api.send({ buy: proposal.id, price: proposal.ask_price });
            const buy = res?.buy;
            if (!buy) throw new Error('No buy response');

            const contract: ActiveContract = {
                contract_id: buy.contract_id,
                buy_price: buy.buy_price,
                payout: buy.payout,
                longcode: buy.longcode,
                contract_type: side.contract_type,
            };
            if (mountedRef.current) {
                setActiveContracts(prev => [contract, ...prev]);
            }

            // Track contract result
            const pocSub = api_base.api.onMessage()?.subscribe(({ data }: any) => {
                if (!mountedRef.current) return;
                if (data?.msg_type === 'proposal_open_contract') {
                    const poc = data.proposal_open_contract;
                    if (poc?.contract_id === buy.contract_id) {
                        setActiveContracts(prev =>
                            prev.map(c =>
                                c.contract_id === buy.contract_id
                                    ? {
                                          ...c,
                                          profit: poc.profit,
                                          status: poc.status,
                                          is_sold: poc.is_sold,
                                          exit_tick: poc.exit_tick_display_value,
                                      }
                                    : c
                            )
                        );

                        if (poc.is_sold) {
                            // Contract finished — move to history
                            pocSub?.unsubscribe();
                            contractSubsRef.current.delete(buy.contract_id);

                            const profit = poc.profit ?? 0;
                            const record: TradeRecord = {
                                id: Date.now(),
                                time: new Date().toLocaleTimeString(),
                                symbol: market.label.replace(' Index', ''),
                                type: tradeType.label,
                                side: side.label,
                                stake: buy.buy_price,
                                payout: poc.sell_price ?? buy.payout,
                                profit,
                                status: profit >= 0 ? 'won' : 'lost',
                            };
                            if (mountedRef.current) {
                                setHistory(prev => [record, ...prev].slice(0, 50));
                                setTotalPnl(prev => parseFloat((prev + profit).toFixed(2)));
                                setActiveContracts(prev => prev.filter(c => c.contract_id !== buy.contract_id));
                            }
                        }
                    }
                }
            });

            if (pocSub) contractSubsRef.current.set(buy.contract_id, pocSub);

            // Subscribe to contract updates
            await api_base.api.send({ proposal_open_contract: 1, contract_id: buy.contract_id, subscribe: 1 });

            // Refresh proposals after buying
            fetchProposals();
        } catch (e: any) {
            if (mountedRef.current) setError(e?.error?.message ?? 'Trade failed. Please try again.');
        } finally {
            if (mountedRef.current) setBuying(null);
        }
    };

    const wins = history.filter(t => t.status === 'won').length;
    const winRate = history.length > 0 ? ((wins / history.length) * 100).toFixed(1) : null;
    const stakeNum = parseFloat(stake) || 1;

    return (
        <div className='dtrader'>
            {/* Header bar */}
            <div className='dtrader__header'>
                <div className='dtrader__header-left'>
                    <span className='dtrader__title'>DTrader</span>
                    <span className={`dtrader__auth-badge ${isAuthorized ? 'dtrader__auth-badge--ok' : 'dtrader__auth-badge--warn'}`}>
                        {isAuthorized ? '● Connected' : '● Add Token to Trade'}
                    </span>
                </div>
                <div className='dtrader__live-price'>
                    <span className='dtrader__live-label'>LIVE</span>
                    <span className='dtrader__live-val'>{livePrice ?? '—'}</span>
                    {lastDigit !== null && (
                        <span className='dtrader__last-digit'>Digit: <strong>{lastDigit}</strong></span>
                    )}
                </div>
                <div className='dtrader__stats'>
                    <div className='dtrader__stat'>
                        <span className='dtrader__stat-lbl'>TRADES</span>
                        <span className='dtrader__stat-val'>{history.length}</span>
                    </div>
                    <div className='dtrader__stat'>
                        <span className='dtrader__stat-lbl'>WIN RATE</span>
                        <span className='dtrader__stat-val dtrader__stat-val--good'>{winRate ? `${winRate}%` : '—'}</span>
                    </div>
                    <div className='dtrader__stat'>
                        <span className='dtrader__stat-lbl'>P/L</span>
                        <span className={`dtrader__stat-val ${totalPnl >= 0 ? 'dtrader__stat-val--good' : 'dtrader__stat-val--bad'}`}>
                            {totalPnl >= 0 ? '+' : ''}{totalPnl.toFixed(2)}
                        </span>
                    </div>
                </div>
            </div>

            {/* Error banner */}
            {error && (
                <div className='dtrader__error' onClick={() => setError(null)}>
                    ⚠ {error} <span className='dtrader__error-close'>✕</span>
                </div>
            )}

            {/* Main body */}
            <div className='dtrader__body'>
                {/* Trade form */}
                <div className='dtrader__form'>
                    {/* Market */}
                    <div className='dtrader__field'>
                        <label className='dtrader__label'>Market</label>
                        <select
                            className='dtrader__select'
                            value={marketIdx}
                            onChange={e => setMarketIdx(Number(e.target.value))}
                        >
                            {MARKETS.map((m, i) => (
                                <option key={m.symbol} value={i}>{m.label}</option>
                            ))}
                        </select>
                    </div>

                    {/* Trade type */}
                    <div className='dtrader__field'>
                        <label className='dtrader__label'>Trade Type</label>
                        <div className='dtrader__type-grid'>
                            {TRADE_TYPES.map((t, i) => (
                                <button
                                    key={t.label}
                                    className={`dtrader__type-btn ${tradeTypeIdx === i ? 'dtrader__type-btn--active' : ''}`}
                                    onClick={() => setTradeTypeIdx(i)}
                                >
                                    {t.label}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Inputs row */}
                    <div className='dtrader__inputs-row'>
                        <div className='dtrader__field'>
                            <label className='dtrader__label'>Stake (USD)</label>
                            <input
                                className='dtrader__input'
                                type='number'
                                value={stake}
                                min='0.35'
                                step='0.01'
                                onChange={e => setStake(e.target.value)}
                            />
                        </div>
                        <div className='dtrader__field'>
                            <label className='dtrader__label'>Ticks</label>
                            <input
                                className='dtrader__input'
                                type='number'
                                value={duration}
                                min='1'
                                max='10'
                                onChange={e => setDuration(e.target.value)}
                            />
                        </div>
                        {tradeType.hasBarrier && (
                            <div className='dtrader__field'>
                                <label className='dtrader__label'>{tradeType.barrierLabel}</label>
                                {(tradeType.label === 'Over / Under' || tradeType.label === 'Matches / Differs') ? (
                                    <div className='dtrader__digit-picker'>
                                        {Array.from({ length: 10 }, (_, d) => (
                                            <button
                                                key={d}
                                                className={`dtrader__digit-btn ${barrier === String(d) ? 'dtrader__digit-btn--active' : ''}`}
                                                onClick={() => setBarrier(String(d))}
                                            >
                                                {d}
                                            </button>
                                        ))}
                                    </div>
                                ) : (
                                    <input
                                        className='dtrader__input'
                                        type='text'
                                        value={barrier}
                                        placeholder='+0.5'
                                        onChange={e => setBarrier(e.target.value)}
                                    />
                                )}
                            </div>
                        )}
                    </div>

                    {/* Payout preview */}
                    <div className='dtrader__payout-row'>
                        {tradeType.sides.map(side => {
                            const p = proposals[side.contract_type];
                            return (
                                <div key={side.contract_type} className='dtrader__payout-card' style={{ borderColor: side.color + '40' }}>
                                    <div className='dtrader__payout-side' style={{ color: side.color }}>{side.label}</div>
                                    {proposalLoading ? (
                                        <div className='dtrader__payout-loading'>Fetching…</div>
                                    ) : p ? (
                                        <>
                                            <div className='dtrader__payout-amount'>
                                                <span className='dtrader__payout-lbl'>Stake</span>
                                                <span>${p.ask_price.toFixed(2)}</span>
                                            </div>
                                            <div className='dtrader__payout-amount'>
                                                <span className='dtrader__payout-lbl'>Payout</span>
                                                <span className='dtrader__payout-green'>${p.payout.toFixed(2)}</span>
                                            </div>
                                            <div className='dtrader__payout-amount'>
                                                <span className='dtrader__payout-lbl'>Profit</span>
                                                <span className='dtrader__payout-green'>+${(p.payout - p.ask_price).toFixed(2)}</span>
                                            </div>
                                        </>
                                    ) : (
                                        <>
                                            <div className='dtrader__payout-amount'>
                                                <span className='dtrader__payout-lbl'>Stake</span>
                                                <span>${stakeNum.toFixed(2)}</span>
                                            </div>
                                            <div className='dtrader__payout-amount'>
                                                <span className='dtrader__payout-lbl'>Payout</span>
                                                <span className='dtrader__payout-green'>${(stakeNum * 1.95).toFixed(2)}</span>
                                            </div>
                                        </>
                                    )}
                                </div>
                            );
                        })}
                    </div>

                    {/* Auth notice */}
                    {!isAuthorized && (
                        <div className='dtrader__auth-notice'>
                            🔐 Add your Deriv API token (via the TOKEN button in the header) to enable live proposals and real trades.
                        </div>
                    )}

                    {/* Buy buttons */}
                    <div className='dtrader__buy-btns'>
                        {tradeType.sides.map(side => {
                            const p = proposals[side.contract_type];
                            const isBuying = buying === side.contract_type;
                            return (
                                <button
                                    key={side.contract_type}
                                    className={`dtrader__buy-btn ${isBuying ? 'dtrader__buy-btn--loading' : ''}`}
                                    style={{
                                        background: isBuying ? '#e8ecf4' : side.color,
                                        color: isBuying ? '#8a94b2' : '#fff',
                                        opacity: !isAuthorized || isBuying ? 0.7 : 1,
                                    }}
                                    disabled={!isAuthorized || !!buying}
                                    onClick={() => handleBuy(side)}
                                >
                                    {isBuying ? (
                                        <span className='dtrader__buy-spinner'>⏳ Executing…</span>
                                    ) : (
                                        <>
                                            <span className='dtrader__buy-side'>{side.label}</span>
                                            <span className='dtrader__buy-price'>
                                                {p ? `$${p.ask_price.toFixed(2)}` : `$${stakeNum.toFixed(2)}`}
                                            </span>
                                        </>
                                    )}
                                </button>
                            );
                        })}
                    </div>

                    {/* Active contracts */}
                    {activeContracts.length > 0 && (
                        <div className='dtrader__active'>
                            <div className='dtrader__section-title'>⏱ Active Contracts</div>
                            {activeContracts.map(c => (
                                <div key={c.contract_id} className='dtrader__active-card'>
                                    <div className='dtrader__active-type'>{c.contract_type}</div>
                                    <div className='dtrader__active-info'>
                                        <span>#{c.contract_id}</span>
                                        <span>Stake: ${c.buy_price.toFixed(2)}</span>
                                        {c.profit !== undefined && (
                                            <span className={c.profit >= 0 ? 'dtrader__pnl--win' : 'dtrader__pnl--loss'}>
                                                P/L: {c.profit >= 0 ? '+' : ''}{c.profit.toFixed(2)}
                                            </span>
                                        )}
                                        <span className='dtrader__active-status'>{c.status ?? 'open'}</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Trade history */}
                <div className='dtrader__history'>
                    <div className='dtrader__history-header'>
                        <span className='dtrader__section-title'>Trade History</span>
                        {history.length > 0 && (
                            <span className='dtrader__history-count'>{history.length} trades</span>
                        )}
                    </div>

                    {history.length === 0 ? (
                        <div className='dtrader__history-empty'>
                            <span>📋</span>
                            <p>No trades yet. Place your first trade on the left.</p>
                        </div>
                    ) : (
                        <div className='dtrader__history-list'>
                            {history.map(t => (
                                <div
                                    key={t.id}
                                    className={`dtrader__hist-row ${t.status === 'won' ? 'dtrader__hist-row--win' : 'dtrader__hist-row--loss'}`}
                                >
                                    <span className='dtrader__hist-time'>{t.time}</span>
                                    <span className='dtrader__hist-symbol'>{t.symbol}</span>
                                    <span className='dtrader__hist-side'>{t.side}</span>
                                    <span className='dtrader__hist-stake'>${t.stake.toFixed(2)}</span>
                                    <span className={`dtrader__hist-pnl ${t.profit >= 0 ? 'dtrader__hist-pnl--win' : 'dtrader__hist-pnl--loss'}`}>
                                        {t.profit >= 0 ? '+' : ''}{t.profit.toFixed(2)}
                                    </span>
                                    <span className={`dtrader__hist-badge ${t.status === 'won' ? 'dtrader__hist-badge--win' : 'dtrader__hist-badge--loss'}`}>
                                        {t.status.toUpperCase()}
                                    </span>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default DTrader;
