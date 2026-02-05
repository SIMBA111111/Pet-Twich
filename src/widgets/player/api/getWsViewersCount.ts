import { Dispatch, SetStateAction } from "react";

export const getWsViewersCount = async (streamId: string, setViewersCount: Dispatch<SetStateAction<number>>): Promise<WebSocket> => {
  const ws = new WebSocket(`ws://localhost:8080/ws/streams/${streamId}`);
  
  ws.onopen = () => {
    console.log('Юзер подключен к плееру');
  };

  ws.onclose = () => {
    console.log('Юзер отключился от плеера');
  };

  ws.onerror = (error) => {
    console.error('Юзер WebSocket плеер ошибка:', error);
  };

  ws.onmessage = (event: MessageEvent) => {
    try {
      const data = JSON.parse(event.data);

      if (data.type === 'viewersInfo') {
        setViewersCount(data.data);
      }
    } catch (error) {
      console.error('Ошибка при получении количества зрителей:', error);
    }
  };

  return ws
};