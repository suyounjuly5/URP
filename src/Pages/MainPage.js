import React, { useState, useEffect } from 'react';
import axios from 'axios';
import '../Component/main.css';
import { Goal } from '../Component/Goal/Goal';
import { SecretInfo } from '../Component/secretInfo/SecretInfo';
import { Name } from '../Component/Name/Name';
import { Instruction } from '../Component/Instruction/Instruction';
import { Chat } from '../Component/Chat/Chat';

export const MainPage = (props) => {
    // 탭
    const [activeLeftTab, setActiveLeftTab] = useState('Tab1');
    const [activeRightTab, setActiveRightTab] = useState('Tab4');


    // 초기 상태
    const [names, setNames] = useState([""]);
    const [goals, setGoals] = useState(["", "", "", "", "", "", "", "", "", ""]);
    const [secrets, setSecrets] = useState([""]);
    const [instructions, setInstructions] = useState([""]);
    const [chatData, setChatData] = useState([]);
    const [profileImage, setProfileImage] = useState(null);
    const [profileImageUrl, setProfileImageUrl] = useState('/user.png');
    const [selectedFile, setSelectedFile] = useState(null);
    const [extractedText, setExtractedText] = useState('');
    const [similarLogs, setSimilarLogs] = useState([]);
    const [notSimilarLogs, setNotSimilarLogs] = useState([]);
    const [filteredChatData, setFilteredChatData] = useState([]); 
    const [currentDay, setCurrentDay] = useState(1);




    const openLeftTab = (tabName) => {
        setActiveLeftTab(tabName);
    };

    const openRightTab = (tabName,day) => {
        setActiveRightTab(tabName);
        setCurrentDay(day);
    };


    // 업데이트 핸들러
    const updateName = (i, newname) => {
        setNames(names => {
            const updateNames = [...names];
            updateNames[i] = newname;
            return updateNames;
        });
    };

    const updateGoal = (i, newgoal) => {
        setGoals(goals => {
            const updateGoals = [...goals];
            updateGoals[i] = newgoal;
            return updateGoals;
        });
    };

    const updateSecret = (i, newsecret) => {
        setSecrets(secrets => {
            const updateSecrets = [...secrets];
            updateSecrets[i] = newsecret;
            return updateSecrets;
        });
    };

    const updateInstruction = (i, newinstruction) => {
        setInstructions(instructions => {
            const updateInstructions = [...instructions];
            updateInstructions[i] = newinstruction;
            return updateInstructions;
        });
    };

    // 서버로 데이터 저장
    const saveNameToServer = (name) => {
        axios.post('http://127.0.0.1:5000/saveName', { names: [name] }, {
            headers: {
                Authorization: 'Bearer ' + props.token
            }
        })
        .then(response => {
            console.log('Name saved successfully:', response.data);
        })
        .catch(error => {
            console.error('Error saving name:', error);
        });
    };

    const handleFileChange = (event) => {
        const file = event.target.files[0];
        if (file) {
            setProfileImage(file); // 파일 객체를 저장
        }
    };

    const handleUpload = () => {
        if (profileImage) {
            uploadProfileImage(profileImage, props.token)
                .then(file_url => {
                    setProfileImageUrl(file_url); // 서버에서 반환된 URL로 상태 업데이트
                })
                .catch(error => {
                    console.error('Error uploading file:', error);
                });
        }
    };

    function uploadProfileImage(file, token) {
        const formData = new FormData();
        formData.append('profileImage', file);
    
        return axios.post('http://127.0.0.1:5000/uploadProfileImage', formData, {
            headers: {
                Authorization: 'Bearer ' + token,
                'Content-Type': 'multipart/form-data'
            }
        })
        .then(response => {
            console.log('File uploaded successfully:', response.data);
            return response.data.file_url;
        })
        .catch(error => {
            console.error('Error uploading file:', error);
            throw error;
        });
    }
    
    // PDF 처리
    const handleFileSelection = (e) => {
        const pdf = e.target.files[0];
        if (pdf) {
            setSelectedFile(pdf);
        }
    };

    const handleFileUpload = async (e) => {
        e.preventDefault();
        const formData = new FormData();
        formData.append('file', selectedFile);

        try {
            const response = await axios.post('/api/upload_pdf', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                    'Authorization': 'Bearer ' + props.token // Ensure token is included
                },
            });
            setExtractedText(response.data.text);
        } catch (error) {
            console.error('Error uploading file', error);
        }
    };


    const filterChatData = (data, day) => {
        const filteredData = data.filter(chat => chat.day === day);
       // console.log("Filtering data for day:", day);
       // console.log("Original data:", data);
       // console.log("Filtered data:", filteredData);
        setFilteredChatData(filteredData);
    };


    // 데이터 가져오기
    function getData() {
        axios({
            method: "GET",
            url: "http://127.0.0.1:5000/getData",
            headers: {
                Authorization: 'Bearer ' + props.token
            },
            params: {
                day: currentDay  // currentDay 값을 쿼리 파라미터로 추가
            }

        })
        .then((response) => {
            const res = response.data;
            console.log("Chat Data:", res.chatData);  // 콘솔에 업데이트된 chatData 출력
            setNames(res.names);
            setGoals(res.goals);
            setSecrets(res.secrets);
            setInstructions(res.instructions);
            setChatData(res.chatData);  // logId 포함된 데이터 설정
            filterChatData(res.chatData, currentDay);
            if (res.image) {
                setProfileImageUrl(res.image);
            }
            if (res.pdf) {
                setExtractedText(res.pdf);
            }
        })
        .catch((error) => {
            if (error.response) {
                console.log(error.response);
                console.log(error.response.status);
                console.log(error.response.headers);
            }
            axios({
                method: "POST",
                url: "/logout",
            })
            .then((response) => {
                props.removeToken();
            })
            .catch((error) => {
                if (error.response) {
                    console.log(error.response);
                    console.log(error.response.status);
                    console.log(error.response.headers);
                }
            });
        });
    }

    function saveGoals() {
        axios({
            method: "POST",
            url: "http://127.0.0.1:5000/saveGoals",
            headers: {
                Authorization: 'Bearer ' + props.token
            },
            data: { goals: goals },
        })
        .then((response) => {
        })
        .catch((error) => {
            if (error.response) {
                console.log(error.response);
                console.log(error.response.status);
                console.log(error.response.headers);
            }
        });
        console.log("click1!")
    };

    function saveSecrets() {
        axios({
            method: "POST",
            url: "http://127.0.0.1:5000/saveSecret",
            headers: {
                Authorization: 'Bearer ' + props.token
            },
            data: { secrets: secrets },
        })
        .then((response) => {
        })
        .catch((error) => {
            if (error.response) {
                console.log(error.response);
                console.log(error.response.status);
                console.log(error.response.headers);
            }
        });
        console.log("click2!")
    };

    function saveInstructions() {
        axios({
            method: "POST",
            url: "http://127.0.0.1:5000/saveInstructions",
            headers: {
                Authorization: 'Bearer ' + props.token
            },
            data: { instructions: instructions },
        })
        .then((response) => {
        })
        .catch((error) => {
            if (error.response) {
                console.log(error.response);
                console.log(error.response.status);
                console.log(error.response.headers);
            }
        });
        console.log("click!")
    };

    function getResponse(feedback) {
        console.log("Current Day:", currentDay); 
        axios({
            method: "POST",
            url: "http://127.0.0.1:5000/response",
            headers: {
                Authorization: 'Bearer ' + props.token,
                
            },
            data: { feedback: feedback,
                    day: currentDay}
            
        })
        .then((response) => {
            const res = response.data;
            console.log(res.response);
    
            // 생성된 logId를 저장합니다.
            const logId = res.logId;
    
            // 새로운 로그 항목을 생성하고 나서 추가 동작을 수행합니다.
            setChatData([...chatData,
                { "logId": logId, "speaker": "user", "content": feedback,"day": currentDay },
                { "logId": logId, "speaker": "digital clone", "content": res.response, "confidence": -1, "reason": "", "day": currentDay }
            ]);
        }).catch((error) => {
            if (error.response) {
                console.log(error.response);
                console.log(error.response.status);
                console.log(error.response.headers);
            }
        });
        console.log("click!!!!!");
    }

    function updateLog(logId, confidence, reason) {
        axios({
            method: "POST",
            url: "http://127.0.0.1:5000/update_log",
            headers: {
                Authorization: 'Bearer ' + props.token
            },
            data: {
                log_id: logId,
                confidence: confidence,
                reason: reason
            },
        })
        .then((response) => {
            const res = response.data;
            console.log(res.message);
    
            // 업데이트된 chatData를 반영하여 상태를 업데이트합니다.
            setChatData(prevChatData => {
                const updatedChatData = prevChatData.map(chat => {
                    if (chat.logId === logId && chat.speaker === "digital clone") {
                        return {
                            ...chat,
                            confidence: confidence,
                            reason: reason
                        };
                    }
                    return chat;
                });

                const newSimilarLogs = updatedChatData
                .filter(chat => chat.confidence > 0)
                .sort((a, b) => b.confidence - a.confidence);

                setSimilarLogs(newSimilarLogs);

                // 클론과 유사하지 않은 로그 업데이트
                const newNotSimilarLogs = updatedChatData
                .filter(chat => chat.confidence === -1 && chat.reason !== "");

                setNotSimilarLogs(newNotSimilarLogs);

               // console.log("Updated Chat Data:", updatedChatData);  // 콘솔에 업데이트된 chatData 출력
               // console.log("Similar Logs:", newSimilarLogs);
               // console.log("Not Similar Logs:", newNotSimilarLogs);
                sendLogsToBackend(newSimilarLogs, newNotSimilarLogs)
                return updatedChatData;
            });
        }).catch((error) => {
            if (error.response) {
                console.log(error.response);
                console.log(error.response.status);
                console.log(error.response.headers);
            }
        });
        console.log("click!!!!!");
    }

    function sendLogsToBackend(similarLogs, notSimilarLogs) {
        axios({
            method: "POST",
            url: "http://127.0.0.1:5000/update_log_lists",
            headers: {
                Authorization: 'Bearer ' + props.token
            },
            data: {
                similar_logs: similarLogs,
                not_similar_logs: notSimilarLogs
            },
        })
        .then((response) => {
            console.log('Logs sent to backend successfully:', response.data);
        }).catch((error) => {
            console.error('Error sending logs to backend:', error);
        });
    }

    function logout() {
        axios({
            method: "POST",
            url: "/logout",
        })
        .then((response) => {
           props.removeToken();
        }).catch((error) => {
          if (error.response) {
            console.log(error.response);
            console.log(error.response.status);
            console.log(error.response.headers);
          }
        });
    }

    // 새로고침 후 db 저장된거 뜨게하는 부분
    useEffect(() => {
        getData();
    }, []);

    useEffect(() => {
        filterChatData(chatData, currentDay);
    }, [chatData, currentDay]);

    return (
        <div className='mainPage'>
            <div className='left-side'>
                <div className="leftTopTab">
                    <button className={`tablinks ${activeLeftTab === 'Tab1' ? 'active' : ''}`} onClick={() => openLeftTab('Tab1')}>Configure</button>
                    <button className={`tablinks ${activeLeftTab === 'Tab2' ? 'active' : ''}`} onClick={() => openLeftTab('Tab2')}>Checklists</button>
                    <button className={`tablinks ${activeLeftTab === 'Tab3' ? 'active' : ''}`} onClick={() => openLeftTab('Tab3')}>Personal Information</button>
                </div>

                <div id="Tab1" className={`tabcontent ${activeLeftTab === 'Tab1' ? 'active' : ''}`}>
                    <div className="fixInput">
                        <div className="profilePic" onClick={() => document.getElementById('fileInput').click()}>
                            <img src={profileImageUrl} alt="Profile" />
                            <input
                                id="fileInput"
                                type="file"
                                style={{ display: 'none' }}
                                onChange={handleFileChange}
                            />
                        </div>
                        <button className='saveimgBut' onClick={handleUpload}>Save</button> {/* 업로드 버튼 추가 */}
                    </div>
        
                    <div className='nameTitle'>
                        <h4>Name</h4> 
                        <Name prevName={names[0]} updateName={(newname) => updateName(0, newname)} saveName={saveNameToServer} />
                    </div>

                    <div className='bottom'>
                    </div>

                    <div className='"instruction'>
                        <div className='instructionName'>
                            <h4> Instruction </h4>
                            <Instruction prevInstruction={instructions[0]} updateInstruction={(newinstruction) => updateInstruction(0, newinstruction)} />
                        </div>
                        <div className='bottom'> 
                            <button className='saveBtn' onClick={saveInstructions} type="submit">Save</button>
                        </div>
                    </div>
                </div>

                <div id="Tab2" className={`tabcontent ${activeLeftTab === 'Tab2' ? 'active' : ''}`}>
                    <div className='goalpage'>
                        <h4> Goals</h4>
                        
                        <Goal num={1} prevGoal={goals[0]} updateGoal={(newgoal) => updateGoal(0, newgoal)} />
                        <Goal num={2} prevGoal={goals[1]} updateGoal={(newgoal) => updateGoal(1, newgoal)} />
                        <Goal num={3} prevGoal={goals[2]} updateGoal={(newgoal) => updateGoal(2, newgoal)} />
                        <Goal num={4} prevGoal={goals[3]} updateGoal={(newgoal) => updateGoal(3, newgoal)} />
                        <Goal num={5} prevGoal={goals[4]} updateGoal={(newgoal) => updateGoal(4, newgoal)} />
                        <Goal num={6} prevGoal={goals[5]} updateGoal={(newgoal) => updateGoal(5, newgoal)} />
                        <Goal num={7} prevGoal={goals[6]} updateGoal={(newgoal) => updateGoal(6, newgoal)} />
                        <Goal num={8} prevGoal={goals[7]} updateGoal={(newgoal) => updateGoal(7, newgoal)} />
                        <Goal num={9} prevGoal={goals[8]} updateGoal={(newgoal) => updateGoal(8, newgoal)} />
                        <Goal num={10} prevGoal={goals[9]} updateGoal={(newgoal) => updateGoal(9, newgoal)} />
                    </div>

                    <div className='bottom'> 
                        <button className='saveBtn' onClick={saveGoals} type="submit">Save</button>
                    </div>
                </div>

                <div id="Tab3" className={`tabcontent ${activeLeftTab === 'Tab3' ? 'active' : ''}`}>
                    <div className='secretName'>
                        <h4> Secret Information </h4>
                        <SecretInfo prevSecret={secrets[0]} updateSecret={(newsecret) => updateSecret(0, newsecret)} />
                    </div>

                    <div className='bottom'> 
                        <button className='saveBtn' onClick={saveSecrets} type="submit">Save</button>
                    </div>

                    <section>
                        <h4>Upload PDF</h4>
                        <form onSubmit={handleFileUpload}>
                            <input type="file" onChange={handleFileSelection} />
                            <button type="submit">Save</button>
                        </form>
                        {extractedText && (
                            <div>
                                <h4>PDF Uploaded</h4>
                                <p>{extractedText}</p>
                            </div>
                        )}
                    </section>
                </div>
            </div>

            <div className='right-side'>
                <div className='rightTopTab'> 
                    <button className={`tablinks ${activeRightTab === 'Tab4' ? 'active' : ''}`} onClick={() => openRightTab('Tab4',1)}>Day 1</button>
                    <button className={`tablinks ${activeRightTab === 'Tab5' ? 'active' : ''}`} onClick={() => openRightTab('Tab5',2)}>Day 2</button>
                    <button className={`tablinks ${activeRightTab === 'Tab6' ? 'active' : ''}`} onClick={() => openRightTab('Tab6',3)}>Day 3</button>
                    <button className={`tablinks ${activeRightTab === 'Tab7' ? 'active' : ''}`} onClick={() => openRightTab('Tab7',4)}>Day 4</button>
                    <button className={`tablinks ${activeRightTab === 'Tab8' ? 'active' : ''}`} onClick={() => openRightTab('Tab8',5)}>Day 5</button>
                    <button className={`tablinks ${activeRightTab === 'Tab9' ? 'active' : ''}`} onClick={() => openRightTab('Tab9',6)}>Day 6</button>
                    <button className={`tablinks ${activeRightTab === 'Tab10' ? 'active' : ''}`} onClick={() => openRightTab('Tab10',7)}>Day 7</button>
                    <button className='Logout' onClick={logout} type='submit'>Logout</button>
                </div>

                <div id="Tab4" className={`tabcontent ${activeRightTab === 'Tab4' ? 'active' : ''}`}>
                    <h4>Day 1 Chat</h4>
                    {chatData ? <Chat token={props.token} chatData={filteredChatData} updateLog={updateLog} cloneName={names[0]} profileImageUrl={profileImageUrl} getResponse={(feedback) => getResponse(feedback)} /> : <>loading</>}
                    
                </div>

                <div id="Tab5" className={`tabcontent ${activeRightTab === 'Tab5' ? 'active' : ''}`}>
                    <h4>Day 2 Chat</h4>
                    {chatData ? <Chat token={props.token} chatData={filteredChatData} updateLog={updateLog} cloneName={names[0]} profileImageUrl={profileImageUrl} getResponse={(feedback) => getResponse(feedback)} /> : <>loading</>}
                
                </div>


                <div id="Tab6" className={`tabcontent ${activeRightTab === 'Tab6' ? 'active' : ''}`}>
                    <h4>Day 3 Chat</h4>
                    {chatData ? <Chat token={props.token} chatData={filteredChatData} updateLog={updateLog} cloneName={names[0]} profileImageUrl={profileImageUrl} getResponse={(feedback) => getResponse(feedback)} /> : <>loading</>}
        
                </div>

                <div id="Tab7" className={`tabcontent ${activeRightTab === 'Tab7' ? 'active' : ''}`}>
                    <h4>Day 4 Chat</h4>
                    {chatData ? <Chat token={props.token} chatData={filteredChatData} updateLog={updateLog} cloneName={names[0]} profileImageUrl={profileImageUrl} getResponse={(feedback) => getResponse(feedback)} /> : <>loading</>}
                    
                </div>

                <div id="Tab8" className={`tabcontent ${activeRightTab === 'Tab8' ? 'active' : ''}`}>
                    <h4>Day 5 Chat</h4>
                    {chatData ? <Chat token={props.token} chatData={filteredChatData} updateLog={updateLog} cloneName={names[0]} profileImageUrl={profileImageUrl} getResponse={(feedback) => getResponse(feedback)} /> : <>loading</>}
                    
                </div>

                <div id="Tab9" className={`tabcontent ${activeRightTab === 'Tab9' ? 'active' : ''}`}>
                    <h4>Day 6 Chat</h4>
                    {chatData ? <Chat token={props.token} chatData={filteredChatData} updateLog={updateLog} cloneName={names[0]} profileImageUrl={profileImageUrl} getResponse={(feedback) => getResponse(feedback)} /> : <>loading</>}
                   
                </div>

                <div id="Tab10" className={`tabcontent ${activeRightTab === 'Tab10' ? 'active' : ''}`}>
                    <h4>Day 7 Chat</h4>
                    {chatData ? <Chat token={props.token} chatData={chatData} updateLog={updateLog} cloneName={names[0]} profileImageUrl={profileImageUrl} getResponse={(feedback) => getResponse(feedback)} /> : <>loading</>}
                    
                </div>
            </div>
        </div>
    );
};
