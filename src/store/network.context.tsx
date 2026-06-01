import { useNetworkSync } from '@/hooks/useNetworkSync';
import React, { createContext, useContext } from 'react';

interface NetworkContextType {
    isOnline: boolean;
}

const NetworkContext = createContext<NetworkContextType>({ isOnline: true });

export function NetworkProvider({ children }: { children: React.ReactNode }) {
    const { isOnline } = useNetworkSync();
    return (
        <NetworkContext.Provider value={{ isOnline }}>
            {children}
        </NetworkContext.Provider>
    );
}

export function useNetwork() {
    return useContext(NetworkContext);
}
