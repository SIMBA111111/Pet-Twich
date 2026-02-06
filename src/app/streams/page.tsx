'use client'

import { useRouter } from 'next/navigation';
import { getCookie } from 'cookies-next';

import styles from './styles.module.css';
import { useEffect } from 'react';


const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL

export default function StreamsList() {
  const router = useRouter()


  const viewStreams = () => {
    fetch(BACKEND_URL + '/api/streams')
      .then(response => response.json())
      .then(data => {
        router.push(`/streams/${data.streams[0].id}`)
    })
      .catch(error => {
        console.error('Error:', error);
        alert('Ошибка получения списка трансляций');
      });
  };

  useEffect(() => {
    async function fetchUserData() {
      const userDataString = await getCookie('userData'); // string или undefined
      
      if (userDataString) {
        const decodedCookie = decodeURIComponent(userDataString)
        const userData = JSON.parse(decodedCookie);
        console.log('User Data:', userData);
      } else {
        console.log('Кука не найдена');
      }
    }
    fetchUserData();

  }, [])


  return (
    <div className={styles.pageWrapper}>
      <div className={styles.container}>
        <h1 className={styles.title}>🎥 Live Streaming Platform</h1>
        <p className={styles.subtitle}>Профессиональная платформа для прямых трансляций</p>
        <div className={styles.cardGrid}>
          <a href="/broadcaster.html" className={styles.card}>
            <div className={styles.cardIcon}>📡</div>
            <h3 className={styles.cardTitle}>Начать трансляцию</h3>
            <p className={styles.cardDescription}>
              Запустите прямую трансляцию вашего экрана. 
              Захватывайте видео, аудио и делитесь контентом в реальном времени.
            </p>
          </a>
          
          <div onClick={() => viewStreams()} className={styles.card} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <div className={styles.cardIcon}>📺</div>
            <h3 className={styles.cardTitle}>Активные трансляции</h3>
            <p className={styles.cardDescription}>
              Просматривайте активные трансляции в высоком качестве. 
              Общайтесь в чате с другими зрителями.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}