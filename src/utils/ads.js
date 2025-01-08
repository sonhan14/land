import { useEffect } from 'react';

const Ads = () => {
    useEffect(() => {
        const script = document.createElement('script');
        script.src = 'https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-5372862349743986';
        script.crossOrigin = 'anonymous';
        script.async = true;

        document.body.appendChild(script);

        try {
            (window.adsbygoogle = window.adsbygoogle || []).push({});
        } catch (e) {
            console.error('AdSense error', e);
        }
    }, []);

    return (
        <div
            style={{
                position: 'absolute',
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
                zIndex: 1000,
                backgroundColor: 'white',
                padding: '10px',
                border: '1px solid #ccc',
                borderRadius: '8px',
                boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
            }}
        >
            <ins
                className="adsbygoogle"
                style={{ display: 'inline-block', width: '300px', height: '250px' }}
                data-ad-client="ca-pub-5372862349743986"
                data-ad-slot="1015933341"
            ></ins>
        </div>
    );
};

export default Ads;
