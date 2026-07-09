import React from 'react';
import './dtrader.scss';

const DERIV_DTRADER_URL = 'https://app.deriv.com/dtrader';

const FEATURES = [
    { icon: '📈', title: 'Rise / Fall', desc: 'Predict if the market will rise or fall over a set period.' },
    { icon: '🎯', title: 'Higher / Lower', desc: 'Predict whether price will be higher or lower than a target.' },
    { icon: '🔢', title: 'Digits', desc: 'Trade on the last digit of the market price — Over, Under, Even, Odd, Matches, Differs.' },
    { icon: '⏱️', title: 'Touch / No Touch', desc: 'Win if the market touches (or doesn\'t touch) a barrier before expiry.' },
    { icon: '📊', title: 'Multipliers', desc: 'Amplify your profits while limiting your losses with a fixed multiplier.' },
    { icon: '🌊', title: 'Accumulators', desc: 'Grow your stake with each consecutive tick that stays within a range.' },
];

const DTrader: React.FC = () => {
    return (
        <div className='dtrader-hub'>
            {/* Hero */}
            <div className='dtrader-hub__hero'>
                <div className='dtrader-hub__hero-badge'>Official Deriv Platform</div>
                <h1 className='dtrader-hub__hero-title'>
                    <span className='dtrader-hub__d'>D</span>Trader
                </h1>
                <p className='dtrader-hub__hero-sub'>
                    The official Deriv trading platform for synthetic indices, forex, and more.
                    Trade digits, multipliers, accumulators and all trade types — powered by Deriv.
                </p>
                <a
                    className='dtrader-hub__launch-btn'
                    href={DERIV_DTRADER_URL}
                    target='_blank'
                    rel='noopener noreferrer'
                >
                    <span>Launch DTrader</span>
                    <svg viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='2.5'>
                        <path d='M5 12h14M12 5l7 7-7 7' strokeLinecap='round' strokeLinejoin='round' />
                    </svg>
                </a>
                <p className='dtrader-hub__hero-note'>
                    Opens in a new tab on <strong>app.deriv.com</strong>
                </p>
            </div>

            {/* Feature grid */}
            <div className='dtrader-hub__features'>
                <h2 className='dtrader-hub__features-title'>Available Trade Types</h2>
                <div className='dtrader-hub__feature-grid'>
                    {FEATURES.map(f => (
                        <div key={f.title} className='dtrader-hub__feature-card'>
                            <span className='dtrader-hub__feature-icon'>{f.icon}</span>
                            <h3 className='dtrader-hub__feature-name'>{f.title}</h3>
                            <p className='dtrader-hub__feature-desc'>{f.desc}</p>
                        </div>
                    ))}
                </div>
            </div>

            {/* Quick links */}
            <div className='dtrader-hub__links'>
                <a href='https://app.deriv.com/dtrader' target='_blank' rel='noopener noreferrer' className='dtrader-hub__link'>
                    🖥️ Open DTrader
                </a>
                <a href='https://track.deriv.com/_5W6V5tZmyrdMjdsyM5hasGNd7ZgqdRLk/1/' target='_blank' rel='noopener noreferrer' className='dtrader-hub__link dtrader-hub__link--primary'>
                    🚀 Create Free Deriv Account
                </a>
                <a href='https://track.deriv.com/_Ca_gsAmEH-c9F-13urvbiWNd7ZgqdRLk/1/' target='_blank' rel='noopener noreferrer' className='dtrader-hub__link'>
                    ✖️ Trade Multipliers
                </a>
            </div>
        </div>
    );
};

export default DTrader;
