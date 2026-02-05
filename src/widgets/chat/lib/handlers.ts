import { RefObject } from "react";

export const handleSubmitMessage = (webSocketRef: RefObject<WebSocket | null>, messageRef: RefObject<string>, streamId: string) => {
    try {
        console.log('handleSubmitMessage: ', webSocketRef.current);
        
        webSocketRef.current?.send(JSON.stringify({type: 'chatMessage', streamId: streamId, message: messageRef.current}))
    } catch (error) {
        console.log('Не отправилось сообщение в чат: ', error);
    }    
}