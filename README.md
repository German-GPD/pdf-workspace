<p align="center">
  <img src="assets/readme-cover.svg" alt="PDF Workspace — концепция интерфейса" width="100%">
</p>

<h1 align="center">PDF Workspace</h1>
<p align="center"><strong>Ваши документы. Ваше пространство.</strong></p>

<p align="center"><a href="https://github.com/German-GPD/pdf-workspace/releases/latest/download/PDF-Workspace-setup.exe"><img src="https://img.shields.io/badge/Download-Windows%20Installer-254d35?style=for-the-badge&logo=windows&logoColor=white" alt="Download PDF Workspace for Windows"></a></p>

<p align="center">
  <img src="https://img.shields.io/badge/Windows-desktop-254d35?style=flat-square" alt="Windows">
  <img src="https://img.shields.io/badge/Free_to_use-yes-527858?style=flat-square" alt="Free to use">
  <img src="https://img.shields.io/badge/License-PW--FUL-254d35?style=flat-square" alt="PW-FUL">
  <img src="https://img.shields.io/badge/Status-MVP%20development-527858?style=flat-square" alt="Planning">
  <img src="https://img.shields.io/badge/Languages-RU%20%7C%20EN%20%7C%20ES-527858?style=flat-square" alt="Languages">
</p>

<p align="center">
  <a href="#русский">Русский</a> · <a href="#english">English</a> · <a href="#español">Español</a> ·
  <a href="https://github.com/German-GPD/pdf-workspace/releases/latest/download/PDF-Workspace-setup.exe">Download Windows installer (.exe)</a> · <a href="web/">Website</a> · <a href="https://github.com/German-GPD/pdf-workspace/issues">Issues</a>
</p>

<p align="center">
  <img src="web/assets/sticker-book.svg" width="76" height="76" alt="Book sticker">
  &nbsp;&nbsp;
  <img src="web/assets/sticker-pen.svg" width="76" height="76" alt="Pen sticker">
  &nbsp;&nbsp;
  <img src="web/assets/sticker-spark.svg" width="76" height="76" alt="Spark sticker">
</p>

> [!IMPORTANT]
> **PDF Workspace — ранняя рабочая версия (MVP) в активной разработке.** Уже реализуется настольное приложение для Windows: открытие и просмотр PDF, история, локальная библиотека и обновление из самой программы. Аннотации, экспорт и расширенная организация документов ещё в работе.

---

## Русский

**PDF Workspace** — бесплатное настольное приложение для Windows, которое объединит чтение, организацию и аннотирование PDF-документов. Проект в первую очередь ориентирован на учителей, учащихся и всех, кто регулярно работает с документами.

### Что планируется

| Раздел | Возможности |
|---|---|
| **PDF Viewer** | Просмотр страниц, поиск по тексту, масштабирование, поворот, режим двух страниц |
| **Library** | Библиотека PDF, папки, коллекции, поиск, сортировка и избранное |
| **Recent files** | История открытых документов и продолжение чтения |
| **Annotations** | Ручка, маркер, выделение, ластик, фигуры, стрелки и текстовые заметки |
| **Bookmarks & Notes** | Закладки с названиями и заметки к документам или страницам |
| **Export** | Экспорт аннотированной версии в отдельную PDF-копию |
| **Workspace** | Восстановление последней страницы, масштаба и позиции чтения |
| **Appearance** | Светлая и тёмная темы, системный акцент Windows |
| **Updates** | Проверка обновлений и установка новых версий |

### Monic Control Bar

Адаптивная настраиваемая панель управления — фирменный компонент, который планируется переиспользовать в проектах German'$ GPD.

- Перестановка кнопок и настройка порядка действий.
- Скрытие и возврат отдельных инструментов.
- Отображение: иконки, текст или иконки вместе с текстом.
- Группировка команд и контекстные действия.
- Дополнительное меню для редко используемых функций.
- Сброс пользовательской конфигурации.

### Интерфейс

- Windows Native, чёткая геометрия и компактные панели.
- Светлая и тёмная темы с выбором при первом запуске и в настройках.
- Системный цвет акцента Windows.
- Тонкие разделители вместо тяжёлых карточек.
- Режимы: обычный, компактный и фокус.
- Максимум пространства для PDF, минимум визуального шума.

### Работа с документами

- **Открыть файл** — оригинал остаётся в исходной папке, приложение сохраняет запись в истории.
- **Добавить в библиотеку** — PDF копируется в управляемое хранилище.
- Удаление записи из библиотеки не должно удалять исходный файл.
- Аннотации хранятся отдельно от оригинала.
- Экспорт создаёт новую PDF-копию, не перезаписывая исходник.
- Расположение данных можно будет выбрать: Documents, отдельная папка или диск.

### Технологическое направление

| Технология | Назначение |
|---|---|
| Tauri 2 + Rust | Desktop-оболочка и системная логика |
| WebView2 | Windows UI runtime |
| TypeScript | Frontend |
| PDF.js | Отображение PDF |
| Canvas / SVG | Слой аннотаций |
| SQLite | История, настройки, закладки и метаданные |
| Vite / Cargo | Разработка и сборка |

Стек предварительный. Совместимость и лицензии зависимостей будут проверены до релиза. Отдельно предстоит выбрать надёжный механизм экспорта аннотаций в PDF.

### Дорожная карта

