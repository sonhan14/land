import { useEffect, useState } from 'react';

const useWindowSize = () => {
    const [windowSize, setWindowSize] = useState({ windowWidth: window.innerWidth, windowHeight: window.innerHeight });

    useEffect(() => {
        const handle = () => {
            setWindowSize({ windowWidth: window.innerWidth, windowHeight: window.innerHeight });
        };
        window.addEventListener('resize', handle);

        return () => window.removeEventListener('resize', handle);
    }, []);

    return windowSize;
};

export default useWindowSize;
