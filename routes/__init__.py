from datetime import date, timedelta
from flask import Flask, request, jsonify
from sqlalchemy import create_engine, and_
from sqlalchemy.orm import sessionmaker
from sqlalchemy.exc import IntegrityError
from marshmallow import ValidationError

from models import Base, User, Book, Loan, UserSchema, BookSchema, LoanSchema

def create_routes(app: Flask, engine):
    Session = sessionmaker(bind=engine)

    user_schema = UserSchema()
    users_schema = UserSchema(many=True)
    book_schema = BookSchema()
    books_schema = BookSchema(many=True)
    loan_schema = LoanSchema()

    @app.route('/api/users', methods=['GET'])
    def get_users():
        try:
            session = Session()
            users = session.query(User).all()

            # Obtener información de préstamos activos para cada usuario
            user_data = []
            for user in users:
                active_loan = session.query(Loan).filter(
                    and_(Loan.user_id == user.id, Loan.status == 'active')
                ).first()

                user_dict = user_schema.dump(user)
                if active_loan:
                    book = session.query(Book).filter(Book.id == active_loan.book_id).first()
                    user_dict['current_loan'] = {
                        'loan_id': active_loan.id,
                        'book_title': book.title,
                        'book_author': book.author,
                        'loan_date': active_loan.loan_date.isoformat(),
                        'expected_return_date': active_loan.expected_return_date.isoformat()
                    }
                else:
                    user_dict['current_loan'] = None

                user_data.append(user_dict)

            session.close()
            return jsonify(user_data), 200

        except Exception as e:
            return jsonify({'error': str(e)}), 500

    @app.route('/api/users', methods=['POST'])
    def create_user():
        try:
            session = Session()
            data = user_schema.load(request.json)

            new_user = User(**data)
            session.add(new_user)
            session.commit()

            result = user_schema.dump(new_user)
            session.close()
            return jsonify(result), 201

        except ValidationError as e:
            return jsonify({'errors': e.messages}), 400
        except IntegrityError as e:
            session.rollback()
            session.close()
            error_msg = str(e.orig)
            if 'email' in error_msg.lower():
                return jsonify({'errors': {'email': ['El email ya está registrado']}}), 409
            else:
                return jsonify({'error': 'Error de integridad en los datos'}), 409
        except Exception as e:
            session.rollback()
            session.close()
            return jsonify({'error': str(e)}), 500

    @app.route('/api/books', methods=['GET'])
    def get_books():
        try:
            session = Session()
            books = session.query(Book).all()
            result = books_schema.dump(books)
            session.close()
            return jsonify(result), 200

        except Exception as e:
            return jsonify({'error': str(e)}), 500

    @app.route('/api/books', methods=['POST'])
    def create_book():
        try:
            session = Session()
            data = book_schema.load(request.json)

            new_book = Book(**data, available=True)
            session.add(new_book)
            session.commit()

            result = book_schema.dump(new_book)
            session.close()
            return jsonify(result), 201

        except ValidationError as e:
            return jsonify({'errors': e.messages}), 400
        except IntegrityError as e:
            session.rollback()
            session.close()
            error_msg = str(e.orig)
            if 'isbn' in error_msg.lower():
                return jsonify({'errors': {'isbn': ['El ISBN ya está registrado']}}), 409
            else:
                return jsonify({'error': 'Error de integridad en los datos'}), 409
        except Exception as e:
            session.rollback()
            session.close()
            return jsonify({'error': str(e)}), 500

    @app.route('/api/books/available', methods=['GET'])
    def get_available_books():
        try:
            session = Session()
            books = session.query(Book).filter(Book.available == True).all()
            result = books_schema.dump(books)
            session.close()
            return jsonify(result), 200

        except Exception as e:
            return jsonify({'error': str(e)}), 500

    @app.route('/api/loans', methods=['POST'])
    def create_loan():
        try:
            session = Session()
            data = loan_schema.load(request.json)

            # Verificar que el usuario no tenga préstamos activos
            active_loan = session.query(Loan).filter(
                and_(Loan.user_id == data['user_id'], Loan.status == 'active')
            ).first()

            if active_loan:
                session.close()
                return jsonify({'errors': {'user_id': ['El usuario ya tiene un libro prestado']}}), 409

            # Verificar que el libro esté disponible
            book = session.query(Book).filter(Book.id == data['book_id']).first()
            if not book or not book.available:
                session.close()
                return jsonify({'errors': {'book_id': ['El libro no está disponible']}}), 409

            # Crear préstamo
            loan_date = date.today()
            expected_return_date = loan_date + timedelta(days=14)

            new_loan = Loan(
                user_id=data['user_id'],
                book_id=data['book_id'],
                loan_date=loan_date,
                expected_return_date=expected_return_date,
                status='active'
            )

            # Marcar libro como no disponible
            book.available = False

            session.add(new_loan)
            session.commit()

            result = loan_schema.dump(new_loan)
            session.close()
            return jsonify(result), 201

        except ValidationError as e:
            return jsonify({'errors': e.messages}), 400
        except Exception as e:
            session.rollback()
            session.close()
            return jsonify({'error': str(e)}), 500

    @app.route('/api/loans/<int:loan_id>/return', methods=['PUT'])
    def return_book(loan_id):
        try:
            session = Session()

            loan = session.query(Loan).filter(Loan.id == loan_id).first()
            if not loan:
                session.close()
                return jsonify({'error': 'Préstamo no encontrado'}), 404

            if loan.status == 'returned':
                session.close()
                return jsonify({'error': 'El libro ya fue devuelto'}), 409

            # Marcar préstamo como devuelto
            loan.actual_return_date = date.today()
            loan.status = 'returned'

            # Marcar libro como disponible
            book = session.query(Book).filter(Book.id == loan.book_id).first()
            book.available = True

            session.commit()

            result = loan_schema.dump(loan)
            session.close()
            return jsonify(result), 200

        except Exception as e:
            session.rollback()
            session.close()
            return jsonify({'error': str(e)}), 500
