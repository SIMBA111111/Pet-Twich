'use client'

import { useEffect, useRef, useState } from 'react'
import styles from './styles.module.css'
import { Player } from '../../../../Player/src/component'
import { useParams } from 'next/navigation'

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL

export default function WatchPage() {
    const { id } = useParams()
    const [duration, setDuration] = useState<number>(0)
    const [viewersCount, setViewersCount] = useState<number>(0)
    const eventSourceRef = useRef<EventSource | null>(null)
    const webSocketRef = useRef<WebSocket | null>(null)
    const messageRef = useRef<string>('')

    useEffect(() => {
        const es = new EventSource(`http://localhost:8080/api/streams/${id}/time`)
        eventSourceRef.current = es

        es.onmessage = (event) => {
            const data = JSON.parse(event.data)
            if (data.type === 'ffmpeg_time') {
                // console.log('Текущее время стрима:', data.time)
                setDuration(data.time)
            }
        }

        return () => {
            es.close()
        }
    }, [id])

    useEffect(() => {
        fetch(BACKEND_URL + `/api/streams/${id}`).then((data: any) => {
                console.log(data);
        })

        const ws = new WebSocket(`ws://localhost:8080/ws/streams/${id}`)
        ws.onopen = () => {
            console.log('Юзер подключен к серверу');
        }
        ws.onclose = () => {
            console.log('Юзер отключился от трансляции');
        }
        ws.onerror = (error) => {
            console.error("Юзер WebSocket ошибка:", error);
        };

        ws.onmessage = (event: MessageEvent) => {
            try {
                const data = JSON.parse(event.data)
                console.log(data);
                
                if (data.type === "viewersInfo") {
                    console.log('кол-во зрилов');
                    setViewersCount(data.data)
 
                } else if (data.type === "chatMessage") {
                    console.log('Новое сообщение: ', data.data);
                    const chatList = document.getElementById('chat')
                    const newMessageElement = document.createElement('li')
                    newMessageElement.textContent = data.data
                    newMessageElement.className = 'chatMessage'
                    chatList?.appendChild(newMessageElement)
                }
            } catch (error) {
                console.error('Ошибка при получении сообщения от сокет сервера: ', error);
            }
        }

        webSocketRef.current = ws

        return () => {
            ws.close()
        }

    }, [])

    const handleSubmitMessage = () => {
        try {
            webSocketRef.current?.send(JSON.stringify({type: 'chatMessage', streamId: id, message: messageRef.current}))
        } catch (error) {
            console.log('Не отправилось сообщение в чат: ', error);
        }    
    }

    const streamUrl = `${BACKEND_URL}/streams/${id}/index.m3u8`

    return (
        <div className={styles.pageWrapper}>
            <div className={styles.container}>
                <div className={styles.header}>
                    <h1>👁️ Просмотр трансляции</h1>
                    <p>Смотрите прямую трансляцию в реальном времени</p>
                </div>
                <Player playlistUrl={streamUrl} isLiveStream={true} duration={duration} />
                <div>кол-во зрителей: {viewersCount}</div>
            </div>
            <div className={styles.chatContainer}>
                <ul id='chat' className={styles.chat}>
                    <li className={styles.chatMessage}>первое сообщение</li>
                </ul>
                <input type="text" onChange={(e: React.ChangeEvent) => { messageRef.current = e.target.value }}/>
                <button onClick={handleSubmitMessage}>Отправить сообщение</button>
            </div>
        </div>
    )
}