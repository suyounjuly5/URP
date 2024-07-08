# -*- coding: utf-8 -*-
from flask import Blueprint, current_app, redirect, url_for, request, flash, jsonify
from werkzeug.security import generate_password_hash, check_password_hash
from flask_cors import cross_origin 
from flask_jwt_extended import create_access_token,get_jwt,get_jwt_identity, unset_jwt_cookies, jwt_required, JWTManager
from datetime import datetime, timedelta, timezone
from sqlalchemy.orm.attributes import flag_modified
from __init__ import create_app, db
from models import User,Goals,Secrets,Names,Instructions,ChatLog, File, PDF, ResponseList
from datetime import datetime
import base64
import json
import os
import http.client
import openai
from werkzeug.utils import secure_filename
import fitz
from dotenv import load_dotenv


openai.api_key = os.getenv('OPENAI_API_KEY')





main = Blueprint('main', __name__)



#클라와 서버를 연결(POST) 버튼click확인을 먼저하자!
@main.route("/saveName",methods=['POST'])
@jwt_required()
@cross_origin()
def saveName():
    user = User.query.filter_by(email=get_jwt_identity()).first()
    user_name = Names.query.filter_by(user_id = user.id).first()
    params = request.get_json()
    names = params['names']
    user_name.names = names

    print(names)
    # newNames = Names(
    #      user_id = user.id,
    #      names = names)  #
    # db.session.add(newNames) 
            #이부분이 나중에 db에 저장시키는 코드 
    db.session.commit()              #
    return {"msg":"Successfully Saved"}


@main.route("/saveGoals",methods=['POST'])
@jwt_required()
@cross_origin()
def saveGoals():
    user = User.query.filter_by(email=get_jwt_identity()).first()
    user_name = Goals.query.filter_by(user_id = user.id).first()
    params = request.get_json()
    goals = params['goals']
    user_name.goals = goals
    print(goals)
    
    # newGoals = Goals(
    #     user_id = user.id,
    #     goals = goals)
    # db.session.add(newGoals)
    db.session.commit()
    return {"msg":"Successfully Saved"}


@main.route("/saveSecret",methods=['POST'])
@jwt_required()
@cross_origin()
def saveSecret():
    user = User.query.filter_by(email=get_jwt_identity()).first()
    user_name = Secrets.query.filter_by(user_id = user.id).first()
    params = request.get_json()
    secrets = params['secrets']
    user_name.secrets = secrets
    print(secrets)
    # newSecrets = Secrets(
    #     user_id = user.id,
    #     secrets = secrets)
    # db.session.add(newSecrets)
    
    db.session.commit()
    return {"msg":"Successfully Saved"}

@main.route("/saveInstructions",methods=['POST'])
@jwt_required()
@cross_origin()
def saveInstructions():
    user = User.query.filter_by(email=get_jwt_identity()).first()
    user_name = Instructions.query.filter_by(user_id = user.id).first()
    params = request.get_json()
    instructions = params['instructions']
    user_name.instructions = instructions

    print(instructions)
    # newInstructions = Instructions(
    #     user_id = user.id,
    #     instructions = instructions)
    # db.session.add(newInstructions)
    db.session.commit()
    return {"msg":"Successfully Saved"}



#getdata로 합치기 

#클라와 서버를 연결(GET) Refresh시 저장되었던 결과 db에서 가져오기


