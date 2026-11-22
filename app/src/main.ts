import * as pdfjs from "pdfjs-dist";
import workerUrl from "pdfjs-dist/build/pdf.worker.min.mjs?url";
import type { PDFDocumentProxy, RenderTask } from "pdfjs-dist";
import { isTauri } from "@tauri-apps/api/core";
import { appLocalDataDir, join } from "@tauri-apps/api/path";
import { open } from "@tauri-apps/plugin-dialog";
import { copyFile, mkdir, readFile } from "@tauri-apps/plugin-fs";
import { check } from "@tauri-apps/plugin-updater";
import "./style.css";

pdfjs.GlobalWorkerOptions.workerSrc = workerUrl;

type RecentDocument = { name: string; path: string; openedAt: number };
type LibraryDocument = { name: string; path: string; addedAt: number };
const $ = <T extends HTMLElement>(id: string) => document.getElementById(id) as T;
const openButton = $("open-button");
const emptyOpenButton = $("empty-open-button");
const fileInput = $("file-input") as HTMLInputElement;
const libraryButton = $("library-button");
const viewer = $("viewer");
const emptyState = $("empty-state");
const canvas = $("pdf-canvas") as HTMLCanvasElement;
const ctx = canvas.getContext("2d", { alpha: false })!;
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
let pdf: PDFDocumentProxy | null = null;
let activePath = "";
let activeName = "";
let currentPage = 1;
let scale = 1;
let currentRender: RenderTask | null = null;
let pendingUpdate: Awaited<ReturnType<typeof check>> = null;
let toastTimer = 0;

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
function saveRecent(item: RecentDocument) {
  const items = [item, ...readRecent().filter((entry) => entry.path !== item.path)].slice(0, 12);
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
    await loadPdf(bytes, name, path);
  } catch (error) {
    showError(error instanceof Error ? error.message : "Не удалось открыть файл. Проверьте, что он доступен.");
  }
}
async function choosePdf() {
  try {
    if (isTauri()) {
      const selected = await open({ multiple: false, filters: [{ name: "PDF document", extensions: ["pdf"] }] });
      if (typeof selected === "string") await openPath(selected);
    } else {
      fileInput.click();
    }
  } catch (error) {
    showError(error instanceof Error ? error.message : "Не удалось открыть диалог выбора файла.");
  }
}
async function loadPdf(data: Uint8Array, name: string, path = "") {
  clearError();
  if (currentRender) { try { currentRender.cancel(); } catch {} }
  const task = pdfjs.getDocument({ data });
  pdf = await task.promise;
  activePath = path;
  activeName = name;
  currentPage = 1;
  scale = 1;
  title.textContent = name;
  meta.textContent = pdf.numPages + (pdf.numPages === 1 ? " страница" : " страниц");
  pageCount.textContent = String(pdf.numPages);
  pageNumber.value = "1";
  emptyState.hidden = true;
  viewer.hidden = false;
  [prevPage, nextPage, zoomOut, zoomIn, pageNumber].forEach((element) => { element.disabled = false; });
  if (path) saveRecent({ name, path, openedAt: Date.now() });
  await renderPage();
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
  try { await currentRender.promise; } catch (error) {
    if (!(error instanceof Error) || error.name !== "RenderingCancelledException") throw error;
  }
  pageNumber.value = String(currentPage);
  pageNumber.max = String(pdf.numPages);
  pageCount.textContent = String(pdf.numPages);
  zoomLabel.textContent = Math.round(scale * 100) + "%";
  prevPage.disabled = currentPage <= 1;
  nextPage.disabled = currentPage >= pdf.numPages;
  zoomOut.disabled = scale <= 0.5;
  zoomIn.disabled = scale >= 2.5;
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
    const destination = await join(folder, safeName);
    const library = readLibrary();
    if (library.some((item) => item.path === destination)) {
      showToast("Этот документ уже есть в библиотеке.");
      return;
    }
    await copyFile(activePath, destination);
    localStorage.setItem("pw.library", JSON.stringify([{ name: safeName, path: destination, addedAt: Date.now() }, ...library]));
    renderLists();
    showToast("Копия PDF добавлена в библиотеку.");
  } catch (error) {
    showError(error instanceof Error ? error.message : "Не удалось добавить файл в библиотеку.");
  }
}
async function checkForUpdates() {
  if (!isTauri()) {
    showToast("Проверка обновлений доступна в установленной версии.");
    return;
  }
  updateStatus.textContent = "Проверяем…";
  try {
    const update = await check();
    pendingUpdate = update;
    if (!update) {
      updateStatus.textContent = "Установлена последняя версия";
      showToast("Обновлений нет — у вас последняя версия.");
      return;
    }
    $("update-title").textContent = "Доступна версия " + update.version;
    $("update-notes").textContent = update.body || "Можно установить обновление прямо сейчас.";
    updateBanner.hidden = false;
    updateStatus.textContent = "Доступна версия " + update.version;
  } catch (error) {
    updateStatus.textContent = "Не удалось проверить обновления";
    showToast(error instanceof Error ? error.message : "Ошибка проверки обновлений.");
  }
}
async function installUpdate() {
  if (!pendingUpdate) return;
  const button = $("install-update") as HTMLButtonElement;
  button.disabled = true;
  button.textContent = "Загрузка…";
  try {
    await pendingUpdate.downloadAndInstall((event) => {
      if (event.event === "Progress") button.textContent = "Загрузка…";
      if (event.event === "Finished") button.textContent = "Установка…";
    });
    updateStatus.textContent = "Обновление установлено";
  } catch (error) {
    button.disabled = false;
    button.textContent = "Повторить";
    showToast(error instanceof Error ? error.message : "Не удалось установить обновление.");
  }
}

openButton.addEventListener("click", () => void choosePdf());
emptyOpenButton.addEventListener("click", () => void choosePdf());
libraryButton.addEventListener("click", () => void addToLibrary());
$("install-update").addEventListener("click", () => void installUpdate());
$("dismiss-update").addEventListener("click", () => { updateBanner.hidden = true; });
$("check-updates").addEventListener("click", () => void checkForUpdates());
prevPage.addEventListener("click", () => { if (pdf && currentPage > 1) { currentPage--; void renderPage(); } });
nextPage.addEventListener("click", () => { if (pdf && currentPage < pdf.numPages) { currentPage++; void renderPage(); } });
pageNumber.addEventListener("change", () => {
  const value = Number(pageNumber.value);
  if (pdf && Number.isInteger(value) && value >= 1 && value <= pdf.numPages) { currentPage = value; void renderPage(); }
});
zoomOut.addEventListener("click", () => { scale = Math.max(0.5, scale - 0.1); void renderPage(); });
zoomIn.addEventListener("click", () => { scale = Math.min(2.5, scale + 0.1); void renderPage(); });
fileInput.addEventListener("change", async () => {
  const file = fileInput.files?.[0];
  if (file) {
    try { await loadPdf(new Uint8Array(await file.arrayBuffer()), file.name); }
    catch (error) { showError(error instanceof Error ? error.message : "Не удалось прочитать PDF."); }
  }
  fileInput.value = "";
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
$("app-version").textContent = "v0.1.0";
renderLists();
applyTheme();
if (isTauri()) window.setTimeout(() => void checkForUpdates(), 2500);
