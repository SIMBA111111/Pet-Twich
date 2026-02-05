'use client'

import { RefObject, useEffect, useRef } from 'react'

import { handleSubmitMessage } from '../lib/handlers'

import { getWsChat } from '../api/getWsChat'

import styles from './styles.module.scss'


interface IChat {
    streamId: string
}

export const Chat: React.FC<IChat> = ({streamId}) => {
    const messageRef = useRef<string>('')
    const webSocketRef = useRef<WebSocket | null>(null)

    useEffect(() => {
        const getWs = async () => {
            const ws = await getWsChat(streamId)
            webSocketRef.current = ws
        }
        
        getWs()
    }, [])
    
    return (
        <div className={styles.chatContainer}>
            <ul id='chat' className={styles.chat}>
                <li className={styles.chatMessage}>первое сообщение</li>
            </ul>
            <input type="text" onChange={(e: React.ChangeEvent<HTMLInputElement>) => { messageRef.current = e.target.value }}/>
            <button onClick={() => handleSubmitMessage(webSocketRef, messageRef, streamId)}>Отправить сообщение</button>
        </div>
    )
}