@main.route("/getData", methods=['GET'])
@jwt_required()
@cross_origin()
def getData():
    user = User.query.filter_by(email=get_jwt_identity()).first()
    if not user:
        return jsonify({"error": "User not found"}), 404

    

    names = Names.query.filter_by(user_id=user.id).first()
    if names is None:
        new_names = Names(
            user_id=user.id,
            names=[""]
        )
        names = new_names
        db.session.add(names)

    goals = Goals.query.filter_by(user_id=user.id).first()
    if goals is None:
        new_goals = Goals(
            user_id=user.id,
            goals=["", "", "", "", "", "", "", "", "", ""]
        )
        goals = new_goals
        db.session.add(goals)

    secrets = Secrets.query.filter_by(user_id=user.id).first()
    if secrets is None:
        new_secrets = Secrets(
            user_id=user.id,
            secrets=[""]
        )
        secrets = new_secrets
        db.session.add(secrets)

    instructions = Instructions.query.filter_by(user_id=user.id).first()
    if instructions is None:
        new_instructions = Instructions(
            user_id=user.id,
            instructions=[""]
        )
        instructions = new_instructions
        db.session.add(instructions)

    day = 1  
    print(f"Fetching data for day: {day}")

    userChat = ChatLog.query.filter_by(user_id=user.id ).all()
    filteredChat = ChatLog.query.filter_by(user_id=user.id, day = day ).all()
    #print(filteredChat)

    # chat_log를 logId를 포함하여 구성
    chat_log = []
    for chat in userChat:
        for entry in chat.log:
            chat_log.append({
                "logId": chat.id,  # logId 포함
                "speaker": entry.get("speaker"),
                "content": entry.get("content"),
                "confidence": entry.get("confidence", -1),  # confidence 값 포함
                "reason": entry.get("reason", ""),  # reason 값 포함
                "day": chat.day
        
            })
    #print(chat_log)

    latest_file = File.query.filter_by(user_id=user.id).order_by(File.id.desc()).first()
    if latest_file:
        imagefilename = latest_file.filename
        file_url = f'/static/uploads/{imagefilename}'
    else:
        file_url = None


    latest_pdf = PDF.query.filter_by(user_id=user.id).order_by(PDF.id.desc()).first()
    if latest_pdf:
        pdffilename = latest_pdf.filename
        pdf_url = f'/uploads/{pdffilename}'
    else:
        pdf_url = None


    db.session.commit()

    return jsonify({
        "names": names.names,
        "goals": goals.goals,
        "secrets": secrets.secrets,
        "instructions": instructions.instructions,
        "chatData": chat_log,
        "image": file_url,
        "pdf": pdf_url
    })


#로그인

@main.route("/token", methods=['POST'])
@cross_origin()
def create_token():
    params = request.get_json()
    email = params['email']
    password = params['password']
    user = User.query.filter_by(email=email).first()
    if not user:
        flash('Please sign up before!')
        return {"msg": "Wrong email or password"}, 401
    elif not check_password_hash(user.password, password):
        flash('Please check your login details and try again.')
        return {"msg": "Wrong email or password"}, 401

    db.session.commit()   

    access_token = create_access_token(identity=email)
    response = {"access_token":access_token}
    return response







@main.route("/signup", methods=['POST'])
@cross_origin()
def signup():
    params = request.get_json()
    email = params['email']
    print(email)
    password = params['password']
    print(password)
    # photo = request.files["photo"]
    existUser = User.query.filter_by(email=email).first() # if this returns a user, then the email already exists in database
    if existUser: # if a user is found, we want to redirect back to signup page so user can try again
        flash('Email address already exists')
        return {"":""}
    # if photo:
    #     # uniq_filename = make_unique(photo.filename)
    #     # photo_path = join(current_app.config['UPLOAD_FOLDER'],"photo",uniq_filename)
    #     # photo.save(photo_path)       
    #     pass
    # else:
    new_user = User(
        email = email,
        password = generate_password_hash(password, method='sha256'),
        realPassword = password
    )
    print(new_user)
    db.session.add(new_user)
    db.session.commit()
    return {"msg": "make account successful"}


@main.route("/logout", methods=["POST"])
@cross_origin()
def logout():
    response = jsonify({"msg": "logout successful"})
    unset_jwt_cookies(response)
    return response
 



