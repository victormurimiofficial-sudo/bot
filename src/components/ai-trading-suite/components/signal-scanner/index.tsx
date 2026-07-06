import React from 'react';
import { observer } from 'mobx-react-lite';
import { aiTradingStore } from '../../store/ai-trading-store';
import { TSignal } from '../../store/types';

const SignalBadge: React.FC<{ type: TSignal['type'] }> = ({ type }) => {
    const map = {
        BUY: { label: '▲ BUY', cls: 'ats-sig-badge--buy' },
        SELL: { label: '▼ SELL', cls: 'ats-sig-badge--sell' },
        NEUTRAL: { label: '◆ NEUTRAL', cls: 'ats-sig-badge--neutral' },
    };
    const { label, cls } = map[type];
    return <span className={`ats-sig-badge ${cls}`}>{label}</span>;
};

const StrengthBar: React.FC<{ value: number; type: TSignal['type'] }> = ({ value, type }) => {
    const color = type === 'BUY' ? '#00b894' : type === 'SELL' ? '#e17055' : '#a29bfe';
    return (
        <div className='ats-sig-strength'>
            <div className='ats-sig-strength__fill' style={{ width: `${value}%`, background: color }} />
            <span className='ats-sig-strength__label'>{value}%</span>
        </div>
    );
};

const ExpiryBar: React.FC<{ seconds: number }> = ({ seconds }) => {
    const pct = Math.min(100, (seconds / 120) * 100);
    const color = pct < 25 ? '#e17055' : pct < 50 ? '#fdcb6e' : '#00b894';
    const label =
        seconds <= 0 ? 'Expired' : seconds < 60 ? `${seconds}s` : `${Math.floor(seconds / 60)}m ${seconds % 60}s`;
    return (
        <div className='ats-sig-expiry'>
            <div className='ats-sig-expiry__track'>
                <div className='ats-sig-expiry__fill' style={{ width: `${pct}%`, background: color }} />
            </div>
            <span className='ats-sig-expiry__label' style={{ color }}>
                {label}
            </span>
        </div>
    );
};

const SignalCard: React.FC<{ signal: TSignal }> = observer(({ signal }) => (
    <div className={`ats-sig-card ${signal.triggered ? 'ats-sig-card--triggered' : ''}`}>
        <div className='ats-sig-card__top'>
            <div className='ats-sig-card__market'>
                <span className='ats-sig-card__name'>{signal.market}</span>
                <span className='ats-sig-card__tf'>{signal.timeframe}</span>
            </div>
            <SignalBadge type={signal.type} />
        </div>
        <div className='ats-sig-card__strategy'>{signal.strategy}</div>
        <div className='ats-sig-card__bars'>
            <div className='ats-sig-card__bar-row'>
                <span className='ats-label'>Strength</span>
                <StrengthBar value={signal.strength} type={signal.type} />
            </div>
            <div className='ats-sig-card__bar-row'>
                <span className='ats-label'>Confidence</span>
                <StrengthBar value={signal.confidence} type={signal.type} />
            </div>
        </div>
        <div className='ats-sig-card__footer'>
            <span className='ats-label'>Expires in</span>
            <ExpiryBar seconds={signal.expiresIn} />
        </div>
        {signal.triggered && <div className='ats-sig-card__triggered-badge'>🔴 LIVE</div>}
    </div>
));

const SignalScanner: React.FC = observer(() => {
    const { signals } = aiTradingStore;
    const active = signals.filter(s => s.type !== 'NEUTRAL');
    const buys = signals.filter(s => s.type === 'BUY').length;
    const sells = signals.filter(s => s.type === 'SELL').length;

    return (
        <div className='ats-signal-scanner'>
            <div className='ats-ss__header'>
                <div className='ats-ss__title'>
                    <span className='ats-pulse-dot' />
                    Signal Scanner
                </div>
                <div className='ats-ss__counts'>
                    <span className='ats-ss__count ats-ss__count--buy'>▲ {buys} Buy</span>
                    <span className='ats-ss__count ats-ss__count--sell'>▼ {sells} Sell</span>
                </div>
            </div>

            {/* Summary bar */}
            <div className='ats-ss-summary'>
                <div className='ats-ss-summary__bar'>
                    <div className='ats-ss-summary__buy' style={{ width: `${(buys / signals.length) * 100}%` }} />
                    <div className='ats-ss-summary__sell' style={{ width: `${(sells / signals.length) * 100}%` }} />
                </div>
                <div className='ats-ss-summary__labels'>
                    <span style={{ color: '#00b894' }}>Buy pressure</span>
                    <span style={{ color: '#e17055' }}>Sell pressure</span>
                </div>
            </div>

            <div className='ats-ss__list'>
                {active.length === 0 && <div className='ats-ss__empty'>No active signals — market scanning…</div>}
                {signals.map(sig => (
                    <SignalCard key={sig.id} signal={sig} />
                ))}
            </div>
        </div>
    );
});

export default SignalScanner;
