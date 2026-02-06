'use client'

import React, { useState } from "react"
import { handleRegisterFormData } from "../lib/handlers"
import { register } from "../api/register"

export const RegisterForm = () => {
    const [registerData, setRegisterData] = useState(
        {
            fullname: '',
            email: '',
            phoneNumber: '',
            username: '',
            password: '',
        }
    )
    
    return (
        <form onSubmit={(e: React.FormEvent<HTMLFormElement>) => register(e, registerData)} >
            <input type="text" placeholder="fullname" onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleRegisterFormData(e, 'fullname', setRegisterData)}/>
            <input type="text" placeholder="email" onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleRegisterFormData(e, 'email', setRegisterData)}/>
            <input type="text" placeholder="phoneNumber" onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleRegisterFormData(e, 'phoneNumber', setRegisterData)}/>
            <input type="text" placeholder="username" onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleRegisterFormData(e, 'username', setRegisterData)}/>
            <input type="text" placeholder="password" onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleRegisterFormData(e, 'password', setRegisterData)}/>
            <button>Регистрация</button>
        </form>
    )
}