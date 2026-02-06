import { cookies } from 'next/headers'

import { Chat } from '@/widgets/chat/ui/chat'
import { PlayerWidget } from '@/widgets/player/ui/player'

import styles from './styles.module.scss'


export default async function WatchPage({ params }: { params: Promise<{ id: string }> }) {
    // Дожидаемся разрешения Promise
    const { id } = await params;

    console.log('id = ', id );

    const cookieStore = await cookies()

    const cookie = cookieStore.get('userData')?.value

    let userData = {}

    if (cookie) {
        userData = JSON.parse(cookie)
    }


    return (
        <div className={styles.pageWrapper}>
            <PlayerWidget streamId={id}/>
            <Chat streamId={id} userData={userData}/>
        </div>
    )
}