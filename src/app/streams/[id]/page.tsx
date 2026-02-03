'use client'

import { useEffect, useRef, useState } from 'react'
import styles from './styles.module.css'
import { Player } from '../../../../Player/src/component'
import { useParams } from 'next/navigation'

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL

export default function WatchPage() {
    const { id } = useParams()
    const [duration, setDuration] = useState(0)
    const eventSourceRef = useRef<EventSource | null>(null)

    useEffect(() => {
        const es = new EventSource(`http://localhost:8080/api/streams/${id}/time`)
        eventSourceRef.current = es

        es.onmessage = (event) => {
            const data = JSON.parse(event.data)
            if (data.type === 'ffmpeg_time') {
                console.log('Текущее время стрима:', data.time)
                setDuration(data.time)
            }
        }

        return () => {
            es.close()
        }
    }, [id])

    const streamUrl = `${BACKEND_URL}/streams/${id}/index.m3u8`

    return (
        <div className={styles.pageWrapper}>
            <div className={styles.container}>
                <div className={styles.header}>
                    <h1>👁️ Просмотр трансляции</h1>
                    <p>Смотрите прямую трансляцию в реальном времени</p>
                </div>
                <Player playlistUrl={streamUrl} isLiveStream={true} duration={duration} />
            </div>
        </div>
    )
}