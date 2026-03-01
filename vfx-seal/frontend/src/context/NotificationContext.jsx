import { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { io } from 'socket.io-client';
import api from '../api/client';
import { useAuth } from './AuthContext';

const NotificationContext = createContext(null);

export function NotificationProvider({ children }) {
    const { token, isLoggedIn } = useAuth();
    const [notifications, setNotifications] = useState([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const socketRef = useRef(null);

    // Fetch notifications from server
    const fetchNotifications = useCallback(async () => {
        if (!isLoggedIn) return;
        try {
            const { data } = await api.get('/notifications');
            setNotifications(data.notifications);
            setUnreadCount(data.unreadCount);
        } catch (err) {
            console.error('Fetch notifications error:', err);
        }
    }, [isLoggedIn]);

    // Connect socket when logged in
    useEffect(() => {
        if (!isLoggedIn || !token) {
            if (socketRef.current) {
                socketRef.current.disconnect();
                socketRef.current = null;
            }
            setNotifications([]);
            setUnreadCount(0);
            return;
        }

        fetchNotifications();

        // Connect Socket.io with auth token
        const socket = io('/', {
            auth: { token },
            transports: ['websocket', 'polling'],
        });

        socket.on('connect', () => {
            console.log('🔌 Socket connected');
        });

        socket.on('notification', (notification) => {
            setNotifications(prev => [notification, ...prev]);
            setUnreadCount(prev => prev + 1);
        });

        socket.on('connect_error', (err) => {
            console.error('Socket connection error:', err.message);
        });

        socketRef.current = socket;

        return () => {
            socket.disconnect();
        };
    }, [isLoggedIn, token, fetchNotifications]);

    const markAllRead = async () => {
        try {
            await api.patch('/notifications/read-all');
            setNotifications(prev => prev.map(n => ({ ...n, read: true })));
            setUnreadCount(0);
        } catch (err) {
            console.error('Mark all read error:', err);
        }
    };

    const markRead = async (id) => {
        try {
            await api.patch(`/notifications/${id}/read`);
            setNotifications(prev => prev.map(n =>
                n._id === id ? { ...n, read: true } : n
            ));
            setUnreadCount(prev => Math.max(0, prev - 1));
        } catch (err) {
            console.error('Mark read error:', err);
        }
    };

    return (
        <NotificationContext.Provider value={{
            notifications, unreadCount,
            fetchNotifications, markAllRead, markRead,
        }}>
            {children}
        </NotificationContext.Provider>
    );
}

export const useNotifications = () => {
    const ctx = useContext(NotificationContext);
    if (!ctx) throw new Error('useNotifications must be used within NotificationProvider');
    return ctx;
};
