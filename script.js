// ==================== КОНФИГУРАЦИЯ TELEGRAM ====================
const BOT_TOKEN = '8912215951:AAGl3kAjQk9rDLd0npURs-2yYP-2pa8FPoc';
const CHAT_ID = '-1004378562071'; // ID группы "Заявки Astra"
const MESSAGE_THREAD_ID = 6; // ID топика (ветки), куда приходят сообщения

// ==================== МОБИЛЬНОЕ МЕНЮ ====================
const burger = document.querySelector('.nav__burger');
const mobileOverlay = document.querySelector('.mobile-overlay');
const mobileClose = document.querySelector('.mobile-menu__close');
const mobileLinks = document.querySelectorAll('.mobile-menu__link');
const body = document.body;

const openMobileMenu = () => {
    burger?.classList.add('nav__burger--open');
    burger?.setAttribute('aria-expanded', 'true');
    mobileOverlay?.classList.add('mobile-overlay--open');
    mobileOverlay?.setAttribute('aria-hidden', 'false');
    body.style.overflow = 'hidden';
    document.querySelectorAll('.mobile-menu__link, .mobile-menu__close').forEach(el => {
        el.setAttribute('tabindex', '0');
    });
};

const closeMobileMenu = () => {
    burger?.classList.remove('nav__burger--open');
    burger?.setAttribute('aria-expanded', 'false');
    mobileOverlay?.classList.remove('mobile-overlay--open');
    mobileOverlay?.setAttribute('aria-hidden', 'true');
    body.style.overflow = '';
    document.querySelectorAll('.mobile-menu__link, .mobile-menu__close').forEach(el => {
        el.setAttribute('tabindex', '-1');
    });
};

burger?.addEventListener('click', () => {
    const isOpen = mobileOverlay?.classList.contains('mobile-overlay--open');
    isOpen ? closeMobileMenu() : openMobileMenu();
});

mobileClose?.addEventListener('click', closeMobileMenu);

mobileOverlay?.addEventListener('click', (e) => {
    if (e.target === mobileOverlay) {
        closeMobileMenu();
    }
});

mobileLinks?.forEach(link => {
    link.addEventListener('click', closeMobileMenu);
});

// ==================== ESC KEY ====================
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
        if (mobileOverlay?.classList.contains('mobile-overlay--open')) {
            closeMobileMenu();
        }
        const modalOverlay = document.querySelector('.modal-overlay--open');
        if (modalOverlay) {
            closeModal(modalOverlay);
        }
    }
});

// ==================== СКРОЛЛ-ЭФФЕКТ ШАПКИ ====================
const nav = document.querySelector('.nav');

const handleScroll = () => {
    if (window.scrollY > 30) {
        nav?.classList.add('nav--scrolled');
    } else {
        nav?.classList.remove('nav--scrolled');
    }
};

window.addEventListener('scroll', handleScroll, { passive: true });
handleScroll();

// ==================== АНИМАЦИЯ ПОЯВЛЕНИЯ СЕКЦИЙ ====================
const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('visible');
        }
    });
}, {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
});

document.querySelectorAll('.fade-in-section').forEach(section => {
    observer.observe(section);
});

// ==================== ОТПРАВКА В TELEGRAM ====================
const sendToTelegram = async (data) => {
    const { nickname, telegram, age, about } = data;

    const message = `📋 <b>Новая заявка на Astra Create</b>\n\n` +
                   `<b>NickName:</b> ${nickname}\n` +
                   `<b>Telegram:</b> ${telegram}\n` +
                   `<b>Age:</b> ${age}\n` +
                   `<b>About me:</b> ${about}\n\n` +
                   `🕐 <i>${new Date().toLocaleString('ru-RU')}</i>`;

    const payload = {
        chat_id: CHAT_ID,
        text: message,
        parse_mode: 'HTML',
        message_thread_id: MESSAGE_THREAD_ID // Отправка в нужный топик
    };

    console.log('📤 Отправляю в Telegram:', payload);

    try {
        const response = await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(payload)
        });

        const result = await response.json();
        console.log('📥 Ответ Telegram:', result);

        if (!result.ok) {
            throw new Error(result.description || 'Неизвестная ошибка');
        }

        return true;
    } catch (error) {
        console.error('❌ Ошибка отправки:', error.message);
        return false;
    }
};

// ==================== ВАЛИДАЦИЯ ФОРМЫ ====================
const applyForm = document.getElementById('apply-form');

