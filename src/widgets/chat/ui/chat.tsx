'use client'

import { useEffect, useRef, useState, useCallback } from 'react'
import { handleSubmitMessage } from '../lib/handlers'
import { getWsChat } from '../api/getWsChat'
import styles from './styles.module.scss'

interface IChat {
    streamId: string
    userData: any
}

interface ChatMessage {
    senderUsername: string
    message: string
    type?: string
}

export const Chat: React.FC<IChat> = ({streamId, userData}) => {
    const messageRef = useRef<string>('')
    const webSocketRef = useRef<WebSocket | null>(null)
    const [messages, setMessages] = useState<ChatMessage[]>([])
    const messagesEndRef = useRef<HTMLDivElement>(null)
    const [isConnected, setIsConnected] = useState(false)

    // Обработчик входящих сообщений
    const handleIncomingMessage = useCallback((event: MessageEvent) => {
        try {
            const data = JSON.parse(event.data)
            console.log('📨 Получено сообщение от сервера:', data)
            
            if (data.type === "chatMessage") {
                setMessages(prev => {
                    const newMessages = [...prev, {
                        senderUsername: data.senderUsername,
                        message: data.message
                    }]
                    console.log('📝 Обновленные сообщения:', newMessages)
                    return newMessages
                })
            }
        } catch (error) {
            console.error('❌ Ошибка при обработке сообщения:', error)
        }
    }, [])

    // Подключение к WebSocket
    useEffect(() => {
        let ws: WebSocket | null = null
        
        const connectWebSocket = async () => {
            try {
                ws = await getWsChat(streamId, userData?.username || 'anonymous')
                webSocketRef.current = ws
                
                // Устанавливаем обработчик сообщений
                ws.onmessage = handleIncomingMessage
                
                ws.onclose = () => {
                    console.log('🔌 WebSocket закрыт')
                    setIsConnected(false)
                }
                
                ws.onerror = (error) => {
                    console.error('❌ WebSocket ошибка:', error)
                    setIsConnected(false)
                }
                
                setIsConnected(true)
                console.log('✅ WebSocket готов к приему сообщений')
                
            } catch (error) {
                console.error('❌ Ошибка подключения к WebSocket:', error)
                setIsConnected(false)
            }
        }
        
        connectWebSocket()

        // Очистка при размонтировании
        return () => {
            if (ws && ws.readyState === WebSocket.OPEN) {
                ws.close()
            }
        }
    }, [streamId, userData?.username, handleIncomingMessage])

    // Автоскролл к последнему сообщению
    useEffect(() => {
        if (messagesEndRef.current) {
            messagesEndRef.current.scrollIntoView({ behavior: 'smooth' })
        }
    }, [messages])

    // Для отладки
    useEffect(() => {
        console.log('📊 Текущие сообщения в состоянии:', messages)
    }, [messages])

    return (
        <div className={styles.chatCard}>
            <div className={styles.chatHeader}>
                <div className={styles.chatTitle}>Чат стрима</div>
                <div className={styles.chatBadge}>
                    {isConnected ? 'Live' : '🔄 Подключение...'}
                </div>
            </div>
            
            <ul className={styles.chatMessages}>
                {messages.length === 0 ? (
                    <li className={styles.messageItem}>
                        <span className={styles.messageContent} style={{ color: '#999' }}>
                            {isConnected ? '💬 Нет сообщений' : '🔄 Подключение к чату...'}
                        </span>
                    </li>
                ) : (
                    messages.map((msg, index) => (
                        <li key={index} className={styles.messageItem}>
                            <span className={styles.messageSender}>{msg.senderUsername}:</span>
                            <span className={styles.messageContent}>{msg.message}</span>
                        </li>
                    ))
                )}
                <div ref={messagesEndRef} />
            </ul>
            
            {userData && Object.keys(userData).length > 0 ? 
                <div className={styles.inputArea}>
                    <input 
                        className={styles.messageInput} 
                        type="text" 
                        placeholder="Введите сообщение..."
                        disabled={!isConnected}
                        onKeyPress={(e) => {
                            if (e.key === 'Enter' && isConnected) {
                                handleSubmitMessage(webSocketRef, messageRef, streamId, userData.username)
                                // Очищаем поле ввода после отправки
                                e.currentTarget.value = ''
                                messageRef.current = ''
                            }
                        }}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => { 
                            messageRef.current = e.target.value 
                        }}
                    />
                    <button 
                        className={styles.sendButton} 
                        disabled={!isConnected}
                        onClick={() => {
                            if (isConnected) {
                                handleSubmitMessage(webSocketRef, messageRef, streamId, userData.username)
                                // Очищаем поле ввода после отправки
                                const input = document.querySelector(`.${styles.messageInput}`) as HTMLInputElement
                                if (input) {
                                    input.value = ''
                                    messageRef.current = ''
                                }
                            }
                        }}
                    >
                        {isConnected ? 'Отправить' : 'Подключение...'}
                    </button>
                </div>
            :
                <div className={styles.loginPrompt}>
                    <span>🔒 Войдите в аккаунт, чтобы отправлять сообщения</span>
                </div>                
            }
        </div>
    )
}