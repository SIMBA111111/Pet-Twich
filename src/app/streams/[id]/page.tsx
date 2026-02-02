'use client'

import { useEffect, useRef } from 'react';
import styles from './styles.module.css';
import Hls from 'hls.js';
import { Player } from '../../../../Player/src/component';

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL


export default function WatchPage() {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamIdRef = useRef<string>('');
  const hlsRef = useRef<Hls | null>(null);
  const intervalIdRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const urlParts = window.location.pathname.split('/');
    const id = urlParts[urlParts.length - 1];
    streamIdRef.current = id;
    initializePlayer(id);
    // Очистка при размонтировании
    return () => {
      if (intervalIdRef.current) {
        clearInterval(intervalIdRef.current);
      }
      if (hlsRef.current) {
        hlsRef.current.destroy();
      }
    };
  }, []);

  const initializePlayer = async (streamId: string) => {
    if (!streamId) {
      alert('Ошибка: не указан ID трансляции');
      return;
    }

    const streamTitleElem = document.getElementById('streamTitle') as HTMLElement;
    const viewerCountElem = document.getElementById('viewerCount') as HTMLElement;
    const loadingIndicator = document.getElementById('loadingIndicator') as HTMLElement;

    try {
      const response = await fetch(BACKEND_URL + `/api/streams/${streamId}`);
      const streamInfo = await response.json();

      if (streamInfo.error) {
        streamTitleElem.textContent = 'Трансляция не найдена';
        return;
      }

      streamTitleElem.textContent = streamInfo.name;
      viewerCountElem.textContent = streamInfo.viewers ?? 0;

      const streamUrl = BACKEND_URL + `/streams/${streamId}/index.m3u8`;

      if (Hls.isSupported()) {
        const hls = new Hls({
          enableWorker: true,
          lowLatencyMode: true,
          backBufferLength: 20,
          liveDurationInfinity: true,
          liveSyncDurationCount: 3,
          maxMaxBufferLength: 200,
          maxBufferSize: 5 * 1000 * 1000,
          maxBufferHole: 0.5,
          manifestLoadingTimeOut: 10000,
          manifestLoadingMaxRetry: 3,
          levelLoadingTimeOut: 10000,
          levelLoadingMaxRetry: 3,
          fragLoadingTimeOut: 20000,
          fragLoadingMaxRetry: 3,
          startLevel: -1,
          capLevelToPlayerSize: true,
          autoStartLoad: true,
        });
        hlsRef.current = hls;

        hls.loadSource(streamUrl);
        if (videoRef.current) {
          hls.attachMedia(videoRef.current);
        }

        hls.on(Hls.Events.MANIFEST_PARSED, () => {
          loadingIndicator.style.display = 'none';
          videoRef.current?.play().catch(() => {});
        });

        hls.on(Hls.Events.ERROR, (event, data) => {
          if (data.fatal) {
            switch (data.type) {
              case Hls.ErrorTypes.NETWORK_ERROR:
                hls.startLoad();
                break;
              case Hls.ErrorTypes.MEDIA_ERROR:
                hls.recoverMediaError();
                break;
              default:
                loadingIndicator.innerHTML = `
                  <div class="${styles.spinner}"></div>
                  <p>Ошибка воспроизведения. Попробуйте обновить страницу.</p>
                `;
                break;
            }
          }
        });
      } else if (videoRef.current?.canPlayType('application/vnd.apple.mpegurl')) {
        // Safari
        if (videoRef.current) {
          videoRef.current.src = streamUrl;
          videoRef.current.addEventListener('loadedmetadata', () => {
            loadingIndicator.style.display = 'none';
            videoRef.current?.play().catch(() => {});
          });
        }
      } else {
        loadingIndicator.innerHTML = `
          <p>Ваш браузер не поддерживает воспроизведение HLS.</p>
          <p>Попробуйте использовать Chrome, Firefox или Edge.</p>
        `;
      }

      // Обновление счетчика зрителей
      updateViewerCount(streamId);
      intervalIdRef.current = setInterval(() => updateViewerCount(streamId), 30000);
    } catch (error) {
      console.error('Error initializing player:', error);
      if (loadingIndicator) {
        loadingIndicator.innerHTML = `
          <div class="${styles.spinner}"></div>
          <p>Ошибка подключения к трансляции</p>
        `;
      }
    }
  };

  const updateViewerCount = async (streamId: string) => {
    try {
      const response = await fetch(BACKEND_URL + `/api/streams/${streamId}`);
      const streamInfo = await response.json();
      if (!streamInfo.error) {
        const viewerCountElem = document.getElementById('viewerCount') as HTMLElement;
        if (viewerCountElem) {
          viewerCountElem.textContent = streamInfo.viewers ?? '0';
        }
      }
    } catch (error) {
      console.error('Error updating viewer count:', error);
    }
  };

  const toggleFullscreen = () => {
    const elem = document.getElementById('streamPlayer') as HTMLElement;
    if (!document.fullscreenElement) {
      if (elem.requestFullscreen) {
        elem.requestFullscreen();
      } else if ((elem as any).webkitRequestFullscreen) {
        (elem as any).webkitRequestFullscreen();
      } else if ((elem as any).msRequestFullscreen) {
        (elem as any).msRequestFullscreen();
      }
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
      } else if ((document as any).webkitExitFullscreen) {
        (document as any).webkitExitFullscreen();
      } else if ((document as any).msExitFullscreen) {
        (document as any).msExitFullscreen();
      }
    }
  };

  const refreshStream = () => {
    if (hlsRef.current) {
      hlsRef.current.destroy();
    }
    const loadingIndicator = document.getElementById('loadingIndicator') as HTMLElement;
    loadingIndicator.style.display = 'block';
    initializePlayer(streamIdRef.current);
  };

  const goHome = () => {
    window.location.href = '/';
  };

  return (
    <div className={styles.pageWrapper}>
      <div className={styles.container}>
        <div className={styles.header}>
          <h1>👁️ Просмотр трансляции</h1>
          <p>Смотрите прямую трансляцию в реальном времени</p>
        </div>

        {/* <Player playlistUrl={}/> */}

        {/* <div className={styles['player-container']}>
          <video ref={videoRef} id="streamPlayer" controls playsInline autoPlay></video>
          <div className={styles['player-overlay']}>
            <div className={styles['stream-title']} id="streamTitle">Загрузка трансляции...</div>
            <div className={styles['viewer-count']}>
              👥 <span id="viewerCount">0</span> зрителей
            </div>
          </div>
          <div className={styles['loading']} id="loadingIndicator">
            <div className={styles['spinner']}></div>
            <p>Подключение к трансляции...</p>
          </div>
        </div>

        <div className={styles['controls']}>
          <button className={styles['btn']} onClick={toggleFullscreen}>📺 Полный экран</button>
          <button className={styles['btn']} onClick={refreshStream}>🔄 Обновить</button>
          <button className={styles['btn']} onClick={goHome}>🏠 На главную</button> */}
        {/* </div> */}
      </div>
    </div>
  );
}