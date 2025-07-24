// Declaraciones globales para bibliotecas externas
interface JQueryStatic {
    (selector: string): JQuery;
    (element: HTMLElement | Document): JQuery;
    (callback: () => void): void;
}

interface JQuery {
    DataTable(options?: DataTableOptions): DataTable;
    on(event: string, handler: (e: Event) => void): JQuery;
    ready(callback: () => void): JQuery;
    append(content: string): JQuery;
    html(content: string): JQuery;
    last(): JQuery;
    fadeOut(callback?: () => void): JQuery;
    remove(): JQuery;
}

interface DataTableOptions {
    language?: {
        url?: string;
    };
    responsive?: boolean;
    pageLength?: number;
    order?: [number, string][];
    columnDefs?: Array<{
        targets: number[];
        orderable: boolean;
    }>;
}

interface DataTable {
    clear(): DataTable;
    row: {
        add(data: (string | number)[]): DataTable;
    };
    draw(): DataTable;
}

interface BootstrapModal {
    show(): void;
    hide(): void;
}

interface BootstrapStatic {
    Modal: {
        new(element: HTMLElement): BootstrapModal;
        getInstance(element: HTMLElement): BootstrapModal | null;
    };
}

declare var $: JQueryStatic;
declare var bootstrap: BootstrapStatic;

// Interfaces para el tipado estricto
interface User {
    id: number;
    name: string;
    email: string;
    phone: string;
    registration_date: string;
    active: boolean;
    current_loan?: CurrentLoan | null;
}

interface Book {
    id: number;
    title: string;
    author: string;
    isbn: string;
    genre: string;
    publication_date: string;
    available: boolean;
}

interface Loan {
    id: number;
    user_id: number;
    book_id: number;
    loan_date: string;
    expected_return_date: string;
    actual_return_date: string | null;
    status: 'active' | 'returned';
}

interface CurrentLoan {
    loan_id: number;
    book_title: string;
    book_author: string;
    loan_date: string;
    expected_return_date: string;
}

interface ApiResponse<T> {
    data?: T;
    error?: string;
    errors?: Record<string, string[]>;
}

class LibrarySystem {
    private usersTable!: DataTable;
    private currentLoanId: number | null = null;

    constructor() {
        this.initializeDataTable();
        this.attachEventListeners();
        this.loadUsers();
    }

    private initializeDataTable(): void {
        this.usersTable = $('#usersTable').DataTable({
            language: {
                url: 'https://cdn.datatables.net/plug-ins/1.13.6/i18n/es-ES.json'
            },
            responsive: true,
            pageLength: 10,
            order: [[0, 'asc']],
            columnDefs: [
                {
                    targets: [5, 6, 7],
                    orderable: false
                }
            ]
        });
    }

    private attachEventListeners(): void {
        // Formulario de usuario
        $('#userForm').on('submit', (e: Event) => {
            e.preventDefault();
            this.handleUserSubmit();
        });

        // Formulario de libro
        $('#bookForm').on('submit', (e: Event) => {
            e.preventDefault();
            this.handleBookSubmit();
        });

        // Formulario de préstamo
        $('#loanForm').on('submit', (e: Event) => {
            e.preventDefault();
            this.handleLoanSubmit();
        });

        // Modal de préstamo
        $('#loanModal').on('show.bs.modal', () => {
            this.loadLoanFormData();
        });

        // Botón de devolver libro
        $('#returnBookBtn').on('click', () => {
            this.returnBook();
        });

        // Validación
        this.setupRealTimeValidation();
    }

    private setupRealTimeValidation(): void {
        // Validación para campos de usuario
        $('#userName').on('blur', (e: Event) => this.validateField(e.target as HTMLInputElement, 'name'));
        $('#userEmail').on('blur', (e: Event) => this.validateField(e.target as HTMLInputElement, 'email'));
        $('#userPhone').on('blur', (e: Event) => this.validateField(e.target as HTMLInputElement, 'phone'));

        // Validación para campos de libro
        $('#bookTitle').on('blur', (e: Event) => this.validateField(e.target as HTMLInputElement, 'title'));
        $('#bookAuthor').on('blur', (e: Event) => this.validateField(e.target as HTMLInputElement, 'author'));
        $('#bookIsbn').on('blur', (e: Event) => this.validateField(e.target as HTMLInputElement, 'isbn'));
        $('#bookGenre').on('blur', (e: Event) => this.validateField(e.target as HTMLInputElement, 'genre'));
        $('#bookPublicationDate').on('blur', (e: Event) => this.validateField(e.target as HTMLInputElement, 'publication_date'));
    }

