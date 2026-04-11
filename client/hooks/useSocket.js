import { useEffect, useRef, useState } from 'react';
import { io } from 'socket.io-client';
import { useAuth } from '../src/context/AuthContext';

const SOCKET_URL = 'http://localhost:5000';

export const useSocket = () => {
    const { user } = useAuth();
    const socketRef = useRef(null);
    const [onlineUsers, setOnlineUsers] = useState([]);
    const [isConnected, setIsConnected] = useState(false);

    useEffect(() => {
        if (!user) return;

        // Socket connect karo — cookie automatically jayegi
        socketRef.current = io(SOCKET_URL, {
            withCredentials: true,
        });

        const socket = socketRef.current;

        socket.on('connect', () => {
            console.log('Socket connected:', socket.id);
            setIsConnected(true);
        });

        socket.on('disconnect', () => {
            console.log('Socket disconnected');
            setIsConnected(false);
        });

        // Kaun kaun online hai
        socket.on('onlineUsers', (users) => {
            setOnlineUsers(users);
        });

        socket.on('userOnline', ({ userId }) => {
            setOnlineUsers((prev) => [...new Set([...prev, userId])]);
        });

        socket.on('userOffline', ({ userId }) => {
            setOnlineUsers((prev) => prev.filter((id) => id !== userId));
        });

        // Cleanup — component unmount pe disconnect
        return () => {
            socket.disconnect();
        };
    }, [user]);

    return {
        socket: socketRef.current,
        onlineUsers,
        isConnected,
    };
};