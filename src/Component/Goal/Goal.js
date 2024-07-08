import React, { useState,useEffect } from 'react';

export const Goal = ({num,prevGoal,updateGoal}) => {
    
    const [goal,setGoal] = useState(prevGoal);

    const handleTextChange = (event) => {
        setGoal(event.target.value);
        updateGoal(event.target.value)
    }

    useEffect(()=> {
        setGoal(prevGoal)
    }, [prevGoal]);

    
    return(
        <input className='goalInput' key = {num}  value={goal} onChange={handleTextChange} placeholder={ "#" + num + ' 디지털 클론을 통해 달성하고자 하는 목표를 입력해 주세요.'} ></input>
    );
}