- [x] Создание репозитория и концепции.
- [x] Подготовка лицензии PW-FUL.
- [x] Первичная структура сайта GitHub Pages.
- [x] Базовая архитектура Tauri 2 + Rust + TypeScript + PDF.js.
- [x] Окно приложения, открытие PDF, просмотр страниц и масштабирование.
- [x] Недавние документы, локальная библиотека и светлая/тёмная тема.
- [x] Основа подписанного механизма обновления и Windows NSIS-сборки.
- [ ] Полная реализация UI и Monic Control Bar.
- [ ] Библиотека, история и навигация.
- [ ] Аннотации, заметки и автосохранение.
- [ ] Экспорт PDF.
- [ ] Тестирование, установщик и первый релиз.

### Сайт и загрузки

- **Сайт:** исходники находятся в [web/](web/). Для публикации включите GitHub Pages через **Settings → Pages → GitHub Actions**.
- **Скачать Windows-установщик (.exe):** [PDF-Workspace-setup.exe](https://github.com/German-GPD/pdf-workspace/releases/latest/download/PDF-Workspace-setup.exe) — ссылка активируется после первого подписанного релиза.
- **Все версии:** [GitHub Releases](https://github.com/German-GPD/pdf-workspace/releases).
- **Обратная связь:** [GitHub Issues](https://github.com/German-GPD/pdf-workspace/issues).
- **Сотрудничество:** [Telegram · @german_me](https://t.me/german_me).

### Лицензия

Проект распространяется по **[PDF Workspace Free Use License (PW-FUL)](LICENSE)**.

- Бесплатное использование.
- Изучение и изменение исходного кода разрешены.
- Распространение оригинальных и изменённых версий разрешено бесплатно при сохранении лицензии, авторства и ссылки на оригинал.
- Продажа копий и модифицированных версий запрещена.
- Добровольные донаты автору разрешены.
- Сотрудничество и отдельные разрешения: [@german_me](https://t.me/german_me).

---

## English

**PDF Workspace** is a planned free Windows desktop application for reading, organizing, and annotating PDF documents. It is primarily designed for teachers, students, and anyone who works with documents regularly.

### Planned features

- PDF viewer: text search, zoom, rotation, and two-page mode.
- Local library: folders, collections, favorites, search, and recent files.
- Annotations: pen, highlighter, eraser, shapes, arrows, and text notes.
- Bookmarks and notes linked to documents or pages.
- Separate PDF export that preserves the original file.
- Workspace restoration: last page, zoom, and reading position.
- Light and dark themes with the Windows system accent.
- Normal, Compact, and Focus workspace modes.

### Monic Control Bar

A reusable adaptive toolbar concept: reorder and hide actions, choose icons or labels, group commands, use contextual actions, and restore defaults.

### Planned technology

Tauri 2 · Rust · WebView2 · TypeScript · PDF.js · Canvas/SVG · SQLite · Vite.

The stack is preliminary. Dependency compatibility, licensing, and the PDF annotation export approach will be reviewed before release.

### Project status

**Early working MVP in active development.** The Windows app is being implemented; the first signed installer will be published through GitHub Releases. Some planned features are not implemented yet.

- [Website source](web/)
- [Download Windows installer (.exe)](https://github.com/German-GPD/pdf-workspace/releases/latest/download/PDF-Workspace-setup.exe) — available after the first signed release.
- [GitHub Releases](https://github.com/German-GPD/pdf-workspace/releases)
- [Issues](https://github.com/German-GPD/pdf-workspace/issues)
- [PW-FUL License](LICENSE)
- [Contact and cooperation](https://t.me/german_me)

---

## Español

**PDF Workspace** será una aplicación gratuita para Windows destinada a leer, organizar y anotar documentos PDF. Está pensada principalmente para docentes, estudiantes y cualquier persona que trabaje habitualmente con documentos.

### Funciones previstas

- Visor PDF: búsqueda de texto, zoom, rotación y vista de dos páginas.
- Biblioteca local: carpetas, colecciones, favoritos, búsqueda y archivos recientes.
- Anotaciones: lápiz, resaltador, borrador, figuras, flechas y notas de texto.
- Marcadores y notas vinculados a documentos o páginas.
- Exportación a una copia PDF independiente, conservando el original.
- Recuperación del estado de lectura: página, zoom y posición.
- Temas claro y oscuro con el color de acento de Windows.
- Modos Normal, Compacto y Enfoque.

### Monic Control Bar

Concepto de barra adaptable y reutilizable: reordenar u ocultar acciones, elegir iconos o etiquetas, agrupar comandos y restaurar la configuración inicial.

### Tecnologías previstas

Tauri 2 · Rust · WebView2 · TypeScript · PDF.js · Canvas/SVG · SQLite · Vite.

La arquitectura es preliminar. La compatibilidad, las licencias de dependencias y la exportación de anotaciones se revisarán antes del lanzamiento.

### Estado del proyecto

**MVP funcional inicial en desarrollo activo.** Se está implementando la aplicación para Windows; el primer instalador firmado se publicará en GitHub Releases. Algunas funciones previstas aún no están implementadas.

- [Código del sitio](web/)
- [Descargar instalador Windows (.exe)](https://github.com/German-GPD/pdf-workspace/releases/latest/download/PDF-Workspace-setup.exe) — disponible tras la primera versión firmada.
- [Versiones](https://github.com/German-GPD/pdf-workspace/releases)
- [GitHub Issues](https://github.com/German-GPD/pdf-workspace/issues)
- [Licencia PW-FUL](LICENSE)
- [Contacto y colaboraciones](https://t.me/german_me)

---

<p align="center">
  <sub>Designed with focus by <a href="https://github.com/German-GPD">German-GPD</a> · PDF Workspace</sub>
</p>
