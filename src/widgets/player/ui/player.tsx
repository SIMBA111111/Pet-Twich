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
const STREAM_HOST = process.env.NEXT_PUBLIC_STREAM_HOST


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
        
        // Получаем текущий поток
        fetch(BACKEND_URL + `/api/streams/${streamId}`, {
            method: 'POST',
              headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({username: username.username})
        })
            .then((response) => response.json())
            .then((data) => {
                setCurrentStream(data.data)
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
            wsPromise.then((ws) => ws.close(1000, 'slkdjflksdjfklj'))
        }
    }, [streamId])

    if (!currentStream) {
        return (
            <div className={styles.loadingContainer}>
                <div className={styles.spinner}></div>
                <p>Загрузка трансляции...</p>
            </div>
        )
    }

    // const formatDuration = (seconds: number) => {
    //     const hours = Math.floor(seconds / 3600)
    //     const minutes = Math.floor((seconds % 3600) / 60)
    //     const secs = seconds % 60
    //     return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
    // }

    return (
        <div className={styles.pageWrapper}>
            <div className={styles.container}>
                {/* <div className={styles.header}>
                    <h1 className={styles.title}>📺 Просмотр трансляции</h1>
                    <p className={styles.subtitle}>Смотрите прямую трансляцию в реальном времени</p>
                </div> */}

                <div className={styles.playerCard}>
                    <div className={styles.streamPreview}>
                        <div className={styles.previewOverlay}>
                            <span className={styles.liveBadge}>LIVE</span>
                            <div className={styles.streamStats}>
                                <span className={styles.viewerCount}>
                                    👁️ {viewersCount} зрителей
                                </span>
                                {/* <span className={styles.duration}>
                                    ⏱️ {formatDuration(duration)}
                                </span> */}
                            </div>
                        </div>
                        <Player 
                            playlistUrl={STREAM_HOST + '/' + currentStream.stream_key + '/index.m3u8'} 
                            isLiveStream={true} 
                            duration={duration} 
                        />
                    </div>

                    {/* <div className={styles.streamInfo}>
                        <div className={styles.streamerAvatar}>
                            {currentStream.user?.avatar ? (
                                <img 
                                    src={currentStream.user.avatar} 
                                    alt={currentStream.user.username}
                                    className={styles.avatarImage}
                                />
                            ) : (
                                <div className={styles.avatarPlaceholder}>
                                    {currentStream.user?.username?.charAt(0).toUpperCase() || 'S'}
                                </div>
                            )}
                        </div>
                        <div className={styles.streamDetails}>
                            <h2 className={styles.streamTitle}>
                                {currentStream.title || 'Без названия'}
                            </h2>
                            <div className={styles.streamMeta}>
                                <span className={styles.streamerName}>
                                    {currentStream.user?.username || 'Неизвестный стример'}
                                </span>
                                {currentStream.game && (
                                    <span className={styles.gameTag}>
                                        🎮 {currentStream.game}
                                    </span>
                                )}
                            </div>
                            {currentStream.tags && currentStream.tags.length > 0 && (
                                <div className={styles.tagsList}>
                                    {currentStream.tags.map((tag: string, index: number) => (
                                        <span key={index} className={styles.tag}>
                                            #{tag}
                                        </span>
                                    ))}
                                </div>
                            )}
                            {currentStream.description && (
                                <p className={styles.streamDescription}>
                                    {currentStream.description}
                                </p>
                            )}
                        </div>
                    </div> */}
                </div>
            </div>
        </div>
    )
}