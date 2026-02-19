import os
from pymongo import MongoClient
from dotenv import load_dotenv

load_dotenv()

mongo_url = os.getenv("MONGO_URL")
client = MongoClient(mongo_url)
db = client["oak_woods_db"]

users_col = db["users"]
inventory_col = db["inventory"]
orders_col = db["orders"]
laborers_col = db["laborers"]
expenses_col = db["expenses"]
