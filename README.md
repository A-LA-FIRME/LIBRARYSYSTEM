# Sistema de Gestión de Préstamos de Biblioteca

Sistema web para gestión de préstamos de libros con Flask y TypeScript.

## Características

- CRUD de usuarios y libros
- Sistema de préstamos (1 libro por usuario)
- Validación en tiempo real
- Interfaz responsiva con Bootstrap 5

## Requisitos

- Python 3.8+
- MySQL 5.7+
- Node.js (para TypeScript)

## Instalación

1. **Clonar y entrar al directorio:**

```bash
cd LIBRARYSYSTEM
```

2. **Crear entorno virtual:**

```bash
python -m venv venv
# Windows
venv\Scripts\activate
# Linux/MacOS
source venv/bin/activate
```

3. **Instalar dependencias:**

```bash
pip install -r requirements.txt
```

4. **Configurar variables de entorno (.env):**

```env
DB_HOST=localhost
DB_USER=tu_usuario_mysql
DB_PASSWORD=tu_contraseña_mysql
DB_NAME=Prueba3
```

5. **Compilar TypeScript:**

```bash
npx tsc
```

6. **Ejecutar aplicación:**

```bash
python app.py
```

Aplicación disponible en: `http://localhost:5000`

## Estructura del Proyecto

```
LIBRARYSYSTEM/
├── app.py
├── config.py
├── requirements.txt
├── package.json
├── tsconfig.json
├── README.md
├── database/
│   └── schema.sql
├── models/
│   ├── __init__.py
├── routes/
│   ├── __init__.py
├── static/
│   ├── css/
│   │   └── styles.css
│   ├── js/
│   │   ├── main.js
│   │   └── main.ts
├── templates/
│   └── index.html
```

## Stack Tecnológico

**Backend:** Flask, SQLAlchemy, PyMySQL, Marshmallow
**Frontend:** TypeScript, jQuery, DataTables, Bootstrap 5
**Base de Datos:** MySQL

## Comandos Útiles

```bash
# Activar entorno
venv\Scripts\activate          # Windows
source venv/bin/activate       # Linux/Mac

# Compilar TypeScript
npx tsc

# Ejecutar app
python app.py
```

## Licencia

MIT
