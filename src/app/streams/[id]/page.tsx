'use client'

import { useParams } from 'next/navigation'

import { Chat } from '@/widgets/chat/ui/chat'
import { PlayerWidget } from '@/widgets/player/ui/player'

import styles from './styles.module.scss'


export default function WatchPage() {
    const { id } = useParams()
    
    return (
        <div className={styles.pageWrapper}>
            <PlayerWidget streamId={String(id)}/>
            <Chat streamId={String(id)}/>
        </div>
    )
}