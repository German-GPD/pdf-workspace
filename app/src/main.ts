import * as pdfjs from "pdfjs-dist";
import workerUrl from "pdfjs-dist/build/pdf.worker.min.mjs?url";
import type { PDFDocumentProxy, RenderTask } from "pdfjs-dist";
import { PDFDocument, rgb } from "pdf-lib";
import { isTauri } from "@tauri-apps/api/core";
import { getVersion } from "@tauri-apps/api/app";
import { appLocalDataDir, join } from "@tauri-apps/api/path";
import { open, save } from "@tauri-apps/plugin-dialog";
import { copyFile, mkdir, readFile, writeFile } from "@tauri-apps/plugin-fs";
import { check } from "@tauri-apps/plugin-updater";
import { relaunch } from "@tauri-apps/plugin-process";
import "./style.css";

pdfjs.GlobalWorkerOptions.workerSrc = workerUrl;

type RecentDocument = { name: string; path: string; openedAt: number };
type LibraryDocument = { name: string; path: string; addedAt: number };
type Markup = { page: number; tool: "pen" | "marker"; color: string; size: number; points: { x: number; y: number }[] };
type SearchMatch = { page: number; excerpt: string };
const $ = <T extends HTMLElement>(id: string) => document.getElementById(id) as T;
const openButton = $("open-button");
const emptyOpenButton = $("empty-open-button");
const fileInput = $("file-input") as HTMLInputElement;
const libraryButton = $("library-button");
const viewer = $("viewer");
const emptyState = $("empty-state");
const canvas = $("pdf-canvas") as HTMLCanvasElement;
const overlay = $("annotation-canvas") as HTMLCanvasElement;
const ctx = canvas.getContext("2d", { alpha: false })!;
const overlayCtx = overlay.getContext("2d")!;
const title = $("document-title");
const meta = $("document-meta");
const pageNumber = $("page-number") as HTMLInputElement;
const pageCount = $("page-count");
const prevPage = $("prev-page") as HTMLButtonElement;
const nextPage = $("next-page") as HTMLButtonElement;
const zoomOut = $("zoom-out") as HTMLButtonElement;
const zoomIn = $("zoom-in") as HTMLButtonElement;
const zoomLabel = $("zoom-label");
const recentList = $("recent-list");
const libraryList = $("library-list");
const toast = $("toast");
const errorBanner = $("error-banner");
const updateBanner = $("update-banner");
const updateStatus = $("update-status");
const searchInput = $("search-input") as HTMLInputElement;
const searchStatus = $("search-status");
const toolButtons = [...document.querySelectorAll<HTMLButtonElement>("[data-annotation-tool]")];
let pdf: PDFDocumentProxy | null = null;
let sourceBytes: Uint8Array | null = null;
let activePath = "";
let activeName = "";
let currentPage = 1;
let scale = 1;
let currentRender: RenderTask | null = null;
let pendingUpdate: Awaited<ReturnType<typeof check>> = null;
let toastTimer = 0;
let activeTool: "select" | "pen" | "marker" = "select";
let markups: Markup[] = [];
let draftMarkup: Markup | null = null;
let searchMatches: SearchMatch[] = [];
let searchIndex = -1;

