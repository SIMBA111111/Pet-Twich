'use client'

import { useEffect, useState } from "react"

import { Player } from "../../../../Player/src/component"
import { getWsViewersCount } from "../api/getWsViewersCount"

import styles from './styles.module.scss'


interface IPlayerWidget {
    streamId: string
}

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL

export const PlayerWidget: React.FC<IPlayerWidget> = ({ streamId }) => {
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

        // Получаем текущий поток
        fetch(BACKEND_URL + `/api/streams/${streamId}`)
            .then((response) => response.json())
            .then((data) => {
                setCurrentStream(data)
            })

        // Инициируем WebSocket для просмотра
        const wsPromise = getWsViewersCount(streamId, setViewersCount)

        // Очистка при размонтировании компонента
        return () => {
            es.close()
            wsPromise.then((ws) => ws.close())
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