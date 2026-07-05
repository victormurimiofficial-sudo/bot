import { useEffect, useRef, useState } from 'react';
import { DEFAULT_APP_ID, getSocketURL } from '@/components/shared/utils/config/config';
import Button from '@/components/shared_ui/button';
import { getInitialLanguage, Localize, useTranslations } from '@deriv-com/translations';
import './token-modal.scss';

type TTokenModalProps = {
    is_open: boolean;
    onClose: () => void;
};

type TAuthStatus = 'idle' | 'authorizing' | 'success' | 'error';

const TokenModal = ({ is_open, onClose }: TTokenModalProps) => {
    const { localize } = useTranslations();
    const [token, setToken] = useState('');
    const [status, setStatus] = useState<TAuthStatus>('idle');
    const [message, setMessage] = useState('');
    const socket_ref = useRef<WebSocket | null>(null);
    const input_ref = useRef<HTMLInputElement | null>(null);

    useEffect(() => {
        if (is_open) {
            setToken('');
            setStatus('idle');
            setMessage('');
            // Focus the input shortly after opening.
            const timer = setTimeout(() => input_ref.current?.focus(), 50);
            return () => clearTimeout(timer);
        }
    }, [is_open]);

    // Clean up any open socket when the modal unmounts or closes.
    useEffect(() => {
        return () => {
            socket_ref.current?.close();
            socket_ref.current = null;
        };
    }, []);

    if (!is_open) return null;

    const authorizeToken = () => {
        const trimmed_token = token.trim();
        if (!trimmed_token) {
            setStatus('error');
            setMessage(localize('Please paste a valid Deriv API token.'));
            return;
        }

        setStatus('authorizing');
        setMessage('');

        // Always use the global default application ID (129344) for this connection.
        const server_url = getSocketURL();
        const language = getInitialLanguage();
        const socket_url = `wss://${server_url}/websockets/v3?app_id=${DEFAULT_APP_ID}&l=${language}`;

        try {
            socket_ref.current?.close();
            const ws = new WebSocket(socket_url);
            socket_ref.current = ws;

            ws.onopen = () => {
                ws.send(JSON.stringify({ authorize: trimmed_token }));
            };

            ws.onmessage = msg => {
                try {
                    const response = JSON.parse(msg.data);
                    if (response.error) {
                        setStatus('error');
                        setMessage(response.error.message || localize('Authorization failed. Please try again.'));
                        ws.close();
                        return;
                    }
                    if (response.msg_type === 'authorize' && response.authorize) {
                        // Persist the authorized token securely for the session.
                        localStorage.setItem('authToken', trimmed_token);
                        localStorage.setItem('active_loginid', response.authorize.loginid);
                        setStatus('success');
                        setMessage(
                            localize('Authorized as {{loginid}}.', {
                                loginid: response.authorize.loginid,
                            })
                        );
                        ws.close();
                    }
                } catch (e) {
                    setStatus('error');
                    setMessage(localize('Unexpected response from server.'));
                    ws.close();
                }
            };

            ws.onerror = () => {
                setStatus('error');
                setMessage(localize('Connection error. Please check your network and try again.'));
            };
        } catch (e) {
            setStatus('error');
            setMessage(localize('Unable to establish a connection.'));
        }
    };

    const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
        if (event.key === 'Enter' && !event.nativeEvent.isComposing && event.keyCode !== 229) {
            authorizeToken();
        }
    };

    return (
        <div
            className='token-modal__overlay'
            role='presentation'
            onClick={e => {
                if (e.target === e.currentTarget) onClose();
            }}
        >
            <div className='token-modal' role='dialog' aria-modal='true' aria-labelledby='token-modal-title'>
                <div className='token-modal__header'>
                    <h2 id='token-modal-title' className='token-modal__title'>
                        <Localize i18n_default_text='Connect with API Token' />
                    </h2>
                    <button
                        className='token-modal__close'
                        aria-label={localize('Close')}
                        onClick={onClose}
                        type='button'
                    >
                        &times;
                    </button>
                </div>

                <div className='token-modal__body'>
                    <p className='token-modal__description'>
                        <Localize i18n_default_text='Paste your Deriv API token below to authorize securely.' />
                    </p>
                    <input
                        ref={input_ref}
                        className='token-modal__input'
                        type='password'
                        placeholder={localize('Paste your API token')}
                        value={token}
                        onChange={e => setToken(e.target.value)}
                        onKeyDown={handleKeyDown}
                        autoComplete='off'
                        spellCheck={false}
                    />
                    {message && (
                        <p
                            className={`token-modal__message token-modal__message--${
                                status === 'success' ? 'success' : 'error'
                            }`}
                        >
                            {message}
                        </p>
                    )}
                </div>

                <div className='token-modal__footer'>
                    <Button secondary onClick={onClose} type='button'>
                        <Localize i18n_default_text='Cancel' />
                    </Button>
                    <Button
                        primary
                        onClick={authorizeToken}
                        type='button'
                        is_loading={status === 'authorizing'}
                        disabled={status === 'authorizing'}
                    >
                        <Localize i18n_default_text='Authorize' />
                    </Button>
                </div>
            </div>
        </div>
    );
};

export default TokenModal;
