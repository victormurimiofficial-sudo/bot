import React, { useCallback, useEffect, useRef, useState } from 'react';
import './smart-reader.scss';

const SYMBOLS = [
    { name: 'Volatility 10 Index', symbol: 'R_10' },
    { name: 'Volatility 25 Index', symbol: 'R_25' },
    { name: 'Volatility 50 Index', symbol: 'R_50' },
    { name: 'Volatility 75 Index', symbol: 'R_75' },
    { name: 'Volatility 100 Index', symbol: 'R_100' },
    { name: 'Volatility 10 (1s)', symbol: '1HZ10V' },
    { name: 'Volatility 25 (1s)', symbol: '1HZ25V' },
    { name: 'Volatility 50 (1s)', symbol: '1HZ50V' },
    { name: 'Volatility 75 (1s)', symbol: '1HZ75V' },
    { name: 'Volatility 100 (1s)', symbol: '1HZ100V' },
    { name: 'Boom 500 Index', symbol: 'BOOM500' },
    { name: 'Boom 1000 Index', symbol: 'BOOM1000' },
    { name: 'Crash 500 Index', symbol: 'CRASH500' },
    { name: 'Crash 1000 Index', symbol: 'CRASH1000' },
    { name: 'Step Index', symbol: 'STPIDX' },
];

type Tick = { quote: number; epoch: number; last_digit: number };

const APP_ID = 1089;
const WS_URL = `wss://ws.derivws.com/websockets/v3?app_id=${APP_ID}`;

const getLastDigit = (price: number): number => {
    const s = price.toFixed(2);
    return parseInt(s[s.length - 1], 10);
};

const analyzeDigits = (digits: number[]) => {
    if (digits.length === 0) return { over5: 0, under5: 0, even: 0, odd: 0, digitCount: Array(10).fill(0) };
    const digitCount = Array(10).fill(0);
    digits.forEach(d => digitCount[d]++);
    const over5 = digits.filter(d => d > 5).length;
    const under5 = digits.filter(d => d < 5).length;
    const even = digits.filter(d => d % 2 === 0).length;
    const odd = digits.filter(d => d % 2 !== 0).length;
    return { over5, under5, even, odd, digitCount };
};

