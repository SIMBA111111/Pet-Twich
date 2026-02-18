// lib/handlers.ts
import { RefObject } from "react";

export const handleSubmitMessage = (webSocketRef: RefObject<WebSocket | null>, messageRef: RefObject<string>, streamId: string, senderUsername: string) => {
    try {
        if (!webSocketRef.current) {
            console.log('❌ WebSocket не инициализирован');
            return;
        }
        
        if (webSocketRef.current.readyState !== WebSocket.OPEN) {
            console.log('❌ WebSocket не открыт, состояние:', webSocketRef.current.readyState);
            return;
        }
        
        const message = messageRef.current?.trim();
        if (!message) {
            console.log('❌ Сообщение пустое');
            return;
        }
        
        const messageData = {
            type: 'chatMessage', 
            streamId: streamId, 
            message: message, 
            senderUsername: senderUsername
        };
        
        console.log('📤 Отправка сообщения:', messageData);
        webSocketRef.current.send(JSON.stringify(messageData));
        
    } catch (error) {
        console.log('❌ Не отправилось сообщение в чат: ', error);
    }    
};