    private validateField(field: HTMLInputElement, fieldType: string): boolean {
        const value = field.value.trim();
        let isValid = true;
        let errorMessage = '';

        switch (fieldType) {
            case 'name':
            case 'title':
            case 'author':
            case 'genre':
                if (!value) {
                    isValid = false;
                    errorMessage = 'Este campo es obligatorio';
                } else if (value.length < 2) {
                    isValid = false;
                    errorMessage = 'Mínimo 2 caracteres';
                } else if (fieldType === 'title' && value.length > 200) {
                    isValid = false;
                    errorMessage = 'Máximo 200 caracteres';
                } else if (fieldType === 'name' && value.length > 100) {
                    isValid = false;
                    errorMessage = 'Máximo 100 caracteres';
                } else if (fieldType === 'author' && value.length > 100) {
                    isValid = false;
                    errorMessage = 'Máximo 100 caracteres';
                } else if (fieldType === 'genre' && value.length > 50) {
                    isValid = false;
                    errorMessage = 'Máximo 50 caracteres';
                }
                break;

            case 'email':
                const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                if (!value) {
                    isValid = false;
                    errorMessage = 'El email es obligatorio';
                } else if (!emailRegex.test(value)) {
                    isValid = false;
                    errorMessage = 'Email inválido';
                }
                break;

            case 'phone':
                if (!value) {
                    isValid = false;
                    errorMessage = 'El teléfono es obligatorio';
                } else if (value.length < 8) {
                    isValid = false;
                    errorMessage = 'Mínimo 8 caracteres';
                } else if (value.length > 20) {
                    isValid = false;
                    errorMessage = 'Máximo 20 caracteres';
                }
                break;

            case 'isbn':
                if (!value) {
                    isValid = false;
                    errorMessage = 'El ISBN es obligatorio';
                } else if (value.length < 10 || value.length > 13) {
                    isValid = false;
                    errorMessage = 'ISBN debe tener entre 10 y 13 caracteres';
                }
                break;

            case 'publication_date':
                if (!value) {
                    isValid = false;
                    errorMessage = 'La fecha es obligatoria';
                } else if (new Date(value) > new Date()) {
                    isValid = false;
                    errorMessage = 'La fecha no puede ser futura';
                }
                break;
        }

        this.setFieldValidation(field, isValid, errorMessage);
        return isValid;
    }

    private setFieldValidation(field: HTMLInputElement, isValid: boolean, message: string): void {
        const feedbackElement = field.parentElement?.querySelector('.invalid-feedback') as HTMLElement;

        if (isValid) {
            field.classList.remove('is-invalid');
            field.classList.add('is-valid');
            if (feedbackElement) feedbackElement.textContent = '';
        } else {
            field.classList.remove('is-valid');
            field.classList.add('is-invalid');
            if (feedbackElement) feedbackElement.textContent = message;
        }
    }

    private async loadUsers(): Promise<void> {
        try {
            const response = await fetch('/api/users');
            const users: User[] = await response.json();

            this.usersTable.clear();

            users.forEach(user => {
                const statusBadge = user.active
                    ? '<span class="badge bg-success">Activo</span>'
                    : '<span class="badge bg-secondary">Inactivo</span>';

                const loanInfo = user.current_loan
                    ? `<span class="text-primary">${user.current_loan.book_title}</span>`
                    : '<span class="text-muted">Sin préstamo</span>';

                const actions = user.current_loan
                    ? `<button class="btn btn-info btn-sm" onclick="librarySystem.showLoanInfo(${user.id}, '${user.name}', ${user.current_loan.loan_id})">
                         <i class="fas fa-eye"></i> Ver Info
                       </button>`
                    : '<span class="text-muted">-</span>';

                this.usersTable.row.add([
                    user.id,
                    user.name,
                    user.email,
                    user.phone,
                    new Date(user.registration_date).toLocaleDateString('es-ES'),
                    statusBadge,
                    loanInfo,
                    actions
                ]);
            });

            this.usersTable.draw();
        } catch (error) {
            console.error('Error loading users:', error);
            this.showAlert('Error al cargar usuarios', 'danger');
        }
    }

