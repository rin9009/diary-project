# app.py

from flask import Flask, send_from_directory, jsonify, request
from flask_cors import CORS
from flask_jwt_extended import JWTManager, create_access_token, jwt_required, get_jwt_identity
from flask_sqlalchemy import SQLAlchemy
import os # 환경 변수를 가져온다 환경 변수는 보안 정보(비밀번호, API 키 등)를 코드에 직접 쓰지 않기 위해 사용한다
from datetime import timedelta, datetime
import json
import time

app = Flask(__name__, static_folder="static", static_url_path="/static")
CORS(app, resources={r"/api/*": {"origins": "*"}})

# MySQL 연동 설정
app.config['SQLALCHEMY_DATABASE_URI'] = 'mysql+pymysql://root:9670@localhost:3306/db_name'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

# JWT 설정
app.config["JWT_SECRET_KEY"] = "super-secret-key"  # 실제 배포에선 안전하게 관리!
app.config['JWT_ACCESS_TOKEN_EXPIRES'] = timedelta(days=1)

BASE_DIR = os.path.dirname(os.path.abspath(__file__))  # app.py가 있는 폴더 경로
UPLOAD_FOLDER = os.path.join(BASE_DIR, 'uploads')

app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER


db = SQLAlchemy(app)
jwt = JWTManager(app)

# 모델 정의
# 사용자 테이블
class User(db.Model):
    __tablename__ = 'users'
    id = db.Column(db.Integer, primary_key=True, autoincrement=True) # 기본키 + 자동 증가
    user_id = db.Column(db.String(50), unique=True, nullable=False)
    password = db.Column(db.String(100), nullable=False)
    nickname = db.Column(db.String(50), nullable=False)
    email = db.Column(db.String(100), nullable=False)

    diaries = db.relationship('Diary', backref='user', lazy=True)

# 다이어리 테이블
class Diary(db.Model):
    __tablename__ = 'diaries'
    id = db.Column(db.Integer, primary_key=True, autoincrement=True) # 기본키 + 자동 증가
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    title = db.Column(db.String(100), nullable=False)
    content = db.Column(db.Text, nullable=False)
    created_at = db.Column(db.DateTime, server_default=db.func.now()) # 저장할 때의 시간
    weather = db.Column(db.String(100), nullable=False)  # 오늘의 날씨(저장할 때의 날씨)
    photo_paths = db.Column(db.Text, nullable=True)  # 파일명 또는 경로
    

with app.app_context():
    db.create_all()

# uploads 폴더에 있는 파일에 접근하기 위해 따로 라우트를 만들어줘야 한다
# 일단 개발 중이라 이렇게 했고 나중에 static 폴더 안으로 넣을 생각
@app.route('/uploads/<filename>')
def uploaded_file(filename):
    return send_from_directory('uploads', filename)

# id와 password가 맞는지 확인 후 맞으면 토큰 발급
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
    
# 사용자 닉네임 출력을 위해 사용자 정보 가져오기
@app.route("/api/userinfo", methods=["GET"])
@jwt_required() # 토큰 없으면 아예 API를 막음
def get_userinfo():
    user_id = get_jwt_identity()

    user = User.query.filter_by(user_id=user_id).first()

    if not user:
        return jsonify({"success" : False,  "message": "유저를 찾을 수 없습니다"}), 404
    
    return jsonify({"success": True, "nickname": user.nickname})

# 전체 일기 정보 가져오기
@app.route("/api/diaryinfo", methods = ["GET"])
@jwt_required()
def get_diarylist():
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

# 해당 id의 일기 정보 가져오기
@app.route("/api/diary/<int:diary_id>", methods=["GET"])
@jwt_required()
def get_diary(diary_id):
    user_id = get_jwt_identity()
    user = User.query.filter_by(user_id=user_id).first()
    diary = Diary.query.filter_by(id=diary_id, user_id=user.id).first()

    # 배열 형태의 사진 경로를 가져오는데 사진 경로가 있으면 해당 사진의 경로를 가져오고 없음면 빈 배열 가져온다.
    try:
        photo_paths = json.loads(diary.photo_paths) if diary.photo_paths else []
    except json.JSONDecodeError:
        photo_paths = []

    if diary:
        return jsonify({
            "success": True,
            "id": diary.id,
            "title": diary.title,
            "content": diary.content,
            "created_at": diary.created_at.strftime('%Y-%m-%d'),
            "weather": diary.weather,
            "photo_paths": photo_paths,
        })
    else:
        return jsonify({"success": False, "message": "일기를 찾을 수 없습니다."}), 404

