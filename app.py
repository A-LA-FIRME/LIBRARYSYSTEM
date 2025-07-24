from flask import Flask, render_template
from flask_cors import CORS
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

from config import Config
from models import Base
from routes import create_routes

app = Flask(__name__)
app.config.from_object(Config)

# Configurar CORS
CORS(app)

# Configurar base de datos
engine = create_engine(app.config['SQLALCHEMY_DATABASE_URI'])
Base.metadata.create_all(engine)

# Configurar rutas
create_routes(app, engine)

@app.route('/')
def index():
    return render_template('index.html')

if __name__ == '__main__':
    app.run(debug=True)
