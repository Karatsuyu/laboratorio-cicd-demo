<#
.SYNOPSIS
    Script de setup del Laboratorio CI/CD para Windows.
    Instala Python 3.12.10, Node 20.11.1 y GitHub CLI.

.PARAMETER DryRun
    Muestra qué haría el script sin ejecutar nada.

.PARAMETER NoConfirm
    Ejecuta sin pedir confirmación manual.

.EXAMPLE
    # Modo simulación
    powershell -ExecutionPolicy Bypass -File .\scripts\setup-windows.ps1 -DryRun

    # Ejecución real
    powershell -ExecutionPolicy Bypass -File .\scripts\setup-windows.ps1

    # Sin confirmación
    powershell -ExecutionPolicy Bypass -File .\scripts\setup-windows.ps1 -NoConfirm
#>

[CmdletBinding()]
param(
    [switch]$DryRun,
    [switch]$NoConfirm
)

$ErrorActionPreference = "Stop"

# ── Colores ────────────────────────────────────────────────────────────────────
function Write-Step  { param($msg) Write-Host "▶ $msg" -ForegroundColor Cyan }
function Write-Ok    { param($msg) Write-Host "  ✓ $msg" -ForegroundColor Green }
function Write-Warn  { param($msg) Write-Host "  ⚠ $msg" -ForegroundColor Yellow }
function Write-Dry   { param($msg) Write-Host "  [DRY] $msg" -ForegroundColor Magenta }

# ── Banner ─────────────────────────────────────────────────────────────────────
Write-Host ""
Write-Host "╔══════════════════════════════════════════╗" -ForegroundColor Blue
Write-Host "║   Laboratorio CI/CD — Setup Windows      ║" -ForegroundColor Blue
Write-Host "╚══════════════════════════════════════════╝" -ForegroundColor Blue
Write-Host ""

if ($DryRun) {
    Write-Warn "MODO DRY-RUN: ningún cambio real se realizará."
    Write-Host ""
}

# ── Confirmación ───────────────────────────────────────────────────────────────
if (-not $DryRun -and -not $NoConfirm) {
    Write-Host "Este script va a:" -ForegroundColor Yellow
    Write-Host "  1. Desinstalar versiones previas de Python" -ForegroundColor Yellow
    Write-Host "  2. Instalar Python 3.12.10" -ForegroundColor Yellow
    Write-Host "  3. Instalar Node 20.11.1 (via nvm-windows)" -ForegroundColor Yellow
    Write-Host "  4. Instalar GitHub CLI" -ForegroundColor Yellow
    Write-Host ""
    $resp = Read-Host "¿Continuar? (ENTER para sí, Ctrl+C para cancelar)"
    Write-Host ""
}

# ── Función: verificar winget ──────────────────────────────────────────────────
function Assert-Winget {
    Write-Step "Verificando winget..."
    try {
        $v = winget --version 2>&1
        Write-Ok "winget $v disponible"
    } catch {
        Write-Host ""
        Write-Host "ERROR: winget no encontrado." -ForegroundColor Red
        Write-Host "Abre Microsoft Store, actualiza 'App Installer' y reinicia la terminal." -ForegroundColor Red
        exit 1
    }
}

# ── Función: desinstalar Python previo ────────────────────────────────────────
function Remove-OldPython {
    Write-Step "Buscando instalaciones previas de Python..."

    $pythonPackages = winget list --name "Python" 2>&1 |
        Select-String "Python.Python" | ForEach-Object { $_.Line.Split()[0] }

    if ($pythonPackages) {
        foreach ($pkg in $pythonPackages) {
            if ($DryRun) {
                Write-Dry "winget uninstall --id $pkg --silent"
            } else {
                Write-Warn "Desinstalando $pkg..."
                winget uninstall --id $pkg --silent 2>&1 | Out-Null
                Write-Ok "Desinstalado: $pkg"
            }
        }
    } else {
        Write-Ok "No se encontraron instalaciones previas de Python via winget."
    }

    # Limpiar restos en LOCALAPPDATA
    $orphan = "$env:LOCALAPPDATA\Python\"
    if (Test-Path $orphan) {
        if ($DryRun) {
            Write-Dry "Remove-Item -Recurse -Force $orphan"
        } else {
            Remove-Item -Recurse -Force $orphan -ErrorAction SilentlyContinue
            Write-Ok "Eliminado directorio huérfano: $orphan"
        }
    }
}

