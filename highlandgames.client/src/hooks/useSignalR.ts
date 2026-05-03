import { useEffect, useRef } from 'react';
import * as signalR from '@microsoft/signalr';

export function useSignalR() {
    const connectionRef = useRef<signalR.HubConnection | null>(null);
    const readyRef = useRef(false);
    const pendingGroups = useRef<Array<{ method: string; args: string[] }>>([]);

    useEffect(() => {
        const connection = new signalR.HubConnectionBuilder()
            .withUrl('/hubs/results')
            .withAutomaticReconnect()
            .build();

        connection.start()
            .then(() => {
                readyRef.current = true;
                // Flush any pending group joins
                pendingGroups.current.forEach(({ method, args }) => {
                    connection.invoke(method, ...args).catch(console.error);
                });
                pendingGroups.current = [];
            })
            .catch(err => console.error('SignalR connection error:', err));

        connectionRef.current = connection;

        return () => {
            connection.stop();
        };
    }, []);

    const on = (event: string, callback: (...args: unknown[]) => void) => {
        connectionRef.current?.on(event, callback);
    };

    const off = (event: string) => {
        connectionRef.current?.off(event);
    };

    const joinGroup = (method: string, ...args: string[]) => {
        if (readyRef.current && connectionRef.current) {
            connectionRef.current.invoke(method, ...args).catch(console.error);
        } else {
            pendingGroups.current.push({ method, args });
        }
    };

    return { on, off, joinGroup };
}