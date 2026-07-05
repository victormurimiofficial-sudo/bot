import { standalone_routes } from '@/components/shared';
import { useDevice } from '@deriv-com/ui';
import './app-logo.scss';

export const AppLogo = () => {
    const { isDesktop } = useDevice();

    if (!isDesktop) return null;
    return (
        <a className='app-header__logo' href={standalone_routes.deriv_com} target='_blank' rel='noopener noreferrer'>
            <span className='app-header__brand'>Veneefx</span>
        </a>
    );
};
