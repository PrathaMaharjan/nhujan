import React from 'react';
import Vimeo from '@u-wave/react-vimeo';

export default function VimeoPlayer({ videoId }) {
    if (!videoId) return null;

    return (
        <div className="relative w-full aspect-video overflow-hidden rounded-xl bg-slate-900 border border-slate-800">
            <Vimeo
                video={videoId}
                responsive
                autoplay={false}
                loop={true}
                muted={false}
                className="absolute inset-0 w-full h-full"
            />
        </div>
    );
}