# 일기 작성 후 저장
@app.route("/api/diary/write", methods=["POST"])
@jwt_required()
def write_diary():
    user_id = get_jwt_identity()
    user = User.query.filter_by(user_id=user_id).first()

    if not user:
        return jsonify({"success": False, "message": "유저를 찾을 수 없습니다."}), 404

    title = request.form.get("title")
    content = request.form.get("content")
    created_at_str = request.form.get("created_at")
    
    # 날짜 문자열을 datetime 객체로 변환
    if created_at_str:
        try:
            created_at = datetime.strptime(created_at_str, "%Y-%m-%d")
        except ValueError:
            created_at = None  # 파싱 실패 시 None 처리
    else:
        created_at = None

    weather = request.form.get("weather")

    files = request.files.getlist("file")
    photo_paths = []

    upload_folder = app.config['UPLOAD_FOLDER']
    # 해당 경로 없으면 폴더 만들기
    if not os.path.exists(upload_folder):
        os.makedirs(upload_folder)

    for file in files:

        # filename = secure_filename(file.filename)
        ext = os.path.splitext(file.filename)[1]  # 예: .jpg, .png
        millis = int(time.time() * 1000)  # 초 대신 밀리초
        new_filename = f"diary_{user.id}_{millis}{ext}"
        file.save(os.path.join(upload_folder, new_filename))
        photo_paths.append(f"/uploads/{new_filename}")
    
    # DB에 insert
    new_diary = Diary(
        user_id=user.id,
        title=title,
        content=content,
        created_at=created_at,
        weather=weather,
        photo_paths=json.dumps(photo_paths) if photo_paths else json.dumps([]),
    )

    db.session.add(new_diary)
    db.session.commit()

    return jsonify({"success": True, "message": "일기 등록 성공"})

# 일기 수정 후 저장
@app.route("/api/diary/update/<int:diary_id>", methods=["POST"])
@jwt_required()
def update_diary(diary_id):
    user_id = get_jwt_identity()
    user = User.query.filter_by(user_id=user_id).first()
    # 기존 다이어리 찾기
    diary = Diary.query.filter_by(id=diary_id, user_id=user.id).first()

    if not user:
        return jsonify({"success": False, "message": "유저를 찾을 수 없습니다."}), 404    
    if not diary:
        return jsonify({"success": False, "message": "일기를 찾을 수 없습니다"}), 404

    
    title = request.form.get("title")
    content = request.form.get("content")
    files = request.files.getlist("file")
    # 사진이 없으므로 완전 삭제하라는 플래그
    clear_photos = request.form.get("clearPhotos") == "true"
    photo_paths = []


    # 남겨진 기존 사진 경로 받기
    existing_paths = request.form.get("existingPaths")
    existing_paths = json.loads(existing_paths) if existing_paths else []
    

    # DB에 저장되어 있던 이전 사진 경로 불러오기
    old_paths = json.loads(diary.photo_paths) if diary.photo_paths else []
    # 삭제할 사진(old_paths에 있었지만 existing_paths에는 없는 것 → 삭제된 것)
    deleted_paths = [p for p in old_paths if p not in existing_paths]

    # 업로드 폴더 확인 및 생성
    upload_folder = app.config['UPLOAD_FOLDER']
    if not os.path.exists(upload_folder):
        os.makedirs(upload_folder)

    # 서버에서 삭제할 사진 제거
    for rel_path in deleted_paths:
        abs_path = os.path.join(upload_folder, os.path.basename(rel_path))
        if os.path.exists(abs_path):
            os.remove(abs_path)

    # 새로 업로드된 파일 저장
    new_paths = []
    if files:
        for file in files:
            ext = os.path.splitext(file.filename)[1]  # 예: .jpg, .png
            millis = int(time.time() * 1000)  # 초 대신 밀리초
            new_filename = f"diary_{user.id}_{millis}{ext}"
            file.save(os.path.join(upload_folder, new_filename))
            new_paths.append(f"/uploads/{new_filename}") 

    # 최종 사진 리스트 = 기존 유지 + 새 업로드
    final_paths = existing_paths + new_paths

    # 필드 값 업데이트
    diary.title = title
    diary.content = content

    diary.photo_paths = json.dumps(final_paths)
    
    # DB 저장
    db.session.commit()

    return jsonify({"success": True, "message": "일기 수정 완료"})


@app.route("/api/diary/delete/<int:diary_id>", methods=["DELETE"])
@jwt_required()
def delete_diary(diary_id):
    user_id = get_jwt_identity()
    user = User.query.filter_by(user_id=user_id).first()
    diary = Diary.query.filter_by(id=diary_id, user_id=user.id).first()
    
    if not diary:
        return jsonify({"error": "일기를 찾을 수 없습니다."}), 404
    
    db.session.delete(diary)
    db.session.commit()
    return jsonify({"message": "일기 삭제 성공"}), 200


@app.route('/', defaults={'path': ''})
@app.route('/<path:path>')
def serve_react(path):
    if path != "" and os.path.exists(os.path.join(app.static_folder, path)):
        return send_from_directory(app.static_folder, path)
    else:
        return send_from_directory(app.static_folder, 'index.html')

if __name__ == '__main__':
    app.run(debug=True, port=5000)