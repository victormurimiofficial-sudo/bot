import React, { useState } from 'react';
import './dtrader.scss';

const DERIV_DTRADER_URL = 'https://app.deriv.com/dtrader';

const DTrader: React.FC = () => {
    const [iframe_error, setIframeError] = useState(false);
    const [loading, setLoading] = useState(true);

    return (
        <div className='dtrader-embed'>
            {loading && !iframe_error && (
                <div className='dtrader-embed__loader'>
                    <div className='dtrader-embed__spinner' />
                    <p>Loading Deriv DTrader…</p>
                </div>
            )}
            {!iframe_error ? (
                <iframe
                    className='dtrader-embed__iframe'
                    src={DERIV_DTRADER_URL}
                    title='Deriv DTrader'
                    allow='clipboard-read; clipboard-write; storage-access'
                    onLoad={() => setLoading(false)}
                    onError={() => {
                        setLoading(false);
                        setIframeError(true);
                    }}
                />
            ) : (
                <div className='dtrader-embed__blocked'>
                    <div className='dtrader-embed__blocked-icon'>📊</div>
                    <h2>DTrader cannot be embedded</h2>
                    <p>Deriv prevents third-party embedding for security. Open it directly:</p>
                    <a
                        href={DERIV_DTRADER_URL}
                        target='_blank'
                        rel='noopener noreferrer'
                        className='dtrader-embed__open-btn'
                    >
                        Open Deriv DTrader ↗
                    </a>
                </div>
            )}
        </div>
    );
};

export default DTrader;
