'use client'

import { Dispatch, SetStateAction, useState } from "react";

import { copyViewerUrl } from "../lib/copyViewUrl";

import { StartStream } from "@/features/start-stream/ui/start-stream";

import styles from "./styles.module.scss";


interface IStreamWidget {
    setViewerUrl: Dispatch<SetStateAction<string>>
    viewerUrl: string
    setActiveStream: Dispatch<SetStateAction<any>>
    setStreamId: Dispatch<SetStateAction<string>>
    streamId: string
    setIsActiveModal: Dispatch<SetStateAction<boolean>>
    isActiveModal: boolean
}


export const StreamWidget: React.FC<IStreamWidget> = ({setViewerUrl, viewerUrl, setActiveStream, setStreamId, streamId, setIsActiveModal, isActiveModal}) => {
    // const [isActiveModal, setIsActiveModal] = useState<boolean>(false);
    // const [streamId, setStreamId] = useState<string>("");
    // const [viewerUrl, setViewerUrl] = useState<string>("");
    const [isStreaming, setIsStreaming] = useState(false);
    // const [activeStream, setActiveStream] = useState<any>(null);


 return (
    <>
    <div id="container" className={isActiveModal ? `${styles.container} ${styles.overlay}` : `${styles.container}`}>
        <header className={styles.header}>
            <h1>🎥 Live Stream Studio</h1>
            <p>Транслируйте свой экран в реальном времени</p>
        </header>

        <StartStream 
            setIsStreaming={setIsStreaming} 
            isStreaming={isStreaming} 
            setStreamId={setStreamId} 
            streamId={streamId} 
            setActiveStream={setActiveStream} 
            setViewerUrl={setViewerUrl}
        />

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
                            <button onClick={() => copyViewerUrl(viewerUrl)} className={styles.copyBtn}>
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

      <footer className={styles.footer}>
        <p>Live Stream Studio • Трансляция в реальном времени</p>
      </footer>
    </div>

    {/* {isActiveModal && (
      <div id='modalContainer' className={styles.modalOverlay}>
        <div className={styles.modalContent}>
          <h3 className={styles.modalTitle}>У вас есть прерванный стрим</h3>
          <p className={styles.streamInfo}>незаконченный стрим: {activeStream.title}</p>
          <div className={styles.buttonContainer}>
            <button className={styles.stopButton} onClick={stopStreaming}>Остановить стрим</button>
            <button className={styles.resumeButton} onClick={(e: React.MouseEvent) => restartStreaming(activeStream.id)}>Продолжить стрим</button>
          </div>
        </div>
      </div>
    )} */}
    </>
  );
}