function showToast(message: string) {
  toast.textContent = message;
  toast.classList.add("visible");
  window.clearTimeout(toastTimer);
  toastTimer = window.setTimeout(() => toast.classList.remove("visible"), 3200);
}
function showError(message: string) {
  errorBanner.textContent = message;
  errorBanner.hidden = false;
}
function clearError() { errorBanner.hidden = true; }
function readRecent(): RecentDocument[] {
  try { return JSON.parse(localStorage.getItem("pw.recent") || "[]") as RecentDocument[]; } catch { return []; }
}
function readLibrary(): LibraryDocument[] {
  try { return JSON.parse(localStorage.getItem("pw.library") || "[]") as LibraryDocument[]; } catch { return []; }
}
function annotationKey() { return "pw.annotations." + (activePath || activeName); }
function readAnnotations() {
  try { markups = JSON.parse(localStorage.getItem(annotationKey()) || "[]") as Markup[]; }
  catch { markups = []; }
}
function saveAnnotations() {
  try { localStorage.setItem(annotationKey(), JSON.stringify(markups)); }
  catch { showToast("Не удалось сохранить разметку: недостаточно места в хранилище."); }
}
function saveRecent(item: RecentDocument) {
  const items = [item, ...readRecent().filter((entry) => entry.path !== item.path)].slice(0, 15);
  localStorage.setItem("pw.recent", JSON.stringify(items));
  renderLists();
}
function makeDocumentButton(name: string, path: string, kind: string) {
  const button = document.createElement("button");
  button.className = "document-item";
  button.innerHTML = '<span class="file-icon">PDF</span><span class="document-item-copy"><b></b><small></small></span>';
  button.querySelector("b")!.textContent = name;
  button.querySelector("small")!.textContent = kind === "library" ? "Библиотека" : "Недавно открыто";
  button.title = path;
  button.addEventListener("click", () => void openPath(path));
  return button;
}
function renderLists() {
  const recent = readRecent();
  const library = readLibrary();
  $("recent-count").textContent = String(recent.length);
  $("library-count").textContent = String(library.length);
  recentList.replaceChildren();
  libraryList.replaceChildren();
  if (!recent.length) recentList.textContent = "Здесь появятся открытые файлы";
  if (!library.length) libraryList.textContent = "Пока нет документов";
  recent.forEach((item) => recentList.append(makeDocumentButton(item.name, item.path, "recent")));
  library.forEach((item) => libraryList.append(makeDocumentButton(item.name, item.path, "library")));
}
async function openPath(path: string) {
  try {
    clearError();
    const bytes = await readFile(path);
    const name = path.split(/[\\/]/).pop() || "Документ.pdf";
    await loadPdf(new Uint8Array(bytes), name, path);
  } catch (error) {
    showError(error instanceof Error ? error.message : "Не удалось открыть файл. Возможно, он был перемещён или удалён.");
  }
}
async function choosePdf() {
  try {
    if (isTauri()) {
      const selected = await open({ multiple: false, filters: [{ name: "PDF document", extensions: ["pdf"] }] });
      if (typeof selected === "string") await openPath(selected);
    } else fileInput.click();
  } catch (error) {
    showError(error instanceof Error ? error.message : "Не удалось открыть диалог выбора файла.");
  }
}
async function loadPdf(data: Uint8Array, name: string, path = "") {
  clearError();
  if (currentRender) { try { currentRender.cancel(); } catch {} }
  const copy = new Uint8Array(data);
  const task = pdfjs.getDocument({ data: new Uint8Array(copy) });
  const nextPdf = await task.promise;
  pdf = nextPdf;
  sourceBytes = copy;
  activePath = path;
  activeName = name;
  currentPage = 1;
  scale = 1;
  searchMatches = [];
  searchIndex = -1;
  searchInput.value = "";
  searchStatus.textContent = "";
  title.textContent = name;
  meta.textContent = nextPdf.numPages + (nextPdf.numPages === 1 ? " страница" : " страниц");
  pageCount.textContent = String(nextPdf.numPages);
  pageNumber.value = "1";
  emptyState.hidden = true;
  viewer.hidden = false;
  [prevPage, nextPage, zoomOut, zoomIn, pageNumber, $("fit-width") as HTMLButtonElement, $("export-pdf") as HTMLButtonElement].forEach((element) => { (element as HTMLButtonElement).disabled = false; });
  readAnnotations();
  if (path) saveRecent({ name, path, openedAt: Date.now() });
  await renderPage();
}
function drawMarkups() {
  if (!pdf) return;
  const width = Number.parseFloat(canvas.style.width) || canvas.clientWidth;
  const height = Number.parseFloat(canvas.style.height) || canvas.clientHeight;
  const ratio = Math.max(1, window.devicePixelRatio || 1);
  overlay.width = Math.round(width * ratio);
  overlay.height = Math.round(height * ratio);
  overlay.style.width = width + "px";
  overlay.style.height = height + "px";
  overlayCtx.setTransform(ratio, 0, 0, ratio, 0, 0);
  overlayCtx.clearRect(0, 0, width, height);
  for (const item of [...markups, ...(draftMarkup ? [draftMarkup] : [])]) {
    if (item.page !== currentPage || item.points.length === 0) continue;
    overlayCtx.save();
    overlayCtx.strokeStyle = item.color;
    overlayCtx.fillStyle = item.color;
    overlayCtx.lineWidth = item.size;
    overlayCtx.lineCap = "round";
    overlayCtx.lineJoin = "round";
    overlayCtx.globalAlpha = item.tool === "marker" ? 0.34 : 0.95;
    overlayCtx.beginPath();
    overlayCtx.moveTo(item.points[0].x * width, item.points[0].y * height);
    for (const point of item.points.slice(1)) overlayCtx.lineTo(point.x * width, point.y * height);
    if (item.points.length === 1) {
      overlayCtx.arc(item.points[0].x * width, item.points[0].y * height, item.size / 2, 0, Math.PI * 2);
      overlayCtx.fill();
    } else overlayCtx.stroke();
    overlayCtx.restore();
  }
}
async function renderPage() {
  if (!pdf) return;
  if (currentRender) { try { currentRender.cancel(); } catch {} }
  const page = await pdf.getPage(currentPage);
  const viewport = page.getViewport({ scale });
  const ratio = Math.max(1, window.devicePixelRatio || 1);
  canvas.width = Math.floor(viewport.width * ratio);
  canvas.height = Math.floor(viewport.height * ratio);
  canvas.style.width = viewport.width + "px";
  canvas.style.height = viewport.height + "px";
  const transform: [number, number, number, number, number, number] = [ratio, 0, 0, ratio, 0, 0];
  currentRender = page.render({ canvas, canvasContext: ctx, viewport, transform });
  try { await currentRender.promise; }
  catch (error) { if (!(error instanceof Error) || error.name !== "RenderingCancelledException") throw error; }
  pageNumber.value = String(currentPage);
  pageNumber.max = String(pdf.numPages);
  pageCount.textContent = String(pdf.numPages);
  zoomLabel.textContent = Math.round(scale * 100) + "%";
  prevPage.disabled = currentPage <= 1;
  nextPage.disabled = currentPage >= pdf.numPages;
  zoomOut.disabled = scale <= 0.5;
  zoomIn.disabled = scale >= 3;
  drawMarkups();
}
async function fitWidth() {
  if (!pdf) return;
  const page = await pdf.getPage(currentPage);
  const base = page.getViewport({ scale: 1 });
  const available = Math.max(320, viewer.clientWidth - 80);
  scale = Math.min(3, Math.max(0.35, available / base.width));
  await renderPage();
}
async function addToLibrary() {
  if (!activePath || !isTauri()) {
    showToast("Откройте PDF из установленного приложения, чтобы добавить его в библиотеку.");
    return;
  }
  try {
    const base = await appLocalDataDir();
    const folder = await join(base, "Library");
    await mkdir(folder, { recursive: true });
    const safeName = activeName.replace(/[<>:"/\\|?*]/g, "_");
    const destination = await join(folder, Date.now() + "-" + safeName);
    const library = readLibrary();
    await copyFile(activePath, destination);
    localStorage.setItem("pw.library", JSON.stringify([{ name: safeName, path: destination, addedAt: Date.now() }, ...library]));
    renderLists();
    showToast("Копия PDF добавлена в библиотеку.");
  } catch (error) {
    showError(error instanceof Error ? error.message : "Не удалось добавить файл в библиотеку.");
  }
}
async function searchDocument() {
  if (!pdf) return;
  const query = searchInput.value.trim().toLocaleLowerCase();
  if (!query) { searchMatches = []; searchIndex = -1; searchStatus.textContent = ""; return; }
  searchStatus.textContent = "Ищем по документу…";
  const matches: SearchMatch[] = [];
  try {
    for (let pageNo = 1; pageNo <= pdf.numPages; pageNo++) {
      const page = await pdf.getPage(pageNo);
      const content = await page.getTextContent();
      const text = content.items.filter((item) => "str" in item).map((item) => ("str" in item ? item.str : "")).join(" ");
      const lower = text.toLocaleLowerCase();
      let from = 0;
      while ((from = lower.indexOf(query, from)) !== -1) {
        const start = Math.max(0, from - 45);
        const end = Math.min(text.length, from + query.length + 65);
        matches.push({ page: pageNo, excerpt: text.slice(start, end).replace(/\s+/g, " ") });
        from += Math.max(1, query.length);
      }
    }
    searchMatches = matches;
    searchIndex = matches.length ? 0 : -1;
    if (!matches.length) { searchStatus.textContent = "Совпадений не найдено"; return; }
    await goToSearchMatch();
  } catch (error) {
    searchStatus.textContent = "Не удалось выполнить поиск";
    showToast(error instanceof Error ? error.message : "Ошибка поиска по PDF.");
  }
}
async function goToSearchMatch() {
  if (!searchMatches.length || searchIndex < 0) return;
  const match = searchMatches[searchIndex];
  if (currentPage !== match.page) { currentPage = match.page; await renderPage(); }
  searchStatus.textContent = (searchIndex + 1) + " / " + searchMatches.length + " · стр. " + match.page + " · " + match.excerpt;
}
async function stepSearch(direction: number) {
  if (!searchMatches.length) return;
  searchIndex = (searchIndex + direction + searchMatches.length) % searchMatches.length;
  await goToSearchMatch();
}
function setTool(tool: "select" | "pen" | "marker") {
  activeTool = tool;
  toolButtons.forEach((button) => button.classList.toggle("active", button.dataset.annotationTool === tool));
  overlay.classList.toggle("drawing-enabled", tool !== "select");
  overlay.setAttribute("aria-label", tool === "select" ? "Страница PDF" : "Область рисования");
}
function pointerPosition(event: PointerEvent) {
  const rect = overlay.getBoundingClientRect();
  return { x: Math.min(1, Math.max(0, (event.clientX - rect.left) / rect.width)), y: Math.min(1, Math.max(0, (event.clientY - rect.top) / rect.height)) };
}
overlay.addEventListener("pointerdown", (event) => {
  if (activeTool === "select" || !pdf) return;
  overlay.setPointerCapture(event.pointerId);
  draftMarkup = { page: currentPage, tool: activeTool, color: activeTool === "marker" ? "#f0c94d" : "#d04b3f", size: activeTool === "marker" ? 18 : 2.8, points: [pointerPosition(event)] };
  drawMarkups();
});
overlay.addEventListener("pointermove", (event) => {
  if (!draftMarkup) return;
  draftMarkup.points.push(pointerPosition(event));
  drawMarkups();
});
function finishStroke() {
  if (!draftMarkup) return;
  if (draftMarkup.points.length) markups.push(draftMarkup);
  draftMarkup = null;
  saveAnnotations();
  drawMarkups();
}
overlay.addEventListener("pointerup", finishStroke);
overlay.addEventListener("pointercancel", finishStroke);
function undoMarkup() {
  const index = [...markups].map((item) => item.page).lastIndexOf(currentPage);
  if (index < 0) { showToast("На этой странице нет разметки."); return; }
  markups.splice(index, 1);
  saveAnnotations();
  drawMarkups();
}
function clearPageMarkups() {
  const before = markups.length;
  markups = markups.filter((item) => item.page !== currentPage);
  if (markups.length === before) { showToast("На этой странице нет разметки."); return; }
  saveAnnotations();
  drawMarkups();
}
async function exportAnnotatedPdf() {
  if (!sourceBytes || !pdf) return;
  const button = $("export-pdf") as HTMLButtonElement;
  button.disabled = true;
  button.textContent = "Экспорт…";
  try {
    const output = await PDFDocument.load(sourceBytes);
    for (const item of markups) {
      const page = output.getPage(item.page - 1);
      const width = page.getWidth();
      const height = page.getHeight();
      const color = item.tool === "marker" ? rgb(0.94, 0.78, 0.22) : rgb(0.82, 0.25, 0.20);
      const thickness = Math.max(1, item.size * width / (Number.parseFloat(canvas.style.width) || width));
      for (let i = 1; i < item.points.length; i++) {
        const a = item.points[i - 1];
        const b = item.points[i];
        page.drawLine({
          start: { x: a.x * width, y: (1 - a.y) * height },
          end: { x: b.x * width, y: (1 - b.y) * height },
          thickness,
          color,
          opacity: item.tool === "marker" ? 0.32 : 0.95,
          lineCap: 1
        });
      }
      if (item.points.length === 1) {
        const point = item.points[0];
        page.drawCircle({ x: point.x * width, y: (1 - point.y) * height, size: thickness / 2, color, opacity: item.tool === "marker" ? 0.32 : 0.95 });
      }
    }
    const bytes = await output.save();
    if (isTauri()) {
      const suggested = activeName.replace(/\.pdf$/i, "") + "-annotated.pdf";
      const path = await save({ defaultPath: suggested, filters: [{ name: "PDF", extensions: ["pdf"] }] });
      if (!path) return;
      await writeFile(path, bytes);
    } else {
      const downloadBuffer = new ArrayBuffer(bytes.byteLength);
      new Uint8Array(downloadBuffer).set(bytes);
      const blob = new Blob([downloadBuffer], { type: "application/pdf" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = activeName.replace(/\.pdf$/i, "") + "-annotated.pdf";
      link.click();
      URL.revokeObjectURL(url);
    }
    showToast("Аннотированная копия PDF сохранена. Оригинал не изменён.");
  } catch (error) {
    showError(error instanceof Error ? error.message : "Не удалось экспортировать PDF.");
  } finally {
    button.disabled = false;
    button.textContent = "Экспорт PDF";
  }
}
async function checkForUpdates(silent = false) {
  if (!isTauri()) {
    updateStatus.textContent = "Доступно в приложении";
    if (!silent) showToast("Проверка обновлений доступна в установленной версии.");
    return;
  }
  updateStatus.textContent = "Проверяем обновления…";
  try {
    const update = await check();
    pendingUpdate = update;
    if (!update) {
      updateBanner.hidden = true;
      updateStatus.textContent = "Установлена последняя версия";
      if (!silent) showToast("Обновлений нет — у вас последняя версия.");
      return;
    }
    $("update-title").textContent = "Доступна версия " + update.version;
    $("update-notes").textContent = update.body || "Можно установить обновление прямо сейчас.";
    updateBanner.hidden = false;
    updateStatus.textContent = "Доступна версия " + update.version;
  } catch (error) {
    pendingUpdate = null;
    updateStatus.textContent = "Не удалось проверить обновления";
    if (!silent) showToast(error instanceof Error ? error.message : "Ошибка проверки обновлений.");
  }
}
async function installUpdate() {
  if (!pendingUpdate) return;
  const button = $("install-update") as HTMLButtonElement;
  button.disabled = true;
  button.textContent = "Загрузка…";
  let downloadedBytes = 0;
  let totalBytes = 0;
  try {
    await pendingUpdate.downloadAndInstall((event) => {
      if (event.event === "Started") {
        totalBytes = event.data.contentLength ?? 0;
        updateStatus.textContent = "Загрузка обновления…";
        button.textContent = totalBytes ? "Загрузка… 0%" : "Загрузка…";
      } else if (event.event === "Progress") {
        downloadedBytes += event.data.chunkLength;
        const percent = totalBytes ? Math.min(100, Math.round(downloadedBytes / totalBytes * 100)) : 0;
        button.textContent = totalBytes ? "Загрузка… " + percent + "%" : "Загрузка…";
      } else if (event.event === "Finished") {
        button.textContent = "Установка…";
        updateStatus.textContent = "Проверка завершена. Устанавливаем обновление…";
      }
    });
    button.textContent = "Перезапуск…";
    updateStatus.textContent = "Обновление установлено. Перезапускаем приложение…";
    await relaunch();
  } catch (error) {
    button.disabled = false;
    button.textContent = "Повторить";
    updateStatus.textContent = "Не удалось установить обновление";
    showToast(error instanceof Error ? error.message : "Не удалось установить обновление.");
  }
}
openButton.addEventListener("click", () => void choosePdf());
emptyOpenButton.addEventListener("click", () => void choosePdf());
libraryButton.addEventListener("click", () => void addToLibrary());
$("install-update").addEventListener("click", () => void installUpdate());
$("dismiss-update").addEventListener("click", () => { updateBanner.hidden = true; });
$("check-updates").addEventListener("click", () => void checkForUpdates());
$("search-button").addEventListener("click", () => void searchDocument());
$("search-next").addEventListener("click", () => void stepSearch(1));
$("search-prev").addEventListener("click", () => void stepSearch(-1));
searchInput.addEventListener("keydown", (event) => { if (event.key === "Enter") void searchDocument(); });
$("fit-width").addEventListener("click", () => void fitWidth());
$("undo-annotation").addEventListener("click", undoMarkup);
$("clear-annotations").addEventListener("click", clearPageMarkups);
$("export-pdf").addEventListener("click", () => void exportAnnotatedPdf());
toolButtons.forEach((button) => button.addEventListener("click", () => setTool(button.dataset.annotationTool as "select" | "pen" | "marker")));
prevPage.addEventListener("click", () => { if (pdf && currentPage > 1) { currentPage--; void renderPage(); } });
nextPage.addEventListener("click", () => { if (pdf && currentPage < pdf.numPages) { currentPage++; void renderPage(); } });
pageNumber.addEventListener("change", () => {
  const value = Number(pageNumber.value);
  if (pdf && Number.isInteger(value) && value >= 1 && value <= pdf.numPages) { currentPage = value; void renderPage(); }
  else if (pdf) pageNumber.value = String(currentPage);
});
zoomOut.addEventListener("click", () => { scale = Math.max(0.5, scale - 0.1); void renderPage(); });
zoomIn.addEventListener("click", () => { scale = Math.min(3, scale + 0.1); void renderPage(); });
fileInput.addEventListener("change", async () => {
  const file = fileInput.files?.[0];
  if (file) {
    try { await loadPdf(new Uint8Array(await file.arrayBuffer()), file.name); }
    catch (error) { showError(error instanceof Error ? error.message : "Не удалось прочитать PDF."); }
  }
  fileInput.value = "";
});
window.addEventListener("resize", () => { if (pdf) void renderPage(); });
document.addEventListener("keydown", (event) => {
  if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "o") { event.preventDefault(); void choosePdf(); }
  if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "f") { event.preventDefault(); searchInput.focus(); }
  if (event.key === "ArrowLeft" && pdf && !(event.target instanceof HTMLInputElement)) { if (currentPage > 1) { currentPage--; void renderPage(); } }
  if (event.key === "ArrowRight" && pdf && !(event.target instanceof HTMLInputElement)) { if (currentPage < pdf.numPages) { currentPage++; void renderPage(); } }
});
const themeButton = $("theme-toggle");
function applyTheme() {
  const saved = localStorage.getItem("pw.theme") || "system";
  const dark = saved === "dark" || (saved === "system" && window.matchMedia("(prefers-color-scheme: dark)").matches);
  document.documentElement.dataset.theme = dark ? "dark" : "light";
  themeButton.title = saved === "system" ? "Тема: системная" : dark ? "Тема: тёмная" : "Тема: светлая";
}
themeButton.addEventListener("click", () => {
  const current = localStorage.getItem("pw.theme") || "system";
  localStorage.setItem("pw.theme", current === "system" ? "light" : current === "light" ? "dark" : "system");
  applyTheme();
});
window.matchMedia("(prefers-color-scheme: dark)").addEventListener("change", applyTheme);
renderLists();
applyTheme();
setTool("select");
if (isTauri()) {
  void getVersion().then((version) => { $("app-version").textContent = "v" + version; });
  window.setTimeout(() => void checkForUpdates(true), 2500);
}
