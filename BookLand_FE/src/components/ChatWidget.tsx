import React, { useState, useEffect, useRef } from 'react';
import { Send, X, MessageCircle, Minimize2 } from 'lucide-react';
import { useWebSocket } from '../context/WebSocketContext';
import chatService from '../api/chatService';
import type { ChatMessage } from '../types/Chat';
import { getCurrentUserId } from '../utils/auth';
import '../styles/components/chat-widget.css';

const ADMIN_EMAIL = 'admin@gmail.com';

const ChatWidget: React.FC = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [newMessage, setNewMessage] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const { subscribe, isConnected } = useWebSocket();
    const userId = getCurrentUserId();

    // Fetch chat history when widget opens
    useEffect(() => {
        if (isOpen && userId) {
            loadChatHistory();
        }
    }, [isOpen, userId]);

    // WebSocket subscription for real-time messages
    useEffect(() => {
        if (isConnected && userId) {
            const unsubscribe = subscribe('/user/queue/chat', (message) => {
                try {
                    const newMsg: ChatMessage = JSON.parse(message.body);
                    setMessages(prev => [...prev, newMsg]);
                    scrollToBottom();
                } catch (error) {
                    console.error('Failed to parse chat message:', error);
                }
            });
            return () => unsubscribe();
        }
    }, [isConnected, userId]);

    // Auto-scroll to bottom
    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    const loadChatHistory = async () => {
        if (!userId) return;
        setIsLoading(true);
        try {
            // Assuming admin ID is 1
            const response = await chatService.getChatHistory(1);
            if (response.code === 1000) {
                setMessages(response.result || []);
            }
        } catch (error) {
            console.error('Failed to load chat history:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleSendMessage = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newMessage.trim() || !userId) return;

        try {
            const response = await chatService.sendMessage({
                toEmail: ADMIN_EMAIL,
                content: newMessage.trim()
            });

            if (response.code === 1000) {
                setMessages(prev => [...prev, response.result]);
                setNewMessage('');
            }
        } catch (error) {
            console.error('Failed to send message:', error);
        }
    };

    if (!userId) return null;

    return (
        <>
            {/* Chat Button */}
            {!isOpen && (
                <button
                    className="chat-widget-button"
                    onClick={() => setIsOpen(true)}
                    aria-label="Open chat"
                >
                    <MessageCircle size={24} />
                </button>
            )}

            {/* Chat Window */}
            {isOpen && (
                <div className="chat-widget-container">
                    {/* Header */}
                    <div className="chat-widget-header">
                        <div className="chat-widget-header-info">
                            <MessageCircle size={20} />
                            <span>Chat với Admin</span>
                        </div>
                        <div className="chat-widget-header-actions">
                            <button onClick={() => setIsOpen(false)} aria-label="Close chat">
                                <X size={20} />
                            </button>
                        </div>
                    </div>

                    {/* Messages */}
                    <div className="chat-widget-messages">
                        {isLoading ? (
                            <div className="chat-widget-loading">Đang tải...</div>
                        ) : messages.length === 0 ? (
                            <div className="chat-widget-empty">
                                <MessageCircle size={48} />
                                <p>Chưa có tin nhắn nào</p>
                                <p className="chat-widget-empty-subtitle">Gửi tin nhắn để bắt đầu trò chuyện với admin</p>
                            </div>
                        ) : (
                            messages.map((msg) => (
                                <div
                                    key={msg.id}
                                    className={`chat-widget-message ${msg.fromUserId === userId ? 'chat-widget-message-sent' : 'chat-widget-message-received'}`}
                                >
                                    <div className="chat-widget-message-content">
                                        {msg.content}
                                    </div>
                                    <div className="chat-widget-message-time">
                                        {new Date(msg.createdAt).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}
                                    </div>
                                </div>
                            ))
                        )}
                        <div ref={messagesEndRef} />
                    </div>

                    {/* Input */}
                    <form className="chat-widget-input-container" onSubmit={handleSendMessage}>
                        <input
                            type="text"
                            className="chat-widget-input"
                            placeholder="Nhập tin nhắn..."
                            value={newMessage}
                            onChange={(e) => setNewMessage(e.target.value)}
                        />
                        <button
                            type="submit"
                            className="chat-widget-send-button"
                            disabled={!newMessage.trim()}
                            aria-label="Send message"
                        >
                            <Send size={20} />
                        </button>
                    </form>
                </div>
            )}
        </>
    );
};

export default ChatWidget;
