import React, { useState } from 'react';

export const ChatBubble = ({ speaker, content, cloneName, image, updateLog, logId }) => {
    const [isCloneContentVisible, setCloneContentVisible] = useState(false);
    const [isNotCloneContentVisible, setNotCloneContentVisible] = useState(false);
    const [confidence, setConfidence] = useState(-1);  // Initialize to -1 indicating no selection
    const [reason, setReason] = useState('');

    const handleCloneButtonClick = () => {
        setCloneContentVisible(true);
        setNotCloneContentVisible(false);
    };

    const handleNotCloneButtonClick = () => {
        setCloneContentVisible(false);
        setNotCloneContentVisible(true);
    };

    const handleSaveClick = () => {
        updateLog(logId, confidence, reason);  // Ensure logId is passed correctly
        setCloneContentVisible(false);
        setNotCloneContentVisible(false);
    };

    return (
        <>
            {speaker === "digital clone" ?
                <div className='clonechat'>
                    <div className='imgAndName'>
                        <img src={image} alt='logo' />
                        <h4> {cloneName} </h4>
                    </div>
                    <div className='chatbubble'>{content}</div>
                    <div className='clonebuttoncontainer'>
                        <button className='isClone' onClick={handleCloneButtonClick}>내 클론이다</button>
                        <button className='isNotClone' onClick={handleNotCloneButtonClick}>내 클론 아니다</button>
                    </div>
                    {isCloneContentVisible && (
                        <div className='additionalContent'>
                            <div className='additionalText'>1. 디지털 클론이 얼마나 나를 닮았나요?</div>
                            <div className='confidence-scale'>
                                {[0, 25, 50, 75, 100].map(value => (
                                    <button
                                        className={`confidenceBtn ${confidence === value ? 'selected' : ''}`}
                                        key={value}
                                        onClick={() => setConfidence(value)}
                                    >
                                        {`${value}%`}
                                    </button>
                                ))}
                            </div>
                           
                            <div className='additionalText2'>2. 그렇게 생각한 이유가 무엇인가요?</div>
                            <textarea
                                className='cloneReason'
                                placeholder='Type here'
                                value={reason}
                                onChange={e => setReason(e.target.value)}
                            ></textarea>
                            <div className='content-buttons'>
                                <button onClick={() => setCloneContentVisible(false)}>Cancel</button>
                                <button onClick={handleSaveClick}>Save</button>
                            </div>
                        </div>
                    )}
                    {isNotCloneContentVisible && (
                        <div className='additionalContent'>
                            <div className='additionalText'> 1. 왜 닮지 않았는지에 대한 이유와 피드백을 제공해주세요.</div>
                            <textarea
                                className='cloneReason'
                                placeholder='Type your feedback here'
                                value={reason}
                                onChange={e => setReason(e.target.value)}
                            ></textarea>
                            <div className='content-buttons'>
                                <button onClick={() => setNotCloneContentVisible(false)}>Cancel</button>
                                <button onClick={handleSaveClick}>Submit</button>
                            </div>
                        </div>
                    )}
                </div>
                :
                <div className='userchat'>
                    <div className='chatbubble'>{content}</div>
                </div>
            }
        </>
    );
};
