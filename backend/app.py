from flask import Flask, send_from_directory, jsonify, request
from flask_cors import CORS
from flask_jwt_extended import JWTManager, create_access_token, jwt_required, get_jwt_identity
from flask_sqlalchemy import SQLAlchemy
import os # 환경 변수를 가져온다 환경 변수는 보안 정보(비밀번호, API 키 등)를 코드에 직접 쓰지 않기 위해 사용한다
from datetime import timedelta

app = Flask(__name__, static_folder="../frontend/dist", static_url_path="/")
CORS(app, resources={r"/api/*": {"origins": "*"}})

# MySQL 연동 설정
app.config['SQLALCHEMY_DATABASE_URI'] = 'mysql+pymysql://root:9670@localhost:3306/db_name'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

# JWT 설정
app.config["JWT_SECRET_KEY"] = "super-secret-key"  # 실제 배포에선 안전하게 관리!
app.config['JWT_ACCESS_TOKEN_EXPIRES'] = timedelta(days=1)

db = SQLAlchemy(app)
jwt = JWTManager(app)

# 모델 정의
class User(db.Model):
    __tablename__ = 'users'
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.String(50), unique=True, nullable=False)
    password = db.Column(db.String(100), nullable=False)
    nickname = db.Column(db.String(50), nullable=False)
    email = db.Column(db.String(100), nullable=False)

    diaries = db.relationship('Diary', backref='user', lazy=True)

class Diary(db.Model):
    __tablename__ = 'diaries'
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    title = db.Column(db.String(100))
    content = db.Column(db.Text)
    created_at = db.Column(db.DateTime, server_default=db.func.now()) # 저장할 때의 시간
    weather = db.Column(db.String(100))  # 오늘의 날씨(저장할 때의 날씨)
    photo_path = db.Column(db.String(200))  # 파일명 또는 경로
    

with app.app_context():
    db.create_all()

@app.route("/api/login", methods=["POST"])
def login():
    user_data = request.get_json()
    user_id = user_data.get("userId")
    password = user_data.get("password")

    user = User.query.filter_by(user_id=user_id, password=password).first()

    if user:
        access_token = create_access_token(identity=user_id)
        return jsonify({"success" : True, "token" : access_token})
    else:
        return jsonify({"success": False, "message": "로그인 실패"}), 401
    
@app.route("/api/userinfo", methods=["GET"])
@jwt_required() # 토큰 없으면 아예 API를 막음
def userinfo():
    user_id = get_jwt_identity()

    user = User.query.filter_by(user_id=user_id).first()

    if not user:
        return jsonify({"success" : False,  "message": "유저를 찾을 수 없습니다"}), 404
    
    return jsonify({"success": True, "nickname": user.nickname})

@app.route("/api/diaryinfo", methods = ["GET"])
@jwt_required()
def diaryinfo():
    user_id = get_jwt_identity()
    user = User.query.filter_by(user_id=user_id).first()
    diaries = Diary.query.filter_by(user_id=user.id).order_by(Diary.id.desc()).all()

    if diaries:
        diary_list = [
            {
                'id': d.id,
                'title': d.title,
                'content': d.content[:100],
                'created_at': d.created_at.strftime('%Y-%m-%d'),
            }
            for d in diaries
        ]
        return jsonify({"success": True, "contents": diary_list})
    else:
        return jsonify({"success": False, "message": "일기가 없습니다."}), 404


@app.route('/', defaults={'path': ''})
@app.route('/<path:path>')
def serve_react(path):
    if path != "" and os.path.exists(os.path.join(app.static_folder, path)):
        return send_from_directory(app.static_folder, path)
    else:
        return send_from_directory(app.static_folder, 'index.html')

if __name__ == '__main__':
    app.run(debug=True, port=5000)