'use client'

import { useEffect, useState } from "react"

const BACKEND_URl = process.env.NEXT_PUBLIC_BACKEND_URL

export default function StreamsList() {
    const [currentStreamKey, setCurrentStreamKey] = useState('')

    useEffect(() => {
        (async () => {
            const res = await fetch(BACKEND_URl + '/api/streams/key-stream/get')
            const data = await res.json()

            if (data.streamKey) {
                setCurrentStreamKey(data.streamKey)
            }
        })()
    }, [])

    const handleCreateNewStreamKey = async (e: React.MouseEvent<HTMLButtonElement>) => {
        const res = await fetch(BACKEND_URl + '/api/streams/key-stream/create', {
            method: 'POST',
        })
        const {newStreamKey} = await res.json()

        if (newStreamKey) {
            setCurrentStreamKey(newStreamKey)
        }
    }

    return (
        <div>
            <input type="text"  value={currentStreamKey}/>
            <button onClick={handleCreateNewStreamKey}>Генерировать новый ключ</button>
        </div>
    )
}