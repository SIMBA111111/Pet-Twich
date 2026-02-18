'use client'

import { useRouter } from 'next/navigation';
import { getCookie } from 'cookies-next';
import Image from 'next/image';

import styles from './styles.module.css';
import { useEffect, useState } from 'react';

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL
const STREAM_HOST = process.env.NEXT_PUBLIC_STREAM_HOST

export default function StreamsList() {
  const router = useRouter()
  const [streams, setStreams] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<null | string>(null)

  const fetchStreams = async () => {
    try {
      setLoading(true)
      const response = await fetch(`${BACKEND_URL}/api/streams`)
      const data = await response.json()
      
      if (data.success) {
        setStreams(data.streams || [])
        setError(null)
      } else {
        setError('Не удалось загрузить список трансляций')
      }
    } catch (error) {
      console.error('Error:', error);
      setError('Ошибка получения списка трансляций')
    } finally {
      setLoading(false)
    }
  };

  useEffect(() => {
    fetchStreams();
  }, [])

  const handleStreamClick = (streamId: string, streamHlsPath: string) => {
    router.push(`/streams/${streamId}`);
  };

  // Заглушка для превью (можно заменить на реальные превью)
  const getPreviewUrl = (streamId: string) => {
    return `${BACKEND_URL}/api/streams/${streamId}/preview`;
  };

  // // Форматирование длительности
  // const formatDuration = (seconds) => {
  //   if (!seconds) return '0:00';
    
  //   const hours = Math.floor(seconds / 3600);
  //   const minutes = Math.floor((seconds % 3600) / 60);
  //   const secs = Math.floor(seconds % 60);
    
  //   if (hours > 0) {
  //     return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  //   }
  //   return `${minutes}:${secs.toString().padStart(2, '0')}`;
  // };

  if (loading && streams.length === 0) {
    return (
      <div className={styles.pageWrapper}>
        <div className={styles.container}>
          <div className={styles.loadingContainer}>
            <div className={styles.spinner}></div>
            <p>Загрузка трансляций...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.pageWrapper}>
      <div className={styles.container}>
        <div className={styles.header}>
          <h1 className={styles.title}>🎥 Live Streaming Platform</h1>
          <p className={styles.subtitle}>
            {streams.length > 0 
              ? `Сейчас в эфире ${streams.length} ${streams.length === 1 ? 'трансляция' : streams.length < 5 ? 'трансляции' : 'трансляций'}`
              : 'Нет активных трансляций'}
          </p>
        </div>

        {error && (
          <div className={styles.errorMessage}>
            {error}
            <button onClick={fetchStreams} className={styles.retryButton}>
              Повторить
            </button>
          </div>
        )}

        <div className={styles.cardGrid}>
          {/* Карточка для начала трансляции */}
          <a href="/broadcaster.html" className={styles.card}>
            <div className={styles.cardIcon}>📡</div>
            <h3 className={styles.cardTitle}>Начать трансляцию</h3>
            <p className={styles.cardDescription}>
              Запустите прямую трансляцию вашего экрана. 
              Захватывайте видео, аудио и делитесь контентом в реальном времени.
            </p>
          </a>

          {/* Карточки активных трансляций */}
          {streams.map((stream: any) => (
            <div 
              key={stream.id} 
              className={`${styles.streamCard} ${styles.card}`}
              onClick={() => handleStreamClick(stream.id, stream.streamHlsPath)}
            >
              {/* Превью стрима */}
              <div className={styles.streamPreview}>
                <div className={styles.previewOverlay}>
                  <span className={styles.liveBadge}>LIVE</span>
                  <span className={styles.viewerCount}>
                    👁️ {stream.viewersCount || 0}
                  </span>
                  <span className={styles.duration}>
                    {/* {formatDuration(stream.duration)} */}
                    Продолжительность
                  </span>
                </div>
                <div className={styles.previewPlaceholder}>
                  <span className={styles.playIcon}>▶</span>
                </div>
              </div>

              {/* Информация о стриме */}
              <div className={styles.streamInfo}>
                <div className={styles.streamerAvatar}>
                  {stream.streamerAvatar ? (
                    <img 
                      src={stream.streamerAvatar} 
                      alt={stream.streamerName}
                      className={styles.avatarImage}
                    />
                  ) : (
                    <div className={styles.avatarPlaceholder}>
                      {stream.streamerName?.charAt(0).toUpperCase()}
                    </div>
                  )}
                </div>
                
                <div className={styles.streamDetails}>
                  <h4 className={styles.streamTitle}>
                    {stream.title || 'Без названия'}
                  </h4>
                  
                  <div className={styles.streamMeta}>
                    <span className={styles.streamerName}>
                      @{stream.streamerName}
                    </span>
                    
                    <span className={styles.gameTag}>
                      {stream.game || 'Just Chatting'}
                    </span>
                  </div>

                  {stream.tags && stream.tags.length > 0 && (
                    <div className={styles.tagsList}>
                      {stream.tags.slice(0, 2).map((tag: string, index: number) => (
                        <span key={index} className={styles.tag}>
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Статистика стрима */}
              <div className={styles.streamStats}>
                <div className={styles.statItem}>
                  <span className={styles.statValue}>{stream.viewersCount || 0}</span>
                  <span className={styles.statLabel}>зрителей</span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Сообщение, если нет стримов */}
        {!loading && streams.length === 0 && !error && (
          <div className={styles.noStreams}>
            <p>😴 Сейчас нет активных трансляций</p>
            <p>Начните свою первую трансляцию!</p>
            <a href="/broadcaster.html" className={styles.startButton}>
              Начать трансляцию
            </a>
          </div>
        )}
      </div>
    </div>
  );
}