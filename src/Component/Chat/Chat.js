import React, { useState, useEffect, useRef } from 'react';
import './Chat.css';
import { ChatBubble } from './chatbubble';

export const Chat = (props) => {
    const [chatlog, setChatlog] = useState(props.chatData);
    const [feedback, setFeedback] = useState("");
    const [triggerResponse, setTriggerResponse] = useState(false);
    const chatEndRef = useRef(null);
    const { className } = props;

    const handleFeedbackChange = (event) => {
        setFeedback(event.target.value);
    };

    const giveFeedback = () => {
        if(feedback !== "") {
            setChatlog([...chatlog, {"speaker":"instructor", "content": feedback}]);
            setTriggerResponse(true);
        }



    }

    const handleKeyPress = (event) => {
        if (event.key === 'Enter') { 
            giveFeedback();
        }
    }

    

    useEffect(() => {
        async function fetchData() {
            if (triggerResponse) {
                await props.getResponse(feedback);
                setTriggerResponse(false); // Reset trigger
                setFeedback("");
            }
        }
        fetchData();
    }, [triggerResponse]);

    useEffect(() => {
        setChatlog(props.chatData);
    }, [props.chatData]);


    useEffect(() => {
        if (chatEndRef.current) {
            chatEndRef.current.scrollIntoView({ behavior: 'smooth' });
        }
    }, [chatlog]);


    return (
        <>
            <div className={`chatUI`}>
                <div className='chatWindow'>
                    <div className={`chatContainer ${className}`}>
                        {chatlog.map((chat, index) => (
                            <ChatBubble
                                key={index}
                                logId={chat.logId}  // logId가 올바르게 설정되어 있는지 확인
                                speaker={chat.speaker}
                                cloneName={props.cloneName} 
                                content={chat.content}
                                image={props.profileImageUrl}
                                updateLog={props.updateLog}
                            />
                        ))}
                        <div ref={chatEndRef} />
                    </div>
                </div>
                {props.names}
                <div className='bottombar'>
                    <input value={feedback} onChange={handleFeedbackChange} onKeyPress={handleKeyPress}  placeholder='클론과 대화하기' />
                    <button className='chatBtn' onClick={giveFeedback} />
                </div>
            </div>
        </>
    );
}
