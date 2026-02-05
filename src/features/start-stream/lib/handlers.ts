import { Dispatch, RefObject, SetStateAction } from "react";
import { connectWebSocket } from "../api/wsEmitMediaStream";


export const startCapture = async (
    setStatus: Dispatch<SetStateAction<string>>,
    setStream: Dispatch<SetStateAction<any>>,
    screenStreamRef: RefObject<MediaStream | null>,
    webSocketRef: RefObject<WebSocket | null>, 
    mediaRecorderRef: RefObject<MediaRecorder | null>,
    setIsStreaming: Dispatch<SetStateAction<boolean>>,
    streamId: string
  ) => {
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

      // Объединяем потоки
      const combinedStream = new MediaStream([
        ...screenStream.getVideoTracks(),
        ...micStream.getAudioTracks()
      ]);

      screenStreamRef.current = screenStream;
      setStream(combinedStream);
      setStatus("Экран захвачен");


      // Обработка остановки трансляции через браузер
      screenStream.getVideoTracks()[0].onended = async () => {
        await stopStreaming(mediaRecorderRef, webSocketRef, screenStreamRef, setIsStreaming, setStream, setStatus, streamId);
      };

      return combinedStream


    } catch (error: any) {
      console.error("Ошибка захвата экрана:", error);
      setStatus(`Ошибка: ${error.message}`);
    }
  };


// рестарт стрима после обновления страницы
export const restartStream = async (
    streamId: string,
    setStatus: Dispatch<SetStateAction<string>>,
    setStreamId: Dispatch<SetStateAction<string>>,
    setViewerUrl: Dispatch<SetStateAction<string>>,
    webSocketRef: RefObject<WebSocket | null>, 
) => {
    try {
        setStatus("Рестарт трансляции...");      
        
        setStreamId(streamId);
        setViewerUrl(`http://localhost:3000/streams/${streamId}`);
        setStatus("Трансляция создана");
        
        // Подключаемся к WebSocket
        connectWebSocket(streamId, setStatus, webSocketRef);

        console.log('restartStream');
        
    } catch (error: any) {
        console.error("Ошибка создания трансляции:", error);
        setStatus(`Ошибка: ${error.message}`);
    }
};


// создать стрим и подключиться к сокету
export const createStream = async (
    setStatus: Dispatch<SetStateAction<string>>,
    setStreamId: Dispatch<SetStateAction<string>>,
    setViewerUrl: Dispatch<SetStateAction<string>>,
    webSocketRef: RefObject<WebSocket | null>, 
) => {
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
        console.log('created stream: ', data);
        
        
        if (data.success) {
        setStreamId(data.streamId);
        setViewerUrl(`http://localhost:3000/streams/${data.streamId}`);
        setStatus("Трансляция создана");
        
        // Подключаемся к WebSocket
        connectWebSocket(data.streamId, setStatus, webSocketRef);
        
        return data;
        }
    } catch (error: any) {
      console.error("Ошибка создания трансляции:", error);
      setStatus(`Ошибка: ${error.message}`);
    }
};



export const startStreaming = async (
    stream: MediaStream | null,
    setStatus: Dispatch<SetStateAction<string>>,
    mediaRecorderRef: RefObject<MediaRecorder | null>,
    webSocketRef: RefObject<WebSocket | null>, 
    setIsStreaming: Dispatch<SetStateAction<boolean>>,
    setStreamId: Dispatch<SetStateAction<string>>,
    setViewerUrl: Dispatch<SetStateAction<string>>,
    setStream: Dispatch<SetStateAction<any>>,
    screenStreamRef: RefObject<MediaStream | null>,
    streamId: string
) => {
    if (!stream) {
      await startCapture(setStatus, setStream, screenStreamRef, webSocketRef, mediaRecorderRef, setIsStreaming, streamId);
    }

    try {
      const streamData = await createStream(setStatus, setStreamId, setViewerUrl, webSocketRef);
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
export const stopStreaming = async (
    mediaRecorderRef: RefObject<MediaRecorder | null>,
    webSocketRef: RefObject<WebSocket | null>, 
    screenStreamRef: RefObject<MediaStream | null>,
    setIsStreaming: Dispatch<SetStateAction<boolean>>,
    setStream: Dispatch<SetStateAction<any>>,
    setStatus: Dispatch<SetStateAction<string>>,
    streamId: string
) => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
        mediaRecorderRef.current.stop();
    }

    if (webSocketRef.current) {
        webSocketRef.current.close();
    }

    const res = await fetch(`http://localhost:8080/api/streams/stop/${streamId}`)

    // setIsActiveModal(false)

    // Останавливаем все треки
    if (screenStreamRef.current) {
        screenStreamRef.current.getTracks().forEach(track => track.stop());
    }

    setIsStreaming(false);
    setStream(null);
    setStatus("Трансляция остановлена");
};