    public async showLoanInfo(userId: number, userName: string, loanId: number): Promise<void> {
        try {
            const response = await fetch('/api/users');
            const users: User[] = await response.json();
            const user = users.find(u => u.id === userId);

            if (!user || !user.current_loan) {
                this.showAlert('No se encontró información del préstamo', 'warning');
                return;
            }

            const loan = user.current_loan;
            const loanDate = new Date(loan.loan_date).toLocaleDateString('es-ES');
            const returnDate = new Date(loan.expected_return_date).toLocaleDateString('es-ES');
            const isOverdue = new Date(loan.expected_return_date) < new Date();

            const content = `
                <div class="row">
                    <div class="col-md-6">
                        <h6><i class="fas fa-user me-2"></i>Usuario</h6>
                        <p class="mb-3">${userName}</p>

                        <h6><i class="fas fa-book me-2"></i>Libro</h6>
                        <p class="mb-1"><strong>${loan.book_title}</strong></p>
                        <p class="text-muted mb-3">${loan.book_author}</p>
                    </div>
                    <div class="col-md-6">
                        <h6><i class="fas fa-calendar me-2"></i>Fecha de Préstamo</h6>
                        <p class="mb-3">${loanDate}</p>

                        <h6><i class="fas fa-calendar-check me-2"></i>Fecha de Devolución</h6>
                        <p class="mb-3 ${isOverdue ? 'text-danger fw-bold' : ''}">${returnDate}</p>

                        ${isOverdue ? '<div class="alert alert-danger"><i class="fas fa-exclamation-triangle me-2"></i>¡Préstamo vencido!</div>' : ''}
                    </div>
                </div>
            `;

            $('#loanInfoContent').html(content);
            this.currentLoanId = loanId;

            const modal = new bootstrap.Modal(document.getElementById('loanInfoModal')!);
            modal.show();
        } catch (error) {
            console.error('Error loading loan info:', error);
            this.showAlert('Error al cargar información del préstamo', 'danger');
        }
    }

