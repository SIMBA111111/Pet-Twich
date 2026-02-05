import { Dispatch, RefObject, SetStateAction } from "react";

export const connectWebSocket = (streamId: string, setStatus: Dispatch<SetStateAction<string>>, webSocketRef: RefObject<WebSocket | null>) => {
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