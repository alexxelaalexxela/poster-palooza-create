import { useEffect, useState } from 'react';
import FingerprintJS from '@fingerprintjs/fingerprintjs';

export function useFingerprint() {
    const [visitorId, setVisitorId] = useState<string | null>(null);

    useEffect(() => {
        (async () => {
            // charge la librairie et calcule l’empreinte
            const fp = await FingerprintJS.load();
            const result = await fp.get();
            setVisitorId(result.visitorId);
        })();
    }, []);

    return visitorId;
}