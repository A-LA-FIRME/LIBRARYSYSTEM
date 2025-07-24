import os
from dotenv import load_dotenv

load_dotenv()

class Config:
    # Configuración MySQL
    DB_HOST = os.environ.get('DB_HOST', 'localhost')
    DB_USER = os.environ.get('DB_USER', 'root')
    DB_PASSWORD = os.environ.get('DB_PASSWORD', '')
    DB_NAME = os.environ.get('DB_NAME', 'Prueba3')

    # URI de base de datos
    SQLALCHEMY_DATABASE_URI = f"mysql+pymysql://{DB_USER}:{DB_PASSWORD}@{DB_HOST}/{DB_NAME}"

    SQLALCHEMY_TRACK_MODIFICATIONS = False
