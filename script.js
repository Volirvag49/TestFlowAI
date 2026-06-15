/**
 * TestFlow TMS AI — Landing Page Scripts
 * Плавный скролл, копирование email, анимации при скролле, аналитика
 */
(function () {
    'use strict';

    // ===== КОПИРОВАНИЕ EMAIL =====
    window.copyEmailAddress = function () {
        var emailField = document.getElementById('emailToCopy');
        var copyButton = document.getElementById('copyBtn');
        var btnText = copyButton.querySelector('.btn-text');

        if (!emailField || !copyButton) return;

        // Копируем в буфер обмена
        emailField.select();
        emailField.setSelectionRange(0, 99999);

        try {
            navigator.clipboard.writeText(emailField.value);
        } catch (e) {
            // Fallback для старых браузеров
            document.execCommand('copy');
        }

        // Визуальная обратная связь
        copyButton.classList.add('copied');
        if (btnText) {
            btnText.textContent = 'Скопировано! ✓';
        }

        // Возвращаем исходное состояние
        setTimeout(function () {
            copyButton.classList.remove('copied');
            if (btnText) {
                btnText.textContent = 'Скопировать почту';
            }
        }, 2500);
    };

    // ===== ПЛАВНЫЙ СКРОЛЛ ДЛЯ ЯКОРНЫХ ССЫЛОК (с учётом sticky header) =====
    var HEADER_HEIGHT = 68;
    var anchorLinks = document.querySelectorAll('a[href^="#"]');

    anchorLinks.forEach(function (link) {
        link.addEventListener('click', function (e) {
            var targetId = this.getAttribute('href');
            if (!targetId || targetId === '#') return;

            var target = document.querySelector(targetId);
            if (!target) return;

            e.preventDefault();

            var targetPosition = target.getBoundingClientRect().top + window.pageYOffset - HEADER_HEIGHT - 16;

            window.scrollTo({
                top: targetPosition,
                behavior: 'smooth'
            });

            // Обновляем URL без перезагрузки
            if (history.pushState) {
                history.pushState(null, null, targetId);
            }
        });
    });

    // ===== АНИМАЦИЯ ПРИ СКРОЛЛЕ (Intersection Observer) =====
    if ('IntersectionObserver' in window) {
        var observerOptions = {
            root: null,
            rootMargin: '0px 0px -40px 0px',
            threshold: 0.1
        };

        var observer = new IntersectionObserver(function (entries) {
            entries.forEach(function (entry) {
                if (entry.isIntersecting) {
                    entry.target.style.opacity = '1';
                    entry.target.style.transform = 'translateY(0)';
                    observer.unobserve(entry.target);
                }
            });
        }, observerOptions);

        // Наблюдаем за карточками и статами
        var animatedElements = document.querySelectorAll('.feature-card, .stat-card, .cta-box');
        animatedElements.forEach(function (el) {
            observer.observe(el);
        });
    }

    // ===== ОПРЕДЕЛЕНИЕ ТЕКУЩЕЙ СЕКЦИИ ДЛЯ НАВИГАЦИИ =====
    if ('IntersectionObserver' in window) {
        var sections = document.querySelectorAll('section[id]');
        var navLinks = document.querySelectorAll('.nav-links a[href^="#"]');

        var sectionObserver = new IntersectionObserver(function (entries) {
            entries.forEach(function (entry) {
                if (entry.isIntersecting) {
                    var id = entry.target.getAttribute('id');
                    navLinks.forEach(function (link) {
                        var href = link.getAttribute('href');
                        if (href === '#' + id) {
                            link.style.color = 'var(--text-primary)';
                        } else {
                            link.style.color = '';
                        }
                    });
                }
            });
        }, {
            rootMargin: '-30% 0px -65% 0px',
            threshold: 0
        });

        sections.forEach(function (section) {
            sectionObserver.observe(section);
        });
    }

    // ===== ЗАГРУЗКА IFrame ПОСЛЕ ОСНОВНОГО КОНТЕНТА (Lazy) =====
    // Уже используется loading="lazy" на iframe,
    // но для браузеров без поддержки — загружаем отложенно
    var videoIframe = document.querySelector('.video-wrapper iframe');
    if (videoIframe && !('loading' in HTMLIFrameElement.prototype)) {
        // Fallback: добавляем src только при приближении к видео
        var iframeSrc = videoIframe.getAttribute('src');
        videoIframe.removeAttribute('src');
        videoIframe.setAttribute('data-src', iframeSrc);

        var iframeObserver = new IntersectionObserver(function (entries) {
            entries.forEach(function (entry) {
                if (entry.isIntersecting) {
                    var src = entry.target.getAttribute('data-src');
                    if (src) {
                        entry.target.setAttribute('src', src);
                        entry.target.removeAttribute('data-src');
                    }
                    iframeObserver.unobserve(entry.target);
                }
            });
        }, { rootMargin: '200px' });

        iframeObserver.observe(videoIframe);
    }

    // ===== ОБРАБОТКА КЛАВИАТУРЫ (a11y) =====
    document.addEventListener('keydown', function (e) {
        // Escape — снять фокус с активного элемента
        if (e.key === 'Escape') {
            if (document.activeElement) {
                document.activeElement.blur();
            }
        }
    });

})();
