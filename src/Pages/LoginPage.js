import React, { useState } from 'react';
// import {Link} from 'react-router-dom'
import { Signin } from '../Component/Login/Signin';
import { Signup } from '../Component/Login/Signup';
import '../Component/login.css';



export const LoginPage = (props) => {

    const [isSignup, setIsSignup ] = useState(false);
    //isSignup = False

    return(

        <div className='outside'>   
            {
                    isSignup === false //checks for boolean type and false
                    ? <Signin setIsSignup = { () => setIsSignup(true) } setToken={props.setToken}/>
                    : <Signup setIsSignin = { () => setIsSignup(false) }/>
                }

        </div>
       
    );
}