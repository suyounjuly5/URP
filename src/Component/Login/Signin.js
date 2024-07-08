import React, { useState } from 'react';
import axios from 'axios';


export const Signin = (props) => {

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");


    const emailHandler = (e) => {
        e.preventDefault();
        setEmail(e.target.value);
    }

    const passwordHandler = (e) => {
        e.preventDefault();
        setPassword(e.target.value);
    }


    const submitHander = async (e) => {
        e.preventDefault();
        axios({
            method: 'post',
            url: '/token',
            data: {
                email: email,
                password: password
            }
        })
            .then((response) => {
                props.setToken(response.data.access_token) //여기 토큰사용
            }).catch((error) => {
                if (error.response) {
                    console.log(error.response)
                    console.log(error.response.status)
                    console.log(error.response.headers)
                }
            })
        setEmail("");
        setPassword("");
    }




    return (
        <div className='signholder'>
            <form className='signupbox' onSubmit={submitHander}>
                <div className='signinTitle'>
                    👤 Create My Digital Clone 👤
                </div>
                <input className='signInput' type="email" value={email} onChange={emailHandler} placeholder={'Username'} ></input>
                <input className='signInput' type="password" value={password} onChange={passwordHandler} placeholder={'Password'} ></input>
                <button className='loginBtn' type="submit">로그인</button>

            </form>

            <div className='buttonContainer'>
                회원가입

                <button className='signBtn' onClick={() => props.setIsSignup()} >계정만들기</button>
            </div>




        </div>


    );


};