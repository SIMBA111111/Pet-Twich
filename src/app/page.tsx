'use client'

import { useEffect, useRef, useState } from "react";
import styles from "./page.module.css";

export default function Home() {
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [isStreaming, setIsStreaming] = useState(false);
  const [status, setStatus] = useState<string>("Ожидание...");
  const [streamId, setStreamId] = useState<string>("");
  const [viewerUrl, setViewerUrl] = useState<string>("");
  
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const webSocketRef = useRef<WebSocket | null>(null);
  const screenStreamRef = useRef<MediaStream | null>(null);

  // Захват экрана
  const startCapture = async () => {
    try {
      setStatus("Захват экрана...");
      
      // Запрашиваем доступ к экрану и микрофону
      const screenStream = await navigator.mediaDevices.getDisplayMedia({
        video: {
          frameRate: { ideal: 30, max: 60 },
          width: { ideal: 1280, max: 1920 },
          height: { ideal: 720, max: 1080 }
        },
        audio: true
      });

      // Запрашиваем доступ к микрофону отдельно для лучшего качества
      const micStream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true
        }
      });

      // console.log('screenStream = ', screenStream);
      // console.log('micStream = ', micStream);
      

      // Объединяем потоки
      const combinedStream = new MediaStream([
        ...screenStream.getVideoTracks(),
        ...micStream.getAudioTracks()
      ]);

      screenStreamRef.current = screenStream;
      setStream(combinedStream);
      setStatus("Экран захвачен");

      // Обработка остановки трансляции через браузер
      screenStream.getVideoTracks()[0].onended = () => {
        stopStreaming();
      };

    } catch (error: any) {
      console.error("Ошибка захвата экрана:", error);
      setStatus(`Ошибка: ${error.message}`);
    }
  };

  console.log('stream = ', stream);
  

  // Создание трансляции на сервере
  const createStream = async () => {
    try {
      setStatus("Создание трансляции...");
      
      const response = await fetch('http://localhost:8080/api/streams/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: "Прямой эфир",
          quality: "720p"
        })
      });

      const data = await response.json();
      
      if (data.success) {
        setStreamId(data.streamId);
        setViewerUrl(`http://localhost:3000/streams/${data.streamId}`);
        setStatus("Трансляция создана");
        
        // Подключаемся к WebSocket
        connectWebSocket(data.streamId);
        
        return data;
      }
    } catch (error: any) {
      console.error("Ошибка создания трансляции:", error);
      setStatus(`Ошибка: ${error.message}`);
    }
  };

  // Подключение к WebSocket
  const connectWebSocket = (streamId: string) => {
    console.log('streamId = ', streamId);
    
    const ws = new WebSocket(`ws://localhost:8080/ws/${streamId}`);
    
    ws.onopen = () => {
      console.log("WebSocket подключен");
      setStatus("Подключено к серверу");
    };
    
    ws.onclose = () => {
      console.log("WebSocket отключен");
      setStatus("Соединение разорвано");
    };
    
    ws.onerror = (error) => {
      console.error("WebSocket ошибка:", error);
      setStatus("Ошибка соединения");
    };
    
    webSocketRef.current = ws;
  };

  // Начать трансляцию
  const startStreaming = async () => {
    if (!stream) {
      await startCapture();
    }

    try {
      const streamData = await createStream();
      if (!streamData || !stream) return;

      setStatus("Настройка трансляции...");

      // Создаем MediaRecorder с настройками для WebRTC
      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: 'video/webm;codecs=vp8,opus',
        videoBitsPerSecond: 2500000, // 2.5 Mbps
        audioBitsPerSecond: 128000   // 128 Kbps
      });

      mediaRecorderRef.current = mediaRecorder;

      // Отправка данных на сервер
      mediaRecorder.ondataavailable = async (event) => {
        if (event.data.size > 0 && webSocketRef.current?.readyState === WebSocket.OPEN) {
          // Конвертируем Blob в ArrayBuffer для отправки
          const arrayBuffer = await event.data.arrayBuffer();
          webSocketRef.current.send(arrayBuffer);
        }
      };

      // Начать запись с интервалом 1 секунда
      mediaRecorder.start(1000);
      setIsStreaming(true);
      setStatus("Идет трансляция");

    } catch (error: any) {
      console.error("Ошибка начала трансляции:", error);
      setStatus(`Ошибка: ${error.message}`);
    }
  };

  // Остановить трансляцию
  const stopStreaming = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop();
    }
    
    if (webSocketRef.current) {
      webSocketRef.current.close();
    }
    
    // Останавливаем все треки
    if (screenStreamRef.current) {
      screenStreamRef.current.getTracks().forEach(track => track.stop());
    }
    
    setIsStreaming(false);
    setStream(null);
    setStatus("Трансляция остановлена");
  };

  // Копировать ссылку для просмотра
  const copyViewerUrl = () => {
    if (viewerUrl) {
      navigator.clipboard.writeText(viewerUrl);
      alert("Ссылка скопирована!");
    }
  };

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <h1>🎥 Live Stream Studio</h1>
        <p>Транслируйте свой экран в реальном времени</p>
      </header>

      <main className={styles.main}>
        <div className={styles.previewSection}>
          <div className={styles.videoContainer}>
            {stream ? (
              <video
                className={styles.videoPreview}
                ref={(video) => {
                  if (video && stream) {
                    video.srcObject = stream;
                  }
                }}
                autoPlay
                muted
                playsInline
              />
            ) : (
              <div className={styles.videoPlaceholder}>
                <div className={styles.placeholderIcon}>🎥</div>
                <p>Предпросмотр появится здесь</p>
                <button onClick={startCapture} className={styles.btn}>
                  📸 Захватить экран
                </button>
              </div>
            )}
          </div>

          <div className={styles.controls}>
            <div className={styles.status}>
              <div className={`${styles.statusDot} ${isStreaming ? styles.recording : styles.idle}`} />
              <span>{status}</span>
            </div>

            <div className={styles.buttonGroup}>
              <button
                onClick={startStreaming}
                disabled={isStreaming}
                className={`${styles.btn} ${styles.primaryBtn}`}
              >
                ▶️ Начать трансляцию
              </button>
              
              <button
                onClick={stopStreaming}
                disabled={!isStreaming}
                className={`${styles.btn} ${styles.dangerBtn}`}
              >
                ⏹️ Остановить
              </button>
            </div>
          </div>
        </div>

        <div className={styles.infoSection}>
          <div className={styles.infoCard}>
            <h3>📡 Информация о трансляции</h3>
            
            {streamId && (
              <div className={styles.infoGrid}>
                <div className={styles.infoItem}>
                  <span className={styles.infoLabel}>ID:</span>
                  <span className={styles.infoValue}>{streamId}</span>
                </div>
                
                <div className={styles.infoItem}>
                  <span className={styles.infoLabel}>Статус:</span>
                  <span className={`${styles.infoValue} ${isStreaming ? styles.live : styles.offline}`}>
                    {isStreaming ? "В эфире" : "Неактивно"}
                  </span>
                </div>

                {viewerUrl && (
                  <div className={styles.infoItem}>
                    <span className={styles.infoLabel}>Ссылка для зрителей:</span>
                    <div className={styles.urlContainer}>
                      <input
                        type="text"
                        readOnly
                        value={viewerUrl}
                        className={styles.urlInput}
                      />
                      <button onClick={copyViewerUrl} className={styles.copyBtn}>
                        📋
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* <div className={styles.infoCard}>
            <h3>⚙️ Настройки</h3>
            <div className={styles.settings}>
              <div className={styles.setting}>
                <label>Качество:</label>
                <select className={styles.select}>
                  <option value="720p">HD 720p</option>
                  <option value="480p">SD 480p</option>
                  <option value="1080p">Full HD 1080p</option>
                </select>
              </div>
              
              <div className={styles.setting}>
                <label>Звук:</label>
                <select className={styles.select}>
                  <option value="mic">Микрофон</option>
                  <option value="system">Системный звук</option>
                  <option value="both">Оба</option>
                </select>
              </div>
            </div>
          </div> */}
        </div>
      </main>

      <footer className={styles.footer}>
        <p>Live Stream Studio • Трансляция в реальном времени</p>
      </footer>
    </div>
  );
}