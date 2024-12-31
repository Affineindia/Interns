from fastapi import FastAPI, HTTPException, Depends, Form, File, UploadFile
from pydantic import BaseModel
from sqlalchemy import create_engine, Column, Integer, String, DateTime
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker, Session
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from fastapi.staticfiles import StaticFiles
from datetime import datetime
from typing import List, Optional
import os

# Database URL
DATABASE_URL = "mysql+pymysql://root:0313@localhost:3306/event_schema"

# Setup the database engine and sessionmaker
engine = create_engine(DATABASE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

app = FastAPI()
app.mount("/static", StaticFiles(directory="static"), name="static")

# SQLAlchemy Models
class User(Base):
    __tablename__ = "users"
    id = Column(Integer, primary_key=True, index=True)
    email = Column(String(255), unique=True, nullable=False)
    password = Column(String(255), nullable=False)
    role = Column(String(50), nullable=False, default="user")

class Event(Base):
    __tablename__ = 'events'

    event_id = Column(Integer, primary_key=True, index=True)
    event_name = Column(String, index=True)
    country = Column(String)
    state = Column(String)
    city = Column(String)
    address = Column(String)
    category = Column(String)
    dateandtime = Column(DateTime)
    created_at = Column(DateTime, default=datetime.now)
    created_by = Column(String, default="Admin")
    updated_at = Column(DateTime, default=datetime.now, onupdate=datetime.now)
    updated_by = Column(String, default="Admin")
    image_url = Column(String)
    organised_by = Column(String)
    description_event = Column(String)

# Create tables
Base.metadata.create_all(bind=engine)

# Pydantic Schemas
class LoginRequest(BaseModel):
    email: str
    password: str

class EventCreate(BaseModel):
    event_name: str
    country: str
    state: str
    city: str
    address: str
    category: str
    dateandtime: datetime
    created_by: str
    updated_by: str
    image_url: Optional[str] = None
    organised_by: str
    description_event: str

class EventResponse(EventCreate):
    event_id: int
    created_at: datetime
    updated_at: datetime

    class Config:
        orm_mode = True

# Dependency to get database session
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

UPLOAD_DIR = "uploaded_images"
os.makedirs(UPLOAD_DIR, exist_ok=True)

# Routes
@app.post("/login")
def login(request: LoginRequest, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == request.email).first()

    if not user or user.password != request.password:
        raise HTTPException(status_code=400, detail="Invalid email or password")

    return {
        "message": "Login successful",
        "user_id": user.id,
        "email": user.email,
        "role": user.role,
    }

@app.get("/events", response_model=List[EventResponse])
def get_events(db: Session = Depends(get_db)):
    return db.query(Event).all()

@app.post("/events")
async def create_event(
    event_name: str = Form(...),
    country: str = Form(...),
    state: str = Form(...),
    city: str = Form(...),
    address: str = Form(...),
    category: str = Form(...),
    dateandtime: datetime = Form(...),
    organised_by: str = Form(...),
    description: str = Form(...),
    image_url: Optional[UploadFile] = File(None),
    db: Session = Depends(get_db)
):
    try:
        image_path = None
        if image_url:
            upload_dir = "static/uploaded_images"
            os.makedirs(upload_dir, exist_ok=True)
            image_path = os.path.join(upload_dir, image_url.filename)
            with open(image_path, "wb") as f:
                f.write(image_url.file.read())

        new_event = Event(
            event_name=event_name,
            country=country,
            state=state,
            city=city,
            address=address,
            category=category,
            dateandtime=dateandtime,
            created_by="Admin",
            updated_by="Admin",
            image_url=image_path,
            organised_by=organised_by,
            description_event=description,
        )
        db.add(new_event)
        db.commit()
        db.refresh(new_event)

        return JSONResponse(
            content={
                "message": "Event added successfully!",
                "event": new_event.event_name,
                "event_id": new_event.event_id,
                "image_path": image_path,
            },
            status_code=201,
        )

    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Error creating event: {str(e)}")

@app.put("/events/{event_id}")
async def update_event(
    event_id: int,
    event_name: str = Form(...),
    country: str = Form(...),
    state: str = Form(...),
    city: str = Form(...),
    address: str = Form(...),
    category: str = Form(...),
    dateandtime: datetime = Form(...),
    organised_by: str = Form(...),
    description: str = Form(...),
    image_url: Optional[UploadFile] = File(None),
    db: Session = Depends(get_db),
):
    event = db.query(Event).filter(Event.event_id == event_id).first()
    if not event:
        raise HTTPException(status_code=404, detail="Event not found")

    if image_url:
        image_path = f"static/{image_url.filename}"
        with open(image_path, "wb") as f:
            f.write(await image_url.read())
        event.image_url = image_path

    event.event_name = event_name
    event.country = country
    event.state = state
    event.city = city
    event.address = address
    event.category = category
    event.dateandtime = dateandtime
    event.organised_by = organised_by
    event.description_event = description
    event.updated_at = datetime.now()

    db.commit()
    db.refresh(event)

    return JSONResponse(content={"message": "Event updated successfully!", "event": event.event_name})

@app.delete("/events/{event_id}")
def delete_event(event_id: int, db: Session = Depends(get_db)):
    event = db.query(Event).filter(Event.event_id == event_id).first()
    if not event:
        raise HTTPException(status_code=404, detail="Event not found")

    db.delete(event)
    db.commit()
    return {"message": "Event deleted successfully"}

@app.post("/register")
def register_user(user: LoginRequest, db: Session = Depends(get_db)):
    existing_user = db.query(User).filter(User.email == user.email).first()
    if existing_user:
        raise HTTPException(status_code=400, detail="Email already registered")

    new_user = User(
        email=user.email,
        password=user.password,  # Replace with hashed password in production
        role="user"
    )
    db.add(new_user)
    db.commit()
    db.refresh(new_user)

    return JSONResponse(
        content={
            "message": "User registered successfully!",
            "user_id": new_user.id,
            "email": new_user.email,
            "role": new_user.role,
        },
        status_code=201,
    )

# CORS Middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
