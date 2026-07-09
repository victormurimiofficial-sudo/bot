import './chunk-loader.scss';

export default function ChunkLoader({ message }: { message: string }) {
    return (
        <div className='app-root'>
            <div className='v-loader'>
                <div className='v-loader__ring' />
                <span className='v-loader__letter'>V</span>
            </div>
            <div className='load-message'>{message}</div>
        </div>
    );
}