# ── Función: instalar Python 3.12.10 ──────────────────────────────────────────
function Install-Python {
    Write-Step "Instalando Python 3.12.10..."
    if ($DryRun) {
        Write-Dry "winget install --id Python.Python.3.12 --version 3.12.10 --scope user --silent"
        return
    }
    winget install --id Python.Python.3.12 --version 3.12.10 --scope user --silent --accept-package-agreements --accept-source-agreements
    Write-Ok "Python 3.12.10 instalado."
}

# ── Función: instalar nvm + Node 20.11.1 ──────────────────────────────────────
function Install-Node {
    Write-Step "Verificando nvm-windows..."
    $nvmExists = Get-Command nvm -ErrorAction SilentlyContinue

    if (-not $nvmExists) {
        Write-Warn "nvm-windows no encontrado. Instalando..."
        if ($DryRun) {
            Write-Dry "winget install --id CoreyButler.NVMforWindows --silent"
        } else {
            winget install --id CoreyButler.NVMforWindows --silent --accept-package-agreements --accept-source-agreements
            Write-Ok "nvm-windows instalado. Reinicia la terminal y vuelve a ejecutar el script si nvm no responde."
        }
    } else {
        Write-Ok "nvm-windows ya está instalado."
    }

    Write-Step "Instalando Node 20.11.1..."
    if ($DryRun) {
        Write-Dry "nvm install 20.11.1"
        Write-Dry "nvm use 20.11.1"
    } else {
        nvm install 20.11.1 2>&1
        nvm use 20.11.1 2>&1
        Write-Ok "Node 20.11.1 activado."
    }
}

# ── Función: instalar GitHub CLI ──────────────────────────────────────────────
function Install-GhCli {
    Write-Step "Verificando GitHub CLI..."
    $ghExists = Get-Command gh -ErrorAction SilentlyContinue
    if ($ghExists) {
        Write-Ok "GitHub CLI ya instalado: $(gh --version | Select-Object -First 1)"
        return
    }
    if ($DryRun) {
        Write-Dry "winget install --id GitHub.cli --silent"
        return
    }
    winget install --id GitHub.cli --silent --accept-package-agreements --accept-source-agreements
    Write-Ok "GitHub CLI instalado."
}

# ── Función: verificar Docker y git ──────────────────────────────────────────
function Test-Prerequisites {
    Write-Step "Verificando Docker y git..."
    try {
        $dockerV = docker --version
        Write-Ok "Docker: $dockerV"
    } catch {
        Write-Warn "Docker no encontrado o no está corriendo. Instala Docker Desktop desde docker.com/desktop."
    }
    try {
        $gitV = git --version
        Write-Ok "Git: $gitV"
    } catch {
        Write-Warn "git no encontrado. Instala Git desde git-scm.com."
    }
}

# ── Ejecución principal ───────────────────────────────────────────────────────
Assert-Winget
Remove-OldPython
Install-Python
Install-Node
Install-GhCli
Test-Prerequisites

Write-Host ""
Write-Host "══════════════════════════════════════════" -ForegroundColor Green
if ($DryRun) {
    Write-Host "  Dry-run completado. Nada fue modificado." -ForegroundColor Magenta
} else {
    Write-Host "  Setup completado. Abre una NUEVA terminal" -ForegroundColor Green
    Write-Host "  y ejecuta: python --version, node --version" -ForegroundColor Green
}
Write-Host "══════════════════════════════════════════" -ForegroundColor Green
Write-Host ""
