
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Validate } from './validate';

export const Signup = (props) => {

    // values
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");

    const [errors, setErrors] = useState({});
    const [submitting, setSubmitting] = useState(false);

    const emailHandler = (e) => {
        e.preventDefault();
        setEmail(e.target.value);
    }

    const passwordHandler = (e) => {
        e.preventDefault();
        setPassword(e.target.value);
    }

    const submitHander = async (e) => {
        setSubmitting(true);
        e.preventDefault();
        await new Promise((r) => setTimeout(r, 1000));
        setErrors(Validate({ email, password }));
    }

    useEffect(() => {
        if (submitting) {
            if (Object.keys(errors).length === 0) {
                axios({
                    method: 'post',
                    url: '/signup',
                    data: {
                        email: email,
                        password: password
                    }
                });
                props.setIsSignin();
            }
            setSubmitting(false);
        }
    }, [errors]);


    return (
        <div className='signholder'>
            <form className='signupbox' onSubmit={submitHander}>
                <div className='signinTitle'>
                    🆕 회원가입: 새로운 계정 만들기 🆕
                </div>
                <input className='signInput' type="email" value={email} onChange={emailHandler} placeholder={'Username'} ></input>
                <input className='signInput' type="password" value={password} onChange={passwordHandler} placeholder={'Password'} ></input>
                <button className='loginBtn' type="submit">계정 생성하기</button>

            </form>

            <div className='buttonContainer'>
                이미 존재하나요?

                <button className='signBtn' onClick={() => props.setIsSignin()} >로그인</button>
            </div>




        </div>


    );

};
