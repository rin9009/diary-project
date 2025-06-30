from flask import Flask, send_from_directory, jsonify, request
from flask_cors import CORS
from flask_jwt_extended import JWTManager, create_access_token, jwt_required, get_jwt_identity
from flask_sqlalchemy import SQLAlchemy
import os # 환경 변수를 가져온다 환경 변수는 보안 정보(비밀번호, API 키 등)를 코드에 직접 쓰지 않기 위해 사용한다

app = Flask(__name__, static_folder="../frontend/dist", static_url_path="/")
CORS(app, resources={r"/api/*": {"origins": "*"}})
# app.config['SQLALCHEMY_DATABASE_URI'] = 'mysql+pymysql://root:9670@localhost:3306/db_name'
# app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

# db = SQLAlchemy(app)

# class Posts(db.Model):
#     __tablename__ = 'posts'

#     id = db.Column(db.Integer, primary_key=True)
#     title = db.Column(db.String(30), nullable=False)
#     body = db.Column(db.String(120), nullable=False)
    
#     def __repr__(self):
#         return f"<Posts('{self.id}', '{self.title}', '{self.body}')>"

# with app.app_context():
#     db.create_all()

app.config["JWT_SECRET_KEY"] = "super-secret-key"  # 실제 배포에선 안전하게 관리!

jwt = JWTManager(app)

@app.route("/api/login", methods=["POST"])
def login():
    user_data = request.get_json()
    user_id = user_data.get("userId")
    password = user_data.get("password")

    if user_id == "test" and password == "1234":
        access_token = create_access_token(identity=user_id)
        return jsonify({"success" : True, "message": "로그인 성공", "token" : access_token})
    else:
        return jsonify({"success": False, "message": "로그인 실패"}), 401
    
@app.route("/api/userinfo", methods=["GET"])
@jwt_required() # 토큰 없으면 아예 API를 막음
def userinfo():
    # user_id = get_jwt_identity()
    user = "녹차"

    if user:
        return jsonify({"success" : True, "nickname" : user})
    return jsonify({"success" : False}), 404

@app.route("/api/diaryinfo", methods = ["GET"])
@jwt_required(optional=True)
def diaryinfo():
    diaryContent = ["오늘의 일기", "어제의 일기", "주말의 일기"]
    # diaryContent = ""
    
    if diaryContent:
        return jsonify({"success" : True, "contents" : diaryContent, "message" : "일기 내용 가져오기 성공"})
    else:
        return jsonify({"success" : False, "message": "일기가 없습니다."}), 404

@app.route('/', defaults={'path': ''})
@app.route('/<path:path>')
def serve_react(path):
    if path != "" and os.path.exists(os.path.join(app.static_folder, path)):
        return send_from_directory(app.static_folder, path)
    else:
        return send_from_directory(app.static_folder, 'index.html')

if __name__ == '__main__':
    app.run(debug=True, port=5000)