const SmartReader: React.FC = () => {
    const [selectedSymbol, setSelectedSymbol] = useState(SYMBOLS[2]); // V50 default
    const [ticks, setTicks] = useState<Tick[]>([]);
    const [connected, setConnected] = useState(false);
    const [livePrice, setLivePrice] = useState<number | null>(null);
    const [sampleSize, setSampleSize] = useState(50);
    const ws = useRef<WebSocket | null>(null);
    const subscriptionId = useRef<string | null>(null);

    const connect = useCallback(() => {
        if (ws.current) {
            ws.current.close();
        }
        setTicks([]);
        setLivePrice(null);

        const socket = new WebSocket(WS_URL);
        ws.current = socket;

        socket.onopen = () => {
            setConnected(true);
            socket.send(JSON.stringify({
                ticks: selectedSymbol.symbol,
                subscribe: 1,
            }));
        };

        socket.onmessage = (event) => {
            const data = JSON.parse(event.data);
            if (data.msg_type === 'tick' && data.tick) {
                const tick = data.tick;
                subscriptionId.current = tick.id ?? subscriptionId.current;
                const ld = getLastDigit(tick.quote);
                setLivePrice(tick.quote);
                setTicks(prev => {
                    const next = [...prev, { quote: tick.quote, epoch: tick.epoch, last_digit: ld }];
                    return next.slice(-200); // keep last 200
                });
            }
        };

        socket.onclose = () => setConnected(false);
        socket.onerror = () => setConnected(false);
    }, [selectedSymbol]);

    useEffect(() => {
        connect();
        return () => {
            ws.current?.close();
        };
    }, [connect]);

    const recentTicks = ticks.slice(-sampleSize);
    const digits = recentTicks.map(t => t.last_digit);
    const { over5, under5, even, odd, digitCount } = analyzeDigits(digits);
    const total = digits.length;

    const overPct = total ? Math.round((over5 / total) * 100) : 0;
    const underPct = total ? Math.round((under5 / total) * 100) : 0;
    const evenPct = total ? Math.round((even / total) * 100) : 0;
    const oddPct = total ? Math.round((odd / total) * 100) : 0;

    const signal = overPct > underPct ? 'OVER' : underPct > overPct ? 'UNDER' : 'NEUTRAL';
    const signalConf = Math.abs(overPct - underPct);
    const eoSignal = evenPct > oddPct ? 'EVEN' : oddPct > evenPct ? 'ODD' : 'NEUTRAL';

    const maxDigitCount = Math.max(...digitCount, 1);
    const lastDigit = digits[digits.length - 1];

    return (
        <div className='smart-reader'>
            {/* Header */}
            <div className='smart-reader__header'>
                <div className='smart-reader__title'>
                    <span className='smart-reader__icon'>🔭</span>
                    <h2>Smart Reader</h2>
                    <span className={`smart-reader__status ${connected ? 'smart-reader__status--live' : ''}`}>
                        {connected ? '● LIVE' : '○ Connecting…'}
                    </span>
                </div>
                <div className='smart-reader__controls'>
                    <select
                        className='smart-reader__select'
                        value={selectedSymbol.symbol}
                        onChange={e => {
                            const sym = SYMBOLS.find(s => s.symbol === e.target.value);
                            if (sym) setSelectedSymbol(sym);
                        }}
                    >
                        {SYMBOLS.map(s => (
                            <option key={s.symbol} value={s.symbol}>{s.name}</option>
                        ))}
                    </select>
                    <select
                        className='smart-reader__select'
                        value={sampleSize}
                        onChange={e => setSampleSize(Number(e.target.value))}
                    >
                        {[20, 50, 100, 200].map(n => (
                            <option key={n} value={n}>Last {n} ticks</option>
                        ))}
                    </select>
                </div>
            </div>

            {/* Live Price */}
            <div className='smart-reader__price-bar'>
                <div className='smart-reader__price'>
                    <span className='smart-reader__price-label'>LIVE PRICE</span>
                    <span className='smart-reader__price-val'>{livePrice?.toFixed(2) ?? '—'}</span>
                </div>
                <div className='smart-reader__price'>
                    <span className='smart-reader__price-label'>LAST DIGIT</span>
                    <span className='smart-reader__price-val smart-reader__price-val--digit'>{lastDigit ?? '—'}</span>
                </div>
                <div className='smart-reader__price'>
                    <span className='smart-reader__price-label'>TICKS LOADED</span>
                    <span className='smart-reader__price-val'>{total} / {sampleSize}</span>
                </div>
                <div className='smart-reader__price'>
                    <span className='smart-reader__price-label'>MARKET</span>
                    <span className='smart-reader__price-val smart-reader__price-val--sm'>{selectedSymbol.name}</span>
                </div>
            </div>

            <div className='smart-reader__body'>
                {/* Signals */}
                <div className='smart-reader__signals'>
                    <h3 className='smart-reader__section-title'>📡 Signals</h3>

                    {/* Over/Under */}
                    <div className='smart-reader__signal-card'>
                        <div className='smart-reader__signal-label'>OVER / UNDER</div>
                        <div className='smart-reader__signal-bars'>
                            <div className='smart-reader__signal-bar-wrap'>
                                <span>OVER &gt;5</span>
                                <div className='smart-reader__bar'>
                                    <div className='smart-reader__bar-fill smart-reader__bar-fill--over' style={{ width: `${overPct}%` }} />
                                </div>
                                <span className='smart-reader__bar-pct'>{overPct}%</span>
                            </div>
                            <div className='smart-reader__signal-bar-wrap'>
                                <span>UNDER &lt;5</span>
                                <div className='smart-reader__bar'>
                                    <div className='smart-reader__bar-fill smart-reader__bar-fill--under' style={{ width: `${underPct}%` }} />
                                </div>
                                <span className='smart-reader__bar-pct'>{underPct}%</span>
                            </div>
                        </div>
                        <div className={`smart-reader__recommendation ${signal === 'OVER' ? 'smart-reader__recommendation--over' : signal === 'UNDER' ? 'smart-reader__recommendation--under' : ''}`}>
                            {signal === 'NEUTRAL' ? '⟺ NEUTRAL' : signal === 'OVER' ? `▲ BUY OVER (${signalConf}% edge)` : `▼ BUY UNDER (${signalConf}% edge)`}
                        </div>
                    </div>

                    {/* Even/Odd */}
                    <div className='smart-reader__signal-card'>
                        <div className='smart-reader__signal-label'>EVEN / ODD</div>
                        <div className='smart-reader__signal-bars'>
                            <div className='smart-reader__signal-bar-wrap'>
                                <span>EVEN</span>
                                <div className='smart-reader__bar'>
                                    <div className='smart-reader__bar-fill smart-reader__bar-fill--even' style={{ width: `${evenPct}%` }} />
                                </div>
                                <span className='smart-reader__bar-pct'>{evenPct}%</span>
                            </div>
                            <div className='smart-reader__signal-bar-wrap'>
                                <span>ODD</span>
                                <div className='smart-reader__bar'>
                                    <div className='smart-reader__bar-fill smart-reader__bar-fill--odd' style={{ width: `${oddPct}%` }} />
                                </div>
                                <span className='smart-reader__bar-pct'>{oddPct}%</span>
                            </div>
                        </div>
                        <div className={`smart-reader__recommendation ${eoSignal === 'EVEN' ? 'smart-reader__recommendation--over' : eoSignal === 'ODD' ? 'smart-reader__recommendation--under' : ''}`}>
                            {eoSignal === 'NEUTRAL' ? '⟺ NEUTRAL' : eoSignal === 'EVEN' ? '▲ BUY EVEN' : '▼ BUY ODD'}
                        </div>
                    </div>

                    {/* Digit Frequency */}
                    <div className='smart-reader__signal-card'>
                        <div className='smart-reader__signal-label'>DIGIT FREQUENCY (0–9)</div>
                        <div className='smart-reader__digit-bars'>
                            {digitCount.map((count, digit) => (
                                <div key={digit} className='smart-reader__digit-col'>
                                    <div className='smart-reader__digit-bar-track'>
                                        <div
                                            className={`smart-reader__digit-bar-fill ${digit === lastDigit ? 'smart-reader__digit-bar-fill--active' : ''}`}
                                            style={{ height: `${(count / maxDigitCount) * 100}%` }}
                                        />
                                    </div>
                                    <span className={`smart-reader__digit-num ${digit === lastDigit ? 'smart-reader__digit-num--active' : ''}`}>{digit}</span>
                                    <span className='smart-reader__digit-count'>{count}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Live Tick Stream */}
                <div className='smart-reader__stream'>
                    <h3 className='smart-reader__section-title'>📟 Live Tick Stream</h3>
                    <div className='smart-reader__tick-list'>
                        {[...recentTicks].reverse().slice(0, 40).map((tick, i) => (
                            <div key={tick.epoch + '-' + i} className={`smart-reader__tick-row ${i === 0 ? 'smart-reader__tick-row--latest' : ''}`}>
                                <span className='smart-reader__tick-price'>{tick.quote.toFixed(2)}</span>
                                <span className={`smart-reader__tick-digit ${tick.last_digit > 5 ? 'smart-reader__tick-digit--over' : tick.last_digit < 5 ? 'smart-reader__tick-digit--under' : 'smart-reader__tick-digit--five'}`}>
                                    {tick.last_digit}
                                </span>
                                <span className='smart-reader__tick-eo'>{tick.last_digit % 2 === 0 ? 'E' : 'O'}</span>
                            </div>
                        ))}
                        {total === 0 && (
                            <div className='smart-reader__tick-empty'>Waiting for ticks…</div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SmartReader;