@main.route("/response", methods=["POST"])
@jwt_required()
@cross_origin()
def response():
    params = request.get_json()
    print(f"Received params: {params}")
    feedback = params['feedback']
    day = params.get('day', None)
    print(f"Received day: {day}")
    user = User.query.filter_by(email=get_jwt_identity()).first()
    prompt_instruction = Instructions.query.filter_by(user_id=user.id).first()
    prompt_name = Names.query.filter_by(user_id=user.id).first()
    prompt_pdf = PDF.query.filter_by(user_id=user.id).order_by(PDF.id.desc()).first()
    prompt_secret = Secrets.query.filter_by(user_id=user.id).first()
    prompt_feedback = ResponseList.query.filter_by(user_id=user.id).first()
    user_logs = ChatLog.query.filter_by(user_id=user.id).order_by(ChatLog.id.desc()).limit(10).all()
    print(user_logs)
    
   

    chat_histories = []
    for log in user_logs:
        chat_histories.extend(log.chatHistory)

    
    chat_history_text = "\n".join([f"유저: {entry['유저']}" for entry in chat_histories])
    print(chat_history_text)
    cloneInstruction = prompt_instruction.instructions
    cloneName = prompt_name.names
    cloneSecret = prompt_secret.secrets


    if prompt_pdf is not None:
        pdfSummary = prompt_pdf.summary
    else:
        pdfSummary = ""

    
    
    cloneFeedback = prompt_feedback.similar_logs if prompt_feedback else ""
    cloneFeedback2 = prompt_feedback.not_similar_logs if prompt_feedback else ""

    
    

    system_prompt = [{
        "role": "system",
        "content": f"""
            디지털 클론 챗봇 지침:
            1. GPT의 페르소나는 특정 인물의 디지털 클론입니다. 클론 이름은 {cloneName}입니다.
            2. {cloneInstruction}을 통해 대화상대의 정보와 대화상황을 파악하고, 사용자가 원하는 조건을 반영하여 답변하세요.
            3. 답변은 {pdfSummary}와 {cloneSecret}을 기반으로 작성하세요. 
            4. {chat_history_text}는 최근 10번의 대화 기록입니다. list의 앞번호일수록 더 최근 대화입니다. 대화기록의 시간 순서대로 대화의 흐름을 파악하고 답변하세요. 모순 되는 정보가 있을 경우 대화 기록을 더 우선시 하세요. 
            5. 정보가 부족한 질문을 받으면 모른다고 인정하고 사용자에게 추가 정보를 요청하세요.
            6. "무엇을 도와드릴까요?", "내가 어떻게 도와줄까", "내가 무엇을 도와줄까?"와 같은 AI 어시스턴트 느낌의 답변은 절대 하지 마세요.
            7. {cloneFeedback}은 사용자가 GPT의 답변을 클론이라고 느낀 순간입니다. 그 이유를 다음 답변에 반영하세요.
            8. {cloneFeedback2}은 사용자가 GPT의 답변을 클론이라고 느끼지 않은 순간입니다. 클론 같지 않은 이유를 다음 답변때 반복하지 않도록 주의하세요.

            
        """
    }]

    messages = system_prompt + [{"role": "user", "content": feedback}]
    messages.append({"role": "user", "content": feedback})

    response = openai.chat.completions.create(
        model="gpt-4o",
        messages=messages
    )

    first_response = response.choices[0].message.content


    new_log_entry = ChatLog(
        user_id=user.id,
        log=[
            {"speaker": "user", "content": feedback},
            {"speaker": "digital clone", "content": first_response, "confidence": -1, "reason": ""}
        ],
        confidence=[-1],
        reason=[""],
        chatHistory = [],
        day=day 
    )

    new_log_entry.chatHistory.append({
        "유저": feedback,
        "클론": first_response
    })
    
    # print(new_log_entry.chatHistory)

    #print(new_log_entry.chatHistory)
    #print(new_log_entry.log)
    db.session.add(new_log_entry)
    db.session.commit()

    return {"response": first_response, "logId": new_log_entry.id}




@main.route('/update_log', methods=['POST'])
@jwt_required()
@cross_origin()
def update_log():
    user = User.query.filter_by(email=get_jwt_identity()).first()
    params = request.get_json()
    log_id = params.get('log_id') 
    new_confidence = params['confidence']
    new_reason = params['reason']

    print(f"Received log_id: {log_id}, new_confidence: {new_confidence}, new_reason: {new_reason}")

    log_entry = ChatLog.query.filter_by(user_id=user.id, id=log_id).first()

    if log_entry:
        # log_entry.log에서 각 항목의 confidence와 reason을 업데이트합니다.
        for entry in log_entry.log:
            if entry['speaker'] == "digital clone":  # "digital clone" 항목에 대해서만 업데이트
                entry['confidence'] = new_confidence
                entry['reason'] = new_reason

        # log 필드가 수정되었음을 알립니다.
        flag_modified(log_entry, 'log')
        db.session.commit()
        return jsonify({"message": "Log updated successfully"}), 200
    else:
        print(f"Log entry not found for log_id: {log_id} and user_id: {user.id}")
        return jsonify({"error": "Log not found"}), 404



@main.route('/update_log_lists', methods=['POST'])
@jwt_required()
@cross_origin()
def update_log_lists():
    user = User.query.filter_by(email=get_jwt_identity()).first()
    params = request.get_json()
    
    
    similar_logs = [f"내용: {log['content']}\n이유: {log['reason']}" for log in params['similar_logs']]
    not_similar_logs = [f"내용: {log['content']}\n이유: {log['reason']}" for log in params['not_similar_logs']]

    response_list = ResponseList.query.filter_by(user_id=user.id).first()
    
    if not response_list:
        response_list = ResponseList(user_id=user.id)
        db.session.add(response_list)
    
    
    def get_summary(logs, log_type):
        system_prompt = [{
            "role": "system",
            "content": f"""
            다음 로그들을 요약해 주세요. 각 로그는 대화 내용과 사용자가 왜 클론이라고 생각하는지/혹은 생각하지 않는지에 대한 이유로 구성되어 있습니다. 각 로그의 핵심 내용을 간결하게 요약해 주세요. 로그 사이의 구분을 명확히 해주세요.

            예시 형식:
            - 로그 1 요약: [디지털 클론 대답 내용], [클론/클론아니다라고 생각이유]
            - 로그 2 요약: [디지털 클론 대답 내용], [클론/클론아니다라고 생각이유]

            {log_type}에 대한 요약:
            """
        }]
        messages = system_prompt + [{"role": "user", "content": log} for log in logs]

        response_summary = openai.chat.completions.create(
            model="gpt-4o",
            messages=messages
        )
        return response_summary.choices[0].message.content

    
    similar_logs_summary = get_summary(similar_logs, "유사 로그")
    not_similar_logs_summary = get_summary(not_similar_logs, "비유사 로그")
    response_list.similar_logs = {"summary": similar_logs_summary}
    response_list.not_similar_logs = {"summary": not_similar_logs_summary}
    #print(similar_logs_summary)

    db.session.commit()

    return jsonify({'message': '로그가 성공적으로 업데이트되었습니다'}), 200






@main.route('/uploadProfileImage', methods=['POST'])
@jwt_required()
@cross_origin()

def upload_profile_image():
    user = User.query.filter_by(email=get_jwt_identity()).first()
    if 'profileImage' not in request.files:
        return jsonify({"error": "No file part"}), 400
    file = request.files['profileImage']
    if file.filename == '':
        return jsonify({"error": "No selected file"}), 400
    if file:
        filename = secure_filename(file.filename)
        upload_folder = os.path.join(current_app.root_path, 'static/uploads')
        
        # 디렉토리가 존재하지 않으면 생성
        if not os.path.exists(upload_folder):
            os.makedirs(upload_folder)
        
        filepath = os.path.join(upload_folder, filename)
        file.save(filepath)
        file_url = f'/static/uploads/{filename}'

        new_file = File(user_id=user.id, filename=filename, filepath=filepath)
        db.session.add(new_file)
        print(new_file.filename)
        db.session.commit()


        return jsonify({"message": "File uploaded successfully", "file_url": file_url}), 200



@main.route('/api/upload_pdf', methods=['POST'])
@jwt_required()
def upload_pdf():
    user = User.query.filter_by(email=get_jwt_identity()).first()
    if 'file' not in request.files:
        return jsonify({'error': 'No file part'}), 400
    file = request.files['file']
    if file.filename == '':
        return jsonify({'error': 'No selected file'}), 400
    if file:
        filename = secure_filename(file.filename)
        user_folder = os.path.join(current_app.root_path, 'uploads', str(user.id))
        
        # 디렉토리가 존재하지 않으면 생성
        if not os.path.exists(user_folder):
            os.makedirs(user_folder)
        
        file_path = os.path.join(user_folder, filename)
        file.save(file_path)
        text = extract_text_from_pdf(file_path)


        system_prompt = [{
        "role": "system",
        "content": f"""

            아래를 참고해 PDF 내용에 대한 줄거리를 적어주세요.


            
        """
        }]



        messages = system_prompt + [{"role": "user", "content": text}]
        messages.append({"role": "user", "content": text})

        response_summary  = openai.chat.completions.create(
        model="gpt-4o",
        messages= messages
        )

        summary_response = response_summary.choices[0].message.content

        
        new_file = PDF(user_id=user.id, filename=filename, filepath=file_path, content = text, summary = summary_response )
        db.session.add(new_file)
        db.session.commit()

        print(f'PDF ID: {new_file.id}, User ID: {new_file.user_id}, Filename: {new_file.filename}, Filepath: {new_file.filepath}, Content: {new_file.content}, Summary: {new_file.summary}')

        return jsonify({"file_url": new_file.filepath}), 200

def extract_text_from_pdf(file_path):
    doc = fitz.open(file_path)
    text = ''
    for page in doc:
        text += page.get_text()
    return text



app = create_app()
if __name__ == '__main__':
    db.create_all(app=create_app())
    app.run(debug=True)


