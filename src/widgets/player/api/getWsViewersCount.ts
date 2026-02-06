import { Dispatch, SetStateAction } from "react";

export const getWsViewersCount = async (streamId: string, setViewersCount: Dispatch<SetStateAction<number>>, username: any): Promise<WebSocket> => {
  const ws = new WebSocket(`ws://localhost:8080/ws/streams/${username.username}/${streamId}`);

  ws.onopen = () => {
    console.log('Юзер подключен к плееру');
    // console.log(username);
    
    // ws.send(JSON.stringify({ type: 'setUsername', username: username.username }));
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