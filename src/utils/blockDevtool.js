import React, { useEffect } from 'react';

const BlockDevTools = () => {
    useEffect(() => {
        const detectDevTools = () => {
            const threshold = 160;
            const widthDifference = window.outerWidth - window.innerWidth;

            if (widthDifference > threshold) {
                new Function(`debugger;`)();
            }

            setTimeout(detectDevTools, 1000);
        };

        detectDevTools();

        return () => {
            clearTimeout();
        };
    }, []);

    return null;
};

export default BlockDevTools;
