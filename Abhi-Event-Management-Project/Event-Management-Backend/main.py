from fastapi import FastAPI, HTTPException, Depends
from pydantic import BaseModel
from sqlalchemy import create_engine, Column, Integer, String, DateTime
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker, Session
from fastapi.middleware.cors import CORSMiddleware
from datetime import datetime
from typing import List
from fastapi import FastAPI, HTTPException, Depends, Form, File, UploadFile
from sqlalchemy import create_engine, Column, Integer, String, DateTime
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker, Session
from fastapi.responses import JSONResponse
from datetime import datetime
import os
from fastapi import FastAPI, Form, File, UploadFile
from fastapi.responses import JSONResponse
from typing import Optional
from sqlalchemy.orm import Session
from datetime import datetime
from fastapi.staticfiles import StaticFiles
from typing import Optional


DATABASE_URL = "mysql+pymysql://root:123456@localhost:3306/event_schema"

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

class UserCreate(BaseModel):
    email: str
    password: str
    role: Optional[str] = "user" 


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

class BookedEvent(Base):
    __tablename__ = "booked_events"

    booking_id = Column(Integer, primary_key=True, index=True)
    event_id = Column(Integer, nullable=False)
    email = Column(String(255), nullable=False)
    event_name = Column(String(250), nullable=False)
    booking_date = Column(DateTime, default=datetime.now)


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

class BookEventRequest(BaseModel):
    event_id: int
    email: str  
    event_name: str


# Dependency to get database session
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

UPLOAD_DIR = "uploaded_images"
if not os.path.exists(UPLOAD_DIR):
    os.makedirs(UPLOAD_DIR)

# Routes
@app.post("/login")
def login(request: LoginRequest, db: Session = Depends(get_db)):
    # Fetch the user by email
    user = db.query(User).filter(User.email == request.email).first()

    # Validate user and password
    if not user or user.password != request.password:  # Replace with hashed password check if needed
        raise HTTPException(status_code=400, detail="Invalid email or password")

    # Return user details along with the role
    return {
        "message": "Login successful",
        "user_id": user.id,
        "email": user.email,
        "role": user.role,
    }



@app.get("/events", response_model=List[EventResponse])
def get_events(db: Session = Depends(get_db)):
    events = db.query(Event).all()
    return events

@app.post("/register")
def register_user(user: UserCreate, db: Session = Depends(get_db)):
    # Check if the email already exists
    existing_user = db.query(User).filter(User.email == user.email).first()
    if existing_user:
        raise HTTPException(status_code=400, detail="Email already registered")

    # Create new user
    new_user = User(
        email=user.email,
        password=user.password,  # For production, hash the password (e.g., using bcrypt or similar libraries)
        role=user.role
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
    image_url: Optional[UploadFile] = File(None),  # Optional image upload
    db: Session = Depends(get_db)
):
    try:
        # Handle file upload
        image_path = None
        if image_url:
            upload_dir = "static/uploaded_images"
            os.makedirs(upload_dir, exist_ok=True)  # Ensure directory exists
            
            # Use the original filename
            image_path = os.path.join(upload_dir, image_url.filename)
            
            # Save file (this will overwrite if the file already exists)
            with open(image_path, "wb") as f:
                f.write(image_url.file.read())

        # Create and save event in the database
        new_event = Event(
            event_name=event_name,
            country=country,
            state=state,
            city=city,
            address=address,
            category=category,
            dateandtime=dateandtime,
            created_at=datetime.now(),
            created_by="Admin",
            updated_at=datetime.now(),
            updated_by="Admin",
            image_url=image_path,
            organised_by=organised_by,
            description_event=description,
        )
        db.add(new_event)
        db.commit()
        db.refresh(new_event)

        # Response with success
        return JSONResponse(
            content={
                "message": "Event added successfully!",
                "event": new_event.event_name,
                "event_id": new_event.event_id,
                "image_path": image_path if image_url else None,
            },
            status_code=201,
        )

    except Exception as e:
        db.rollback()  # Rollback in case of error
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
    image_url: Optional[UploadFile] = File(None),  # Optional file for update
    db: Session = Depends(get_db),
):
    # Fetch the existing event
    event = db.query(Event).filter(Event.event_id == event_id).first()
    if not event:
        raise HTTPException(status_code=404, detail="Event not found")

    # Save the uploaded file (if any)
    if image_url:
        image_path = f"static/{image_url.filename}"  # Save to static folder
        with open(image_path, "wb") as f:
            f.write(await image_url.read())
        event.image_url = image_path  # Update image path

    # Update event details
    event.event_name = event_name
    event.country = country
    event.state = state
    event.city = city
    event.address = address
    event.category = category
    event.dateandtime = dateandtime
    event.organised_by = organised_by
    event.description_event = description
    event.updated_at = datetime.now()  # Update the timestamp

    db.commit()
    db.refresh(event)

    return JSONResponse(content={"message": "Event updated successfully!", "event": event.event_name})


@app.get("/bookevent/status")
def check_booking_status(event_id: int, email: str, db: Session = Depends(get_db)):
    # Check if the booking exists for the given event and user
    booking = db.query(BookedEvent).filter(
        BookedEvent.event_id == event_id,
        BookedEvent.email == email
    ).first()
    
    if booking:
        return {"is_booked": True}
    return {"is_booked": False}

@app.post("/bookevent")
def book_event(request: BookEventRequest, db: Session = Depends(get_db)):
    try:
        # Check if the user exists
        user = db.query(User).filter(User.email == request.email).first()
        if not user:
            raise HTTPException(status_code=404, detail="User not found")

        # Check if the event exists and matches the provided name
        event = db.query(Event).filter(Event.event_id == request.event_id).first()
        if not event:
            raise HTTPException(status_code=404, detail="Event not found")

        if event.event_name != request.event_name:
            raise HTTPException(status_code=400, detail="Event ID and Event Name do not match")

        # Check if the user has already booked this event
        existing_booking = db.query(BookedEvent).filter(
            BookedEvent.event_id == request.event_id,
            BookedEvent.email == request.email
        ).first()
        if existing_booking:
            raise HTTPException(status_code=400, detail="Event already booked by this user")

        # Create a new booking
        new_booking = BookedEvent(
            event_id=request.event_id,
            email=request.email,
            event_name=request.event_name,
            booking_date=datetime.now(),
        )
        db.add(new_booking)
        db.commit()
        db.refresh(new_booking)

        return JSONResponse(
            content={
                "message": "Event booked successfully!",
                "booking_id": new_booking.booking_id,
                "event_name": request.event_name,
                "user_email": request.email,
            },
            status_code=201
        )
    except HTTPException as http_exc:
        raise http_exc
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")


@app.delete("/events/{event_id}")
def delete_event(event_id: int, db: Session = Depends(get_db)):
    event = db.query(Event).filter(Event.event_id == event_id).first()
    if not event:
        raise HTTPException(status_code=404, detail="Event not found")

    db.delete(event)
    db.commit()
    return {"message": "Event deleted successfully"}





# CORS Middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],  # React frontend origin
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)