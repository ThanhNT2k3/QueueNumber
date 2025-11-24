import React from 'react';
import { Outlet } from 'react-router-dom';

export const MinimalLayout: React.FC = () => {
    return (
        <div className="h-screen flex flex-col">
            <main className="flex-1 overflow-hidden relative bg-gray-50">
                <Outlet />
            </main>
        </div>
    );
};
