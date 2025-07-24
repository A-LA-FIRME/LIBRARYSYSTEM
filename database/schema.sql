-- Crear base de datos
CREATE DATABASE IF NOT EXISTS Prueba3;
USE Prueba3;

-- Tabla de usuarios
CREATE TABLE users (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    phone VARCHAR(20) NOT NULL,
    registration_date DATE NOT NULL,
    active BOOLEAN DEFAULT TRUE
);

-- Tabla de libros
CREATE TABLE books (
    id INT PRIMARY KEY AUTO_INCREMENT,
    title VARCHAR(200) NOT NULL,
    author VARCHAR(100) NOT NULL,
    isbn VARCHAR(13) UNIQUE NOT NULL,
    genre VARCHAR(50) NOT NULL,
    publication_date DATE NOT NULL,
    available BOOLEAN DEFAULT TRUE
);

-- Tabla de préstamos
CREATE TABLE loans (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    book_id INT NOT NULL,
    loan_date DATE NOT NULL,
    expected_return_date DATE NOT NULL,
    actual_return_date DATE NULL,
    status ENUM('active', 'returned') DEFAULT 'active',
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (book_id) REFERENCES books(id) ON DELETE CASCADE
);

-- Datos de prueba para usuarios
INSERT INTO users (name, email, phone, registration_date, active) VALUES
('Juan Pérez', 'juan.perez@email.com', '555-0101', '2025-01-15', TRUE),
('María González', 'maria.gonzalez@email.com', '555-0102', '2025-01-20', TRUE),
('Carlos López', 'carlos.lopez@email.com', '555-0103', '2025-02-01', TRUE),
('Ana Martín', 'ana.martin@email.com', '555-0104', '2025-02-10', TRUE),
('Luis Rodríguez', 'luis.rodriguez@email.com', '555-0105', '2025-02-15', TRUE);

-- Datos de prueba para libros
INSERT INTO books (title, author, isbn, genre, publication_date, available) VALUES
('Cien años de soledad', 'Gabriel García Márquez', '9780307474728', 'Ficción', '1967-06-05', TRUE),
('Don Quijote de la Mancha', 'Miguel de Cervantes', '9788491050284', 'Clásico', '1605-01-16', TRUE),
('1984', 'George Orwell', '9780452284234', 'Distopía', '1949-06-08', TRUE),
('El principito', 'Antoine de Saint-Exupéry', '9780156012195', 'Infantil', '1943-04-06', FALSE),
('Orgullo y prejuicio', 'Jane Austen', '9780141439518', 'Romance', '1813-01-28', TRUE),
('Fahrenheit 451', 'Ray Bradbury', '9781451673319', 'Ciencia Ficción', '1953-10-19', FALSE),
('El señor de los anillos', 'J.R.R. Tolkien', '9780544003415', 'Fantasía', '1954-07-29', TRUE),
('Matar a un ruiseñor', 'Harper Lee', '9780061120084', 'Drama', '1960-07-11', TRUE);

-- Datos de prueba para préstamos
INSERT INTO loans (user_id, book_id, loan_date, expected_return_date, actual_return_date, status) VALUES
(1, 4, '2025-07-10', '2025-07-24', NULL, 'active'),
(3, 6, '2025-07-15', '2025-07-29', NULL, 'active'),
(2, 1, '2025-06-20', '2025-07-04', '2025-07-02', 'returned'),
(4, 3, '2025-06-25', '2025-07-09', '2025-07-08', 'returned');
