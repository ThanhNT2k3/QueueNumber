import { useState } from 'react';
import { useQMS } from '../../../stores/QMSContext';
import { Ticket } from '../../../types/types';

export const useCustomerData = (currentTicket: Ticket | undefined) => {
    const { updateRemarks } = useQMS();

    const [customerPhone, setCustomerPhone] = useState('');
    const [customerEmail, setCustomerEmail] = useState('');
    const [customerNote, setCustomerNote] = useState('');
    const [remarkText, setRemarkText] = useState('');

    const handleAddRemark = async (remark?: string) => {
        if (!currentTicket) return;
        const text = remark || remarkText.trim();
        if (!text) return;
        await updateRemarks(currentTicket.id, text);
        setRemarkText('');
    };

    const clearForm = () => {
        setCustomerPhone('');
        setCustomerEmail('');
        setCustomerNote('');
    };

    return {
        customerPhone, setCustomerPhone,
        customerEmail, setCustomerEmail,
        customerNote, setCustomerNote,
        remarkText, setRemarkText,
        handleAddRemark,
        clearForm
    };
};