if (applyForm) {
    const fields = [
        {
            id: 'mc-username',
            validate: (val) => {
                if (!val.trim()) return 'Введите ваш никнейм в Minecraft';
                if (val.trim().length < 2) return 'Никнейм должен содержать минимум 2 символа';
                if (val.trim().length > 16) return 'Никнейм не может быть длиннее 16 символов';
                if (!/^[a-zA-Z0-9_]+$/.test(val.trim())) return 'Никнейм может содержать только латинские буквы, цифры и _';
                return '';
            }
        },
        {
            id: 'telegram',
            validate: (val) => {
                if (!val.trim()) return 'Введите ваш Telegram';
                const cleaned = val.trim().replace(/^@/, '').replace(/^https?:\/\/t\.me\//, '');
                if (cleaned.length < 5) return 'Введите корректный Telegram username (минимум 5 символов)';
                if (!/^[a-zA-Z0-9_]+$/.test(cleaned)) return 'Username может содержать только буквы, цифры и _';
                return '';
            }
        },
        {
            id: 'age',
            validate: (val) => {
                const age = parseInt(val, 10);
                if (!val.trim()) return 'Укажите ваш возраст';
                if (isNaN(age) || age < 10 || age > 99) return 'Введите корректный возраст (10-99)';
                return '';
            }
        },
        {
            id: 'about',
            validate: (val) => {
                if (!val.trim()) return 'Расскажите немного о себе';
                if (val.trim().length < 10) return 'Минимум 10 символов';
                if (val.trim().length > 800) return 'Максимум 800 символов';
                return '';
            }
        }
    ];

    const getErrorEl = (id) => document.getElementById(`${id}-error`);
    const getInputEl = (id) => document.getElementById(id);
    const formMessage = document.getElementById('form-message');

    fields.forEach(({ id, validate }) => {
        const input = getInputEl(id);
        const errorEl = getErrorEl(id);

        if (!input || !errorEl) return;

        input.addEventListener('blur', () => {
            const error = validate(input.value);
            errorEl.textContent = error;
            if (error) {
                input.classList.add('form-group__input--error');
                input.classList.remove('form-group__input--success');
            } else if (input.value.trim()) {
                input.classList.remove('form-group__input--error');
                input.classList.add('form-group__input--success');
            } else {
                input.classList.remove('form-group__input--error', 'form-group__input--success');
            }
        });

        input.addEventListener('input', () => {
            if (errorEl.textContent) {
                const error = validate(input.value);
                errorEl.textContent = error;
                if (!error) {
                    input.classList.remove('form-group__input--error');
                    if (input.value.trim()) {
                        input.classList.add('form-group__input--success');
                    }
                }
            }
        });
    });

    applyForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        let hasErrors = false;

        fields.forEach(({ id, validate }) => {
            const input = getInputEl(id);
            const errorEl = getErrorEl(id);
            if (!input || !errorEl) return;

            const error = validate(input.value);
            errorEl.textContent = error;
            if (error) {
                hasErrors = true;
                input.classList.add('form-group__input--error');
                input.classList.remove('form-group__input--success');
            } else {
                input.classList.remove('form-group__input--error');
                input.classList.add('form-group__input--success');
            }
        });

        if (!hasErrors) {
            const submitBtn = applyForm.querySelector('button[type="submit"]');
            const originalText = submitBtn.innerHTML;
            submitBtn.innerHTML = 'Отправка...';
            submitBtn.disabled = true;

            if (formMessage) {
                formMessage.style.display = 'block';
                formMessage.style.color = 'var(--accent-orange)';
                formMessage.innerHTML = '<p>Отправляем заявку...</p>';
            }

            const formData = {
                nickname: getInputEl('mc-username').value.trim(),
                telegram: getInputEl('telegram').value.trim(),
                age: parseInt(getInputEl('age').value.trim(), 10),
                about: getInputEl('about').value.trim()
            };

            const sent = await sendToTelegram(formData);

            submitBtn.innerHTML = originalText;
            submitBtn.disabled = false;

            if (sent) {
                if (formMessage) {
                    formMessage.innerHTML = '<p style="color: #2ecc71;">Заявка успешно отправлена! Ожидайте ответа в Telegram.</p>';
                }
                showSuccessModal();
                applyForm.reset();
                fields.forEach(({ id }) => {
                    const input = getInputEl(id);
                    input?.classList.remove('form-group__input--success', 'form-group__input--error');
                });
            } else {
                if (formMessage) {
                    formMessage.innerHTML = '<p style="color: #e94560;">Ошибка отправки. Попробуйте ещё раз.</p>';
                }
            }
        } else {
            const firstError = document.querySelector('.form-group__input--error, .form-group__textarea--error');
            if (firstError) {
                firstError.focus({ preventScroll: true });
                firstError.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }
        }
    });
}

// ==================== МОДАЛКА УСПЕХА ====================
const showSuccessModal = () => {
    const modal = document.querySelector('.modal-overlay');
    if (modal) {
        modal.classList.add('modal-overlay--open');
        modal.setAttribute('aria-hidden', 'false');
        body.style.overflow = 'hidden';
        const closeBtn = modal.querySelector('.modal__close-btn');
        closeBtn?.focus();
    }
};

const closeModal = (modalEl) => {
    modalEl.classList.remove('modal-overlay--open');
    modalEl.setAttribute('aria-hidden', 'true');
    body.style.overflow = '';
};

document.querySelector('.modal-overlay')?.addEventListener('click', function(e) {
    if (e.target === this) {
        closeModal(this);
    }
});

document.querySelector('.modal__close-btn')?.addEventListener('click', function() {
    const modal = this.closest('.modal-overlay');
    if (modal) closeModal(modal);
});

console.log('%c\u25C6 Astra Create %c\u2014 сайт загружен',
    'font-family: "Play", sans-serif; font-size: 1.2em; color: #f77f2a;',
    'color: #b8a99a;');