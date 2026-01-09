from fastapi import FastAPI, APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
from pathlib import Path
from pydantic import BaseModel, Field, ConfigDict
from typing import List, Optional, Any
import uuid
from datetime import datetime, timezone, timedelta

# Google auth and JWT
from google.oauth2 import id_token as google_id_token
from google.auth.transport import requests as grequests
from jose import jwt, JWTError


ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

# Create the main app without a prefix
app = FastAPI()

# Create a router with the /api prefix
api_router = APIRouter(prefix="/api")


# Define Models
class StatusCheck(BaseModel):
    model_config = ConfigDict(extra="ignore")  # Ignore MongoDB's _id field
    
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    client_name: str
    timestamp: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class StatusCheckCreate(BaseModel):
    client_name: str


# --- Auth and User/Tasks models ---
class GoogleAuthRequest(BaseModel):
    id_token: str


class UserModel(BaseModel):
    id: str
    email: Optional[str]
    name: Optional[str]
    picture: Optional[str]
    created_at: Optional[datetime]


class TasksPayload(BaseModel):
    tasks: List[Any]


# JWT / Auth config
OAUTH2_SCHEME = OAuth2PasswordBearer(tokenUrl="token")
GOOGLE_CLIENT_ID = os.environ.get('GOOGLE_CLIENT_ID')
SECRET_KEY = os.environ.get('SECRET_KEY', 'dev-secret-change-me')
ALGORITHM = os.environ.get('JWT_ALGORITHM', 'HS256')
ACCESS_TOKEN_EXPIRE_MINUTES = int(os.environ.get('ACCESS_TOKEN_EXPIRE_MINUTES', '10080'))  # default 7 days


def create_access_token(data: dict, expires_delta: Optional[timedelta] = None):
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.now(timezone.utc) + expires_delta
    else:
        expire = datetime.now(timezone.utc) + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": expire.isoformat()})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt


async def get_current_user(token: str = Depends(OAUTH2_SCHEME)) -> UserModel:
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        user_id: str = payload.get("sub")
        if user_id is None:
            raise credentials_exception
    except JWTError:
        raise credentials_exception

    user_doc = await db.users.find_one({"id": user_id}, {"_id": 0})
    if not user_doc:
        raise HTTPException(status_code=404, detail="User not found")
    # Convert timestamp if present
    if 'created_at' in user_doc and isinstance(user_doc['created_at'], str):
        user_doc['created_at'] = datetime.fromisoformat(user_doc['created_at'])
    return UserModel(**user_doc)

# Add your routes to the router instead of directly to app
@api_router.get("/")
async def root():
    return {"message": "Hello World"}

@api_router.post("/status", response_model=StatusCheck)
async def create_status_check(input: StatusCheckCreate):
    status_dict = input.model_dump()
    status_obj = StatusCheck(**status_dict)
    
    # Convert to dict and serialize datetime to ISO string for MongoDB
    doc = status_obj.model_dump()
    doc['timestamp'] = doc['timestamp'].isoformat()
    
    _ = await db.status_checks.insert_one(doc)
    return status_obj

@api_router.get("/status", response_model=List[StatusCheck])
async def get_status_checks():
    # Exclude MongoDB's _id field from the query results
    status_checks = await db.status_checks.find({}, {"_id": 0}).to_list(1000)
    
    # Convert ISO string timestamps back to datetime objects
    for check in status_checks:
        if isinstance(check['timestamp'], str):
            check['timestamp'] = datetime.fromisoformat(check['timestamp'])
    
    return status_checks


# --- Authentication endpoints ---
@api_router.post("/auth/google")
async def auth_google(payload: GoogleAuthRequest):
    if not GOOGLE_CLIENT_ID:
        raise HTTPException(status_code=500, detail="Server not configured with GOOGLE_CLIENT_ID")

    try:
        idinfo = google_id_token.verify_oauth2_token(payload.id_token, grequests.Request(), GOOGLE_CLIENT_ID)
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Invalid ID token: {e}")

    # 'sub' is the unique user id for the Google account
    user_id = idinfo.get('sub')
    email = idinfo.get('email')
    name = idinfo.get('name')
    picture = idinfo.get('picture')

    user_doc = {
        'id': user_id,
        'email': email,
        'name': name,
        'picture': picture,
        'created_at': datetime.now(timezone.utc).isoformat()
    }

    await db.users.update_one({'id': user_id}, {'$set': user_doc}, upsert=True)

    access_token = create_access_token({"sub": user_id})

    return {"access_token": access_token, "token_type": "bearer", "user": user_doc}


# --- User endpoints ---
@api_router.get('/user')
async def get_user(current_user: UserModel = Depends(get_current_user)):
    return current_user


# --- Tasks endpoints (per-user) ---
@api_router.get('/tasks')
async def get_tasks(current_user: UserModel = Depends(get_current_user)):
    doc = await db.tasks.find_one({'user_id': current_user.id}, {'_id': 0})
    if not doc:
        return {'tasks': []}
    return {'tasks': doc.get('tasks', []), 'updated_at': doc.get('updated_at')}


@api_router.post('/tasks')
async def save_tasks(payload: TasksPayload, current_user: UserModel = Depends(get_current_user)):
    doc = {
        'user_id': current_user.id,
        'tasks': payload.tasks,
        'updated_at': datetime.now(timezone.utc).isoformat()
    }
    await db.tasks.update_one({'user_id': current_user.id}, {'$set': doc}, upsert=True)
    return {'ok': True, 'updated_at': doc['updated_at']}

# Include the router in the main app
app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','),
    allow_methods=["*"],
    allow_headers=["*"],
)

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()