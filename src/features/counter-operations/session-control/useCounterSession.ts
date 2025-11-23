import { useState, useEffect } from 'react';
import { useQMS } from '../../../stores/QMSContext';
import { useAuth } from '../../../stores/AuthContext';
import { Counter } from '../../../types/types';

export const useCounterSession = () => {
    const { counters, toggleCounterStatus } = useQMS();
    const { user, assignCounter } = useAuth();
    const [selectedCounterId, setSelectedCounterId] = useState<string>('');

    useEffect(() => {
        if (user?.assignedCounterId) {
            setSelectedCounterId(user.assignedCounterId);
        } else if (counters.length > 0 && !selectedCounterId) {
            setSelectedCounterId(counters[0].id);
        }
    }, [counters, selectedCounterId, user]);

    const myCounter = counters.find(c => c.id === selectedCounterId) || counters[0];

    const handleCounterSelect = async (counterId: string) => {
        // Call backend API to assign counter and create audit log
        const success = await assignCounter(counterId, 'Teller switched counter');
        if (success) {
            setSelectedCounterId(counterId);
        } else {
            console.error('Failed to switch counter');
        }
    };

    const handleToggleStatus = () => {
        if (myCounter?.id) {
            toggleCounterStatus(myCounter.id);
        }
    };

    return {
        myCounter,
        counters,
        user,
        selectedCounterId,
        handleCounterSelect,
        handleToggleStatus,
        isOnline: myCounter?.status === 'ONLINE'
    };
};
