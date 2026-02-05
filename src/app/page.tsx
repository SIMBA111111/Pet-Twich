'use client'

import { useEffect, useRef, useState } from "react";

import { StreamWidget } from "@/widgets/stream/ui/stream";

import styles from "./styles.module.css";


export default function Home() {
  const [activeStream, setActiveStream] = useState<any>(null);
  const [streamId, setStreamId] = useState<string>("");
  const [viewerUrl, setViewerUrl] = useState<string>("");
  const [isActiveModal, setIsActiveModal] = useState<boolean>(false);
  
  useEffect(() => {
    const handleGetMyActiveStream = async () => {
      const res = await fetch('http://localhost:8080/api/streams/my')
      // console.log(res);
      
      if(res.status === 404) {
        console.log('нет стрима');
        return
      }

      const { notStopedStream } = await res.json()

      setActiveStream(notStopedStream)
      setStreamId(notStopedStream.id)
      setIsActiveModal(true)
    }

    handleGetMyActiveStream() 
  }, [])

  return (
    <div>
      <StreamWidget 
        setViewerUrl={setViewerUrl} 
        viewerUrl={viewerUrl} 
        setActiveStream={setActiveStream} 
        setStreamId={setStreamId} 
        streamId={streamId} 
        setIsActiveModal={setIsActiveModal} 
        isActiveModal={isActiveModal}/>
    
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
    </div>
  );
}