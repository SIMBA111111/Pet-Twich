'use client'

import { RefObject, useEffect, useRef } from 'react'
import { getCookie } from 'cookies-next';

import { handleSubmitMessage } from '../lib/handlers'

import { getWsChat } from '../api/getWsChat'

import styles from './styles.module.scss'


interface IChat {
    streamId: string
    userData: any
}

export const Chat: React.FC<IChat> = ({streamId, userData}) => {
    const messageRef = useRef<string>('')
    const webSocketRef = useRef<WebSocket | null>(null)


    useEffect(() => {
        const getWs = async () => {
            const ws = await getWsChat(streamId)
            webSocketRef.current = ws
        }
                
        getWs()
    }, [])

    console.log('userData = ', userData);
    
    
    return (
        <div className={styles.chatContainer}>
            <ul id='chat' className={styles.chat}>
                <li className={styles.chatMessage}>первое сообщение</li>
            </ul>
            {userData ? 
                <div className={styles.inputContainer}>
                    <input className={styles.messageInput} type="text" onChange={(e: React.ChangeEvent<HTMLInputElement>) => { messageRef.current = e.target.value }}/>
                    <button className={styles.sendButton} onClick={() => handleSubmitMessage(webSocketRef, messageRef, streamId, userData.username)}>Отправить сообщение</button>
                </div>
            :
                <div className={styles.loginPrompt}>Войдите в аккаунт, чтобы отправлять сообщения</div>                
            }
        </div>
    )
}