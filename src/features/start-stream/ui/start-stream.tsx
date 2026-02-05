'use client'

import { Dispatch, SetStateAction, useRef, useState } from "react";
import { startCapture, startStreaming, stopStreaming } from "../lib/handlers";

import styles from "./styles.module.scss";

interface IStartStream {
    setIsStreaming: Dispatch<SetStateAction<boolean>>
    isStreaming: boolean
    setStreamId: Dispatch<SetStateAction<string>>
    streamId: string
    setActiveStream: Dispatch<SetStateAction<any>>
    setViewerUrl: Dispatch<SetStateAction<string>>
}

export const StartStream: React.FC<IStartStream> = ({setIsStreaming, isStreaming, setStreamId, streamId, setActiveStream, setViewerUrl}) => {
    const [stream, setStream] = useState<MediaStream | null>(null);
    const [status, setStatus] = useState<string>("Ожидание...");
    
    const mediaRecorderRef = useRef<MediaRecorder | null>(null);
    const webSocketRef = useRef<WebSocket | null>(null);
    const screenStreamRef = useRef<MediaStream | null>(null);

    return (
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
                <button onClick={() => startCapture(setStatus, setStream, screenStreamRef, webSocketRef, mediaRecorderRef, setIsStreaming, streamId)} className={styles.btn}>
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
                onClick={() => startStreaming(stream, setStatus, mediaRecorderRef, webSocketRef, setIsStreaming, setStreamId, setViewerUrl, setStream, screenStreamRef, streamId)}
                disabled={isStreaming}
                className={`${styles.btn} ${styles.primaryBtn}`}
              >
                ▶️ Начать трансляцию
              </button>
              
              <button
                onClick={() => stopStreaming(mediaRecorderRef, webSocketRef, screenStreamRef, setIsStreaming, setStream, setStatus, streamId)}
                disabled={!isStreaming}
                className={`${styles.btn} ${styles.dangerBtn}`}
              >
                ⏹️ Остановить
              </button>
            </div>
          </div>
        </div>
    )
}