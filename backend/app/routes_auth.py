from fastapi import APIRouter, HTTPException, Depends
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from pydantic import BaseModel, EmailStr
import jwt
from app.database import get_user_by_email, create_user, verify_password
from app.auth import create_access_token, SECRET_KEY, ALGORITHM

router = APIRouter()
security = HTTPBearer()

class RegisterReq(BaseModel):
    name: str
    email: EmailStr
    password: str

class LoginReq(BaseModel):
    email: EmailStr
    password: str

@router.post("/register")
def register(req: RegisterReq):
    if get_user_by_email(req.email):
        raise HTTPException(status_code=400, detail="Email already registered")
    user_id = create_user(req.name, req.email, req.password)
    token = create_access_token({"sub": str(user_id), "email": req.email, "name": req.name})
    return {"token": token, "user": {"name": req.name, "email": req.email}}

@router.post("/login")
def login(req: LoginReq):
    user = get_user_by_email(req.email)
    if not user or not verify_password(req.password, user["password_hash"]):
        raise HTTPException(status_code=401, detail="Invalid email or password")
    token = create_access_token({"sub": str(user["id"]), "email": user["email"], "name": user["name"]})
    return {"token": token, "user": {"name": user["name"], "email": user["email"]}}

@router.get("/me")
def get_me(credentials: HTTPAuthorizationCredentials = Depends(security)):
    try:
        payload = jwt.decode(credentials.credentials, SECRET_KEY, algorithms=[ALGORITHM])
        return {"name": payload["name"], "email": payload["email"]}
    except Exception:
        raise HTTPException(status_code=401, detail="Invalid token")