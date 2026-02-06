'use client'

import React, { useEffect, useState } from "react"
import { handleLoginFormData } from "../lib/handlers"
import { login } from "../api/login"

export const LoginForm = () => {
    const [loginData, setLoginData] = useState(
        {
            username: '',
            password: '',
        }
    )
    
    return (
        <form onSubmit={(e: React.SubmitEvent<HTMLFormElement>) => login(e, loginData)} >
            <input type="text" placeholder="юз" onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleLoginFormData(e, 'username', setLoginData)}/>
            <input type="text" placeholder="пароль" onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleLoginFormData(e, 'password', setLoginData)}/>
            <button>войти</button>
        </form>
    )
}