    private async handleUserSubmit(): Promise<void> {
        const form = document.getElementById('userForm') as HTMLFormElement;
        const formData = new FormData(form);

        // Validar todos los campos
        const nameField = document.getElementById('userName') as HTMLInputElement;
        const emailField = document.getElementById('userEmail') as HTMLInputElement;
        const phoneField = document.getElementById('userPhone') as HTMLInputElement;

        const isNameValid = this.validateField(nameField, 'name');
        const isEmailValid = this.validateField(emailField, 'email');
        const isPhoneValid = this.validateField(phoneField, 'phone');

        if (!isNameValid || !isEmailValid || !isPhoneValid) {
            return;
        }

        const userData = {
            name: formData.get('name') as string,
            email: formData.get('email') as string,
            phone: formData.get('phone') as string
        };

        try {
            const response = await fetch('/api/users', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(userData)
            });

            const result = await response.json();

            if (response.ok) {
                this.showAlert('Usuario creado exitosamente', 'success');
                form.reset();
                this.clearFormValidation(form);
                bootstrap.Modal.getInstance(document.getElementById('userModal')!)?.hide();
                this.loadUsers();
            } else {
                if (result.errors) {
                    this.displayFormErrors(form, result.errors);
                } else {
                    this.showAlert(result.error || 'Error al crear usuario', 'danger');
                }
            }
        } catch (error) {
            console.error('Error creating user:', error);
            this.showAlert('Error de conexión', 'danger');
        }
    }

    private async handleBookSubmit(): Promise<void> {
        const form = document.getElementById('bookForm') as HTMLFormElement;
        const formData = new FormData(form);

        // Validar todos los campos
        const titleField = document.getElementById('bookTitle') as HTMLInputElement;
        const authorField = document.getElementById('bookAuthor') as HTMLInputElement;
        const isbnField = document.getElementById('bookIsbn') as HTMLInputElement;
        const genreField = document.getElementById('bookGenre') as HTMLInputElement;
        const dateField = document.getElementById('bookPublicationDate') as HTMLInputElement;

        const isTitleValid = this.validateField(titleField, 'title');
        const isAuthorValid = this.validateField(authorField, 'author');
        const isIsbnValid = this.validateField(isbnField, 'isbn');
        const isGenreValid = this.validateField(genreField, 'genre');
        const isDateValid = this.validateField(dateField, 'publication_date');

        if (!isTitleValid || !isAuthorValid || !isIsbnValid || !isGenreValid || !isDateValid) {
            return;
        }

        const bookData = {
            title: formData.get('title') as string,
            author: formData.get('author') as string,
            isbn: formData.get('isbn') as string,
            genre: formData.get('genre') as string,
            publication_date: formData.get('publication_date') as string
        };

        try {
            const response = await fetch('/api/books', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(bookData)
            });

            const result = await response.json();

            if (response.ok) {
                this.showAlert('Libro creado exitosamente', 'success');
                form.reset();
                this.clearFormValidation(form);
                bootstrap.Modal.getInstance(document.getElementById('bookModal')!)?.hide();
            } else {
                if (result.errors) {
                    this.displayFormErrors(form, result.errors);
                } else {
                    this.showAlert(result.error || 'Error al crear libro', 'danger');
                }
            }
        } catch (error) {
            console.error('Error creating book:', error);
            this.showAlert('Error de conexión', 'danger');
        }
    }

    private async loadLoanFormData(): Promise<void> {
        try {
            // Cargar usuarios activos sin préstamos
            const usersResponse = await fetch('/api/users');
            const users: User[] = await usersResponse.json();
            const availableUsers = users.filter(u => u.active && !u.current_loan);

            // Cargar libros disponibles
            const booksResponse = await fetch('/api/books/available');
            const books: Book[] = await booksResponse.json();

            // Llenar select de usuarios
            const userSelect = document.getElementById('loanUserId') as HTMLSelectElement;
            userSelect.innerHTML = '<option value="">Seleccionar usuario...</option>';
            availableUsers.forEach(user => {
                const option = document.createElement('option');
                option.value = user.id.toString();
                option.textContent = user.name;
                userSelect.appendChild(option);
            });

            // Llenar select de libros
            const bookSelect = document.getElementById('loanBookId') as HTMLSelectElement;
            bookSelect.innerHTML = '<option value="">Seleccionar libro...</option>';
            books.forEach(book => {
                const option = document.createElement('option');
                option.value = book.id.toString();
                option.textContent = `${book.title} - ${book.author}`;
                bookSelect.appendChild(option);
            });

        } catch (error) {
            console.error('Error loading loan form data:', error);
            this.showAlert('Error al cargar datos del formulario', 'danger');
        }
    }

    private async handleLoanSubmit(): Promise<void> {
        const form = document.getElementById('loanForm') as HTMLFormElement;
        const formData = new FormData(form);

        const loanData = {
            user_id: parseInt(formData.get('user_id') as string),
            book_id: parseInt(formData.get('book_id') as string)
        };

        try {
            const response = await fetch('/api/loans', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(loanData)
            });

            const result = await response.json();

            if (response.ok) {
                this.showAlert('Préstamo creado exitosamente', 'success');
                form.reset();
                this.clearFormValidation(form);
                bootstrap.Modal.getInstance(document.getElementById('loanModal')!)?.hide();
                this.loadUsers();
            } else {
                if (result.errors) {
                    this.displayFormErrors(form, result.errors);
                } else {
                    this.showAlert(result.error || 'Error al crear préstamo', 'danger');
                }
            }
        } catch (error) {
            console.error('Error creating loan:', error);
            this.showAlert('Error de conexión', 'danger');
        }
    }

    private async returnBook(): Promise<void> {
        if (!this.currentLoanId) return;

        try {
            const response = await fetch(`/api/loans/${this.currentLoanId}/return`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json'
                }
            });

            const result = await response.json();

            if (response.ok) {
                this.showAlert('Libro devuelto exitosamente', 'success');
                bootstrap.Modal.getInstance(document.getElementById('loanInfoModal')!)?.hide();
                this.loadUsers();
            } else {
                this.showAlert(result.error || 'Error al devolver libro', 'danger');
            }
        } catch (error) {
            console.error('Error returning book:', error);
            this.showAlert('Error de conexión', 'danger');
        }
    }

    private displayFormErrors(form: HTMLFormElement, errors: Record<string, string[]>): void {
        Object.keys(errors).forEach(fieldName => {
            const field = form.querySelector(`[name="${fieldName}"]`) as HTMLInputElement;
            if (field) {
                const errorMessage = errors[fieldName][0];
                this.setFieldValidation(field, false, errorMessage);
            }
        });
    }

    private clearFormValidation(form: HTMLFormElement): void {
        const fields = form.querySelectorAll('.form-control, .form-select');
        fields.forEach(field => {
            field.classList.remove('is-valid', 'is-invalid');
        });

        const feedbacks = form.querySelectorAll('.invalid-feedback');
        feedbacks.forEach(feedback => {
            (feedback as HTMLElement).textContent = '';
        });
    }

    private showAlert(message: string, type: 'success' | 'danger' | 'warning' | 'info'): void {
        const alertHtml = `
            <div class="alert alert-${type} alert-dismissible fade show position-fixed"
                style="top: 20px; right: 20px; z-index: 9999; min-width: 300px;" role="alert">
                <i class="fas fa-${type === 'success' ? 'check-circle' : type === 'danger' ? 'exclamation-circle' : 'info-circle'} me-2"></i>
                ${message}
                <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
            </div>
        `;

        $('body').append(alertHtml);


        setTimeout(() => {
            $('.alert').last().fadeOut(() => {
                $('.alert').last().remove();
            });
        }, 5000);
    }
}


let librarySystem: LibrarySystem;

$(document).ready(() => {
    librarySystem = new LibrarySystem();
});
