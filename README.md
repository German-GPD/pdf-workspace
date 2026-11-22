# PDF Workspace

<p align="center">
  <strong>A focused, customizable workspace for PDF documents.</strong><br>
  Windows desktop application · Free · Offline-first
</p>

<p align="center">
  <a href="#русский">Русский</a> ·
  <a href="#english">English</a> ·
  <a href="#español">Español</a>
</p>

> **Project status:** Planning and architecture. No functional application release is available yet.

---

## Русский

**PDF Workspace** — бесплатное Windows-приложение для чтения, организации и аннотирования PDF-документов. Проект ориентирован на учителей, учащихся и всех, кому нужно удобное рабочее пространство для PDF.

### Основная идея
- Максимум места для документа, минимум интерфейсного шума.
- Настраиваемая адаптивная **Monic Control Bar**: кнопки можно добавлять, скрывать, переставлять и группировать.
- Светлая и тёмная темы; системный акцентный цвет Windows.
- Библиотека документов, недавние файлы, избранное, закладки и заметки.
- Рисование, выделение, текстовые пометки и другие overlay-аннотации.
- Автосохранение рабочего состояния и экспорт аннотированной копии PDF.
- Работа без обязательного аккаунта и подключения к серверу.
- Встроенная проверка и установка обновлений.

### Технологическое направление
Tauri 2 · Rust · WebView2 · TypeScript · PDF.js · SQLite.

Точный состав библиотек и их лицензии будут проверены до реализации и публикации сборок.

### Структура проекта
- **[app/](app/)** — Windows-приложение.
- **[website/](website/)** — отдельный сайт GitHub Pages.
- **[docs/](docs/)** — архитектура, решения и дорожная карта.

### Сайт и загрузки
Сайт: *будет опубликован после подготовки первой версии.*  
Загрузки: *появятся вместе с первым релизом.*

### Участие в проекте
На текущем этапе проект находится на стадии проектирования. Предложения и обсуждение можно вести через GitHub Issues.

---

## English

**PDF Workspace** is a free Windows application for reading, organizing, and annotating PDF documents. It is designed for teachers, students, and anyone who needs a focused PDF workspace.

### Core direction
- Give the document as much room as possible.
- A customizable, adaptive **Monic Control Bar** with reorderable, hideable, and groupable actions.
- Light and dark themes with the Windows system accent color.
- Document library, recent files, favorites, bookmarks, and notes.
- Drawing, highlighting, text notes, and other overlay annotations.
- Automatic workspace-state saving and annotated PDF export.
- No mandatory account or cloud connection.
- Built-in update checking and installation.

### Technology direction
Tauri 2 · Rust · WebView2 · TypeScript · PDF.js · SQLite.

Dependencies and their licenses will be reviewed before implementation and release.

### Project layout
- **[app/](app/)** — Windows desktop application.
- **[website/](website/)** — standalone GitHub Pages website.
- **[docs/](docs/)** — architecture, decisions, and roadmap.

### Website and downloads
Website: *coming after the first website build.*  
Downloads: *will be available with the first release.*

### Contributing
The project is currently in the planning stage. Suggestions and discussion can be opened through GitHub Issues.

---

## Español

**PDF Workspace** es una aplicación gratuita para Windows que permite leer, organizar y anotar documentos PDF. Está pensada para docentes, estudiantes y cualquier persona que necesite un espacio de trabajo cómodo para PDF.

### Objetivos principales
- Dar al documento el máximo espacio posible.
- **Monic Control Bar** adaptable y personalizable: permite ordenar, ocultar, añadir y agrupar acciones.
- Temas claro y oscuro con el color de acento del sistema Windows.
- Biblioteca de documentos, archivos recientes, favoritos, marcadores y notas.
- Dibujo, resaltado, notas de texto y otras anotaciones superpuestas.
- Guardado automático del estado de trabajo y exportación de copias anotadas.
- Sin cuenta obligatoria ni conexión a la nube.
- Comprobación e instalación de actualizaciones desde la aplicación.

### Tecnologías previstas
Tauri 2 · Rust · WebView2 · TypeScript · PDF.js · SQLite.

Las dependencias y sus licencias se revisarán antes de implementar y publicar versiones.

### Estructura del proyecto
- **[app/](app/)** — aplicación de escritorio para Windows.
- **[website/](website/)** — sitio independiente para GitHub Pages.
- **[docs/](docs/)** — arquitectura, decisiones y hoja de ruta.

### Sitio web y descargas
Sitio web: *se publicará después de preparar la primera versión.*  
Descargas: *estarán disponibles con el primer lanzamiento.*

### Colaboración
El proyecto está actualmente en fase de planificación. Las propuestas y debates pueden abrirse mediante GitHub Issues.

---

## Project principles

1. **Document first** — the PDF is the main content, not the surrounding interface.
2. **Progressive complexity** — simple by default, powerful when customized.
3. **Local-first** — user documents remain under the user's control.
4. **Accessible and predictable** — clear labels, keyboard support, and consistent behavior.
5. **Transparent releases** — documented changes, verified downloads, and dependency licenses.

## License

The project license is still to be selected. No license grant should be assumed until the repository contains the approved license text.
