import styles from '../ui/styles.module.scss'

export const getWsChat = async (streamId: string): Promise<WebSocket> => {
  const ws = new WebSocket(`ws://localhost:8080/ws/streams/${streamId}/chat`);
  
  ws.onopen = () => {
    console.log('Юзер подключен к чатау');
  };

  ws.onclose = () => {
    console.log('Юзер отключился от чата');
    ws.close()
  };

  ws.onerror = (error) => {
    console.error('Юзер WebSocket чат ошибка:', error);
    ws.close()
  };

  ws.onmessage = (event: MessageEvent) => {
    try {
        const data = JSON.parse(event.data);

        if (data.type === "chatMessage") {
          
            const chatList = document.getElementById('chat')

            if(chatList)
              chatList.innerHTML += `<li class=${styles.chatMessage}>${data.senderUsername}: ${data.message}</li>`;
        }
    } catch (error) {
      console.error('Ошибка при получении количества зрителей:', error);
    }
  };

  return ws
};