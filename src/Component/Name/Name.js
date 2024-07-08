// import React, {useState, useEffect} from 'react';

// export const Name = ({prevName,updateName}) => {

//     const [name,setName] = useState(prevName);

//     const handleTextChange = (event) => {
//         setName(event.target.value);
//         updateName(event.target.value)
//     }

//     useEffect(()=> {
//         setName(prevName)
//     }, [prevName]);


    
//     return(
//     <input className='nameInput' value={name} onChange={handleTextChange} placeholder={'Name your digital clone'} ></input>
//     );

// };

import React, { useState, useEffect } from 'react';

export const Name = ({ prevName, updateName, saveName }) => {
    const [name, setName] = useState(prevName);

    const handleTextChange = (event) => {
        setName(event.target.value);
    };

    const handleSave = () => {
        updateName(name);
        saveName(name);
        
    };

    useEffect(() => {
        setName(prevName);
    }, [prevName]);

    return (
        <div>
            <input 
                className='nameInput' 
                value={name} 
                onChange={handleTextChange} 
                placeholder={'디지털 클론의 이름을 입력해 주세요.'} 
            />

            <div className='bottom'> 
            <button className='saveBtn' onClick={handleSave}>Save</button>
            </div>
            
        </div>
    );
};
