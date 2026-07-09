import { useCallback, useEffect, useRef, useState } from 'react';
import { standalone_routes } from '@/components/shared';
import { useDevice } from '@deriv-com/ui';
import './app-logo.scss';

const LINKS = [
    { label: 'WhatsApp', url: 'https://wa.link/0rkrq4', icon: '💬', cls: 'vfx-wa' },
    { label: 'TikTok', url: 'https://www.tiktok.com/@venee_fx?_r=1&_t=ZS-97pP44Daga5', icon: '🎵', cls: 'vfx-tt' },
    { label: 'YouTube', url: 'https://www.youtube.com/@veneefx', icon: '▶️', cls: 'vfx-yt' },
    { label: 'Instagram', url: 'https://www.instagram.com/venee_fx?igsh=eXBjdzh6dXp1Zm96&utm_source=qr', icon: '📸', cls: 'vfx-ig' },
    { label: 'Join Community', url: 'https://veneefx.vercel.app', icon: '🌐', cls: 'vfx-web' },
    { label: 'Create Deriv Account', url: 'https://track.deriv.com/_5W6V5tZmyrdMjdsyM5hasGNd7ZgqdRLk/1/', icon: '📊', cls: 'vfx-deriv' },
    { label: 'Trade Multipliers', url: 'https://track.deriv.com/_Ca_gsAmEH-c9F-13urvbiWNd7ZgqdRLk/1/', icon: '✖️', cls: 'vfx-mul' },
    { label: 'OKX Account', url: 'https://okx.com/join/50840541', icon: '🔶', cls: 'vfx-okx' },
    { label: 'JustMarkets (1:3000)', url: 'https://one.justmarkets.link/a/j2anw0t47z', icon: '📈', cls: 'vfx-jm' },
    { label: 'HFM Account', url: 'https://register.hfm.com/ke/en/new-live-account/?refid=30423585', icon: '🏦', cls: 'vfx-hfm' },
];

export const AppLogo = () => {
    const { isDesktop } = useDevice();
    const [show_social, setShowSocial] = useState(false);
    const btn_ref = useRef<HTMLDivElement>(null);

    const handleOutsideClick = useCallback((e: MouseEvent) => {
        if (btn_ref.current && !btn_ref.current.contains(e.target as Node)) {
            setShowSocial(false);
        }
    }, []);

    useEffect(() => {
        if (show_social) {
            document.addEventListener('mousedown', handleOutsideClick);
        }
        return () => {
            document.removeEventListener('mousedown', handleOutsideClick);
        };
    }, [show_social, handleOutsideClick]);

    const handleSocialToggle = (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setShowSocial(v => !v);
    };

    if (!isDesktop) return null;
    return (
        <a className='app-header__logo' href={standalone_routes.deriv_com} target='_blank' rel='noopener noreferrer'>
            <span className='app-header__brand'>VeneeFX</span>
            <div
                ref={btn_ref}
                className='app-header__social-btn'
                role='button'
                tabIndex={0}
                aria-label='Socials'
                onClick={handleSocialToggle}
            >
                {/* Phone / Contact icon */}
                <svg viewBox='0 0 24 24' xmlns='http://www.w3.org/2000/svg'>
                    <path d='M6.62 10.79a15.05 15.05 0 0 0 6.59 6.59l2.2-2.2a1 1 0 0 1 1.01-.24 11.47 11.47 0 0 0 3.58.57 1 1 0 0 1 1 1V20a1 1 0 0 1-1 1A17 17 0 0 1 3 4a1 1 0 0 1 1-1h3.5a1 1 0 0 1 1 1 11.47 11.47 0 0 0 .57 3.57 1 1 0 0 1-.25 1.02l-2.2 2.2z' />
                </svg>
                {show_social && (
                    <div className='app-header__social-popup'>
                        {LINKS.map(link => (
                            <a
                                key={link.label}
                                className={link.cls}
                                href={link.url}
                                target='_blank'
                                rel='noopener noreferrer'
                                onClick={e => e.stopPropagation()}
                            >
                                <span className='vfx-social-icon'>{link.icon}</span>
                                {link.label}
                            </a>
                        ))}
                    </div>
                )}
            </div>
        </a>
    );
};
