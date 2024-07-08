import React, { useState, useEffect } from 'react';

export const SecretInfo = ({prevSecret,updateSecret}) => {
    
    const [secret,setSecret] = useState(prevSecret);
    
    const handleTextChange = (event) => {
        setSecret(event.target.value);
        updateSecret(event.target.value)
    }

    useEffect(()=> {
        setSecret(prevSecret)
    }, [prevSecret]);


    
    return ( 
    <textarea className='secretInput' value={secret} onChange={handleTextChange} placeholder={'여기에 입력하는 정보는 클론 답변에 반영될 수 있지만, 연구자들은 열람하지 않습니다. 그러나 주민등록번호와 같은 민감한 개인 정보를 입력해야 할 경우, 해당 데이터를 수정하거나 마스킹 처리한 후에 입력하시기 바랍니다.'}></textarea>
    );






} 