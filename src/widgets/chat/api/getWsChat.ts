export const getWsChat = async (streamId: string): Promise<WebSocket> => {
  const ws = new WebSocket(`ws://localhost:8080/ws/streams/${streamId}/chat`);
  
  ws.onopen = () => {
    console.log('Юзер подключен к чатау');
  };

  ws.onclose = () => {
    console.log('Юзер отключился от чата');
  };

  ws.onerror = (error) => {
    console.error('Юзер WebSocket чат ошибка:', error);
  };

  ws.onmessage = (event: MessageEvent) => {
    try {
        const data = JSON.parse(event.data);
        console.log(data);

        if (data.type === "chatMessage") {
            console.log('Новое сообщение: ', data.data);
            const chatList = document.getElementById('chat')
            const newMessageElement = document.createElement('li')
            newMessageElement.textContent = data.data
            newMessageElement.className = 'chatMessage'
            chatList?.appendChild(newMessageElement)
        }
    } catch (error) {
      console.error('Ошибка при получении количества зрителей:', error);
    }
  };

  return ws
};