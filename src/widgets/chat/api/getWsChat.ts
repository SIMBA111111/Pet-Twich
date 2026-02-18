// api/getWsChat.ts
export const getWsChat = async (streamId: string, username: string): Promise<WebSocket> => {
  return new Promise((resolve, reject) => {
    const ws = new WebSocket(`ws://localhost:8080/ws/streams/${streamId}/chat/${username}`);
    
    ws.onopen = () => {
      console.log('✅ Юзер подключен к чату');
      resolve(ws); // Разрешаем промис только после успешного открытия соединения
    };

    ws.onerror = (error) => {
      console.error('❌ WebSocket чат ошибка:', error);
      reject(error);
    };

    // Устанавливаем таймаут на случай, если соединение не открывается
    const timeout = setTimeout(() => {
      reject(new Error('WebSocket connection timeout'));
    }, 5000);

    // Очищаем таймаут при успешном открытии
    ws.onopen = () => {
      clearTimeout(timeout);
      console.log('✅ Юзер подключен к чату');
      resolve(ws);
    };
  });
};