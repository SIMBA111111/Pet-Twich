import { cookies } from 'next/headers'

import { Chat } from '@/widgets/chat/ui/chat'
import { PlayerWidget } from '@/widgets/player/ui/player'

import styles from './styles.module.scss'


export default async function WatchPage({ params }: { params: Promise<{ id: string }> }) {
    // Дожидаемся разрешения Promise
    const { id } = await params;

    const cookieStore = await cookies()

    const cookie = cookieStore.get('userData')?.value

    let userData = {}

    if (cookie) {
        userData = JSON.parse(cookie)
    }

    return (
        <div className={styles.pageWrapper}>
            <div className={styles.container}>
                <div className={styles.header}>
                    <h1 className={styles.title}>📺 Прямой эфир</h1>
                    <p className={styles.subtitle}>Смотрите трансляцию и общайтесь в чате</p>
                </div>
                
                <div className={styles.contentGrid}>
                    <div className={styles.playerSection}>
                        <PlayerWidget streamId={id} username={userData}/>
                    </div>
                    <div className={styles.chatSection}>
                        <Chat streamId={id} userData={userData}/>
                    </div>
                </div>
            </div>
        </div>
    )
}