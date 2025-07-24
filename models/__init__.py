from datetime import datetime, date
from sqlalchemy import Column, Integer, String, Boolean, Date, Enum, ForeignKey
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import relationship
from marshmallow import Schema, fields, validate

Base = declarative_base()

class User(Base):
    __tablename__ = 'users'

    id = Column(Integer, primary_key=True)
    name = Column(String(100), nullable=False)
    email = Column(String(100), unique=True, nullable=False)
    phone = Column(String(20), nullable=False)
    registration_date = Column(Date, nullable=False, default=date.today)
    active = Column(Boolean, default=True)

    loans = relationship("Loan", back_populates="user")

class Book(Base):
    __tablename__ = 'books'

    id = Column(Integer, primary_key=True)
    title = Column(String(200), nullable=False)
    author = Column(String(100), nullable=False)
    isbn = Column(String(13), unique=True, nullable=False)
    genre = Column(String(50), nullable=False)
    publication_date = Column(Date, nullable=False)
    available = Column(Boolean, default=True)

    loans = relationship("Loan", back_populates="book")

class Loan(Base):
    __tablename__ = 'loans'

    id = Column(Integer, primary_key=True)
    user_id = Column(Integer, ForeignKey('users.id'), nullable=False)
    book_id = Column(Integer, ForeignKey('books.id'), nullable=False)
    loan_date = Column(Date, nullable=False, default=date.today)
    expected_return_date = Column(Date, nullable=False)
    actual_return_date = Column(Date, nullable=True)
    status = Column(Enum('active', 'returned'), default='active')

    user = relationship("User", back_populates="loans")
    book = relationship("Book", back_populates="loans")

# Schemas para validación
class UserSchema(Schema):
    id = fields.Integer(dump_only=True)
    name = fields.String(required=True, validate=validate.Length(min=2, max=100, error='El nombre debe tener entre 2 y 100 caracteres'))
    email = fields.Email(required=True, validate=validate.Length(max=100))
    phone = fields.String(required=True, validate=validate.Length(min=8, max=20, error='El teléfono debe tener entre 8 y 20 caracteres'))
    registration_date = fields.Date(dump_only=True)
    active = fields.Boolean(load_default=True)

class BookSchema(Schema):
    id = fields.Integer(dump_only=True)
    title = fields.String(required=True, validate=validate.Length(min=2, max=200, error='El título debe tener entre 2 y 200 caracteres'))
    author = fields.String(required=True, validate=validate.Length(min=2, max=100, error='El autor debe tener entre 2 y 100 caracteres'))
    isbn = fields.String(required=True, validate=validate.Length(min=10, max=13, error='El ISBN debe tener entre 10 y 13 caracteres'))
    genre = fields.String(required=True, validate=validate.Length(min=2, max=50, error='El género debe tener entre 2 y 50 caracteres'))
    publication_date = fields.Date(required=True)
    available = fields.Boolean(dump_only=True)

class LoanSchema(Schema):
    id = fields.Integer(dump_only=True)
    user_id = fields.Integer(required=True)
    book_id = fields.Integer(required=True)
    loan_date = fields.Date(dump_only=True)
    expected_return_date = fields.Date(dump_only=True)
    actual_return_date = fields.Date(allow_none=True, dump_only=True)
    status = fields.String(dump_only=True)
