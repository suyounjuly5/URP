import React, {useState,useEffect} from 'react';

export const Instruction = ({prevInstruction, updateInstruction }) => {
    const [instruction,setInstruction] = useState(prevInstruction)

    const handleTextChange = (event) => {
        setInstruction(event.target.value);
        updateInstruction(event.target.value)
    }

    useEffect(()=> {
        setInstruction(prevInstruction)
    }, [prevInstruction]);


    return(
        <textarea 
            className='instructionInput' 
            value={instruction} 
            onChange={handleTextChange} 
            placeholder={`디지털 클론이 반영해야 할 행동양상을 구체적으로 작성해 주세요. (어떠한 맥락에서 디지털 클론을 만드는지, 클론의 말투, 성격, 해야 할 행동방식과 하지 말아야 할 행동 양식 등)`}
        ></textarea>
    );
    
};