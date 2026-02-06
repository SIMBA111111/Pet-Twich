'use client'

import { useEffect, useState } from "react"

import { Player } from "../../../../Player/src/component"
import { getWsViewersCount } from "../api/getWsViewersCount"

import styles from './styles.module.scss'


interface IPlayerWidget {
    streamId: string
    username: any
}

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL

export const PlayerWidget: React.FC<IPlayerWidget> = ({ streamId, username }) => {
    const [duration, setDuration] = useState<number>(0)
    const [currentStream, setCurrentStream] = useState<any>(null)
    const [viewersCount, setViewersCount] = useState<number>(0)

    useEffect(() => {
        // Создаем EventSource для получения времени
        const es = new EventSource(BACKEND_URL + `/api/streams/time/${streamId}`)

        es.onmessage = (event) => {
            const data = JSON.parse(event.data)
            if (data.type === 'ffmpeg_time') {
                setDuration(data.time)
            }
        }
        // console.log('username +++ ', username);
        
        // Получаем текущий поток
        fetch(BACKEND_URL + `/api/streams/${streamId}`, {
            method: 'POST',
              headers: {
                'Content-Type': 'application/json' // добавляем заголовок
            },
            body: JSON.stringify({username: username.username})
        })
            .then((response) => response.json())
            .then((data) => {
                setCurrentStream(data)
            })

        // Инициируем WebSocket для просмотра
        const wsPromise = getWsViewersCount(streamId, setViewersCount, username)

        window.addEventListener('beforeunload', () => {
            wsPromise.then((ws) => ws.close(1000, username.username))
            }
        );

        // Очистка при размонтировании компонента
        return () => {
            es.close()
            console.log('username.username ()()()() ', username.username);
            
            wsPromise.then((ws) => ws.close(1000, 'slkdjflksdjfklj'))
        }
    }, [streamId])

    if (!currentStream) {
        return 'wait...'
    }

    return (
        <div className={styles.playerContainer}>
            <div className={styles.header}>
                <h1 className={styles.headerH1}>👁️ Просмотр трансляции</h1>
                <p>Смотрите прямую трансляцию в реальном времени</p>
            </div>
            <Player playlistUrl={currentStream.streamUrl} isLiveStream={true} duration={duration} />
            <div className={styles.viewersCount}>Зрителей: {viewersCount}</div>
        </div>
    )
}