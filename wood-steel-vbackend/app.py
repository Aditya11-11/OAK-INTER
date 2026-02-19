import os
from flask import Flask
from flask_cors import CORS
from flask_jwt_extended import JWTManager
from pymongo import MongoClient
from dotenv import load_dotenv

load_dotenv()

app = Flask(__name__)
CORS(app)

app.config["JWT_SECRET_KEY"] = os.getenv("JWT_SECRET_KEY", "super-secret-key-oak-woods")
jwt = JWTManager(app)

from routes.auth import auth_bp
from routes.inventory import inventory_bp
from routes.orders import orders_bp
from routes.labor import labor_bp
from routes.expenses import expenses_bp
from routes.reports import reports_bp

app.register_blueprint(auth_bp, url_prefix="/auth")
app.register_blueprint(inventory_bp, url_prefix="/inventory")
app.register_blueprint(orders_bp, url_prefix="/orders")
app.register_blueprint(labor_bp, url_prefix="/laborers")
app.register_blueprint(expenses_bp, url_prefix="/expenses")
app.register_blueprint(reports_bp, url_prefix="/reports")

@app.route("/")
def index():
    return {"status": "success", "message": "Oak Woods API is running"}

if __name__ == "__main__":
    port = int(os.environ.get("PORT", 10000))
    app.run(host="0.0.0.0", port=port, debug=False)
