from flask_login import UserMixin
from __init__ import db

class User(UserMixin, db.Model):
    id = db.Column(db.Integer, primary_key=True) # primary keys are required by SQLAlchemy
    email = db.Column(db.String(100), unique=True)
    password = db.Column(db.String(100))
    realPassword = db.Column(db.String(100))
   

class Names(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    names = db.Column(db.JSON)

class Goals(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    goals = db.Column(db.JSON)

class Secrets(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    secrets = db.Column(db.JSON)

class Instructions(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    instructions = db.Column(db.JSON)


class ChatLog(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    log = db.Column(db.JSON, nullable=False)
    confidence = db.Column(db.JSON, nullable=True)
    reason = db.Column(db.JSON, nullable=True)
    chatHistory = db.Column(db.JSON, nullable=False)
    day = db.Column(db.Integer, nullable=False, default=1)

class ResponseList(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    similar_logs = db.Column(db.JSON)
    not_similar_logs = db.Column(db.JSON)
    


    
class File(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, nullable=False)
    filename = db.Column(db.String(100), nullable=False)
    filepath = db.Column(db.String(200), nullable=False)
    #foreign key?    

class PDF(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, nullable=False)
    filename = db.Column(db.String(100), nullable=False)
    filepath = db.Column(db.String(200), nullable=False)
    content = db.Column(db.String(200), nullable=False)
    summary = db.Column(db.String(200), nullable=False)
    #foreign key?    
    


# class Note(db.Model):
#     id = db.Column(db.Integer, primary_key=True) # primary keys are required by SQLAlchemy
#     user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
#     content = db.Column(db.String(100))
#     position = db.Column(db.JSON)




# class Log(db.Model):
#     id = db.Column(db.Integer, primary_key=True) # primary keys are required by SQLAlchemy
#     user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
#     input = db.Column(db.String(1000))
#     output = db.Column(db.String(1000))
#     isStereo = db.Column(db.String(100))
#     initalTarget = db.Column(db.String(100))
#     targets = db.Column(db.JSON)
#     relation = db.Column(db.String(100))
#     familiar = db.Column(db.String(100))
#     degree = db.Column(db.String(100))
#     context = db.Column(db.String(100))
#     isWordIssue = db.Column(db.String(100))
#     words = db.Column(db.JSON)
#     ambiguous = db.Column(db.String(1000))

# class Activity(db.Model):
#     id = db.Column(db.Integer, primary_key=True) # primary keys are required by SQLAlchemy
#     user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
#     time = db.Column(db.String(100))
#     log_id = db.Column(db.String(100))
#     state = db.Column(db.String(100))
#     note = db.Column(db.String(100))

# class Post(db.Model):
#     id = db.Column(db.Integer, primary_key=True) # primary keys are required by SQLAlchemy
#     post_num = db.Column(db.Integer)
#     user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
#     user = db.relationship('User', backref=db.backref('user', lazy=True))
#     post_image = db.Column(db.String(1000))
#     post_text = db.Column(db.JSON)