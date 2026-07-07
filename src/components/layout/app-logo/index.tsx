import { useCallback, useEffect, useRef, useState } from 'react';
import { standalone_routes } from '@/components/shared';
import { useDevice } from '@deriv-com/ui';
import './app-logo.scss';

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
                        <a
                            className='vfx-wa'
                            href='https://wa.me/254700000000'
                            target='_blank'
                            rel='noopener noreferrer'
                            onClick={e => e.stopPropagation()}
                        >
                            <span className='vfx-social-icon'>💬</span>
                            WhatsApp
                        </a>
                        <a
                            className='vfx-tt'
                            href='https://tiktok.com/@veneefx'
                            target='_blank'
                            rel='noopener noreferrer'
                            onClick={e => e.stopPropagation()}
                        >
                            <span className='vfx-social-icon'>🎵</span>
                            TikTok
                        </a>
                    </div>
                )}
            </div>
        </a>
    );
};
