# Cleanup and Organize Documentation Files

Write-Host "🧹 Starting cleanup and organization..." -ForegroundColor Cyan

# Create directory structure
$docDirs = @(
    "docs/features",
    "docs/setup", 
    "docs/guides",
    "docs/reference"
)

foreach ($dir in $docDirs) {
    if (!(Test-Path $dir)) {
        New-Item -ItemType Directory -Path $dir -Force | Out-Null
    }
}

# Move feature documentation
$featureFiles = @(
    @{ src = "FACE_RECOGNITION_SYSTEM.md"; dst = "docs/features/" },
    @{ src = "FACE_RECOGNITION_GUIDE.md"; dst = "docs/features/" },
    @{ src = "FRIDGE_DETECTION_DISPLAY.md"; dst = "docs/features/" },
    @{ src = "FRIDGE_ITEM_DETECTION.md"; dst = "docs/features/" },
    @{ src = "WATER_MOTOR_MQTT.md"; dst = "docs/features/" },
    @{ src = "ESP8266_COMPATIBILITY.md"; dst = "docs/features/" }
)

Write-Host "`n📁 Moving feature documentation..." -ForegroundColor Yellow
foreach ($file in $featureFiles) {
    if (Test-Path $file.src) {
        Move-Item -Path $file.src -Destination $file.dst -Force
        Write-Host "  ✓ $($file.src) → $($file.dst)"
    }
}

# Move setup documentation
$setupFiles = @(
    @{ src = "RUN_FRIDGE_DETECTION.md"; dst = "docs/setup/" },
    @{ src = "STARTUP_GUIDE.md"; dst = "docs/setup/" },
    @{ src = "HOW_TO_RUN_PROJECT.md"; dst = "docs/setup/" },
    @{ src = "QUICK_START.md"; dst = "docs/setup/" }
)

Write-Host "`n⚙️  Moving setup documentation..." -ForegroundColor Yellow
foreach ($file in $setupFiles) {
    if (Test-Path $file.src) {
        Move-Item -Path $file.src -Destination $file.dst -Force
        Write-Host "  ✓ $($file.src) → $($file.dst)"
    }
}

# Move guide documentation
$guideFiles = @(
    @{ src = "IMPLEMENTATION_SUMMARY.md"; dst = "docs/guides/" },
    @{ src = "DASHBOARD_IMPROVEMENTS.md"; dst = "docs/guides/" },
    @{ src = "TESTING_CROSS_TAB_SYNC.md"; dst = "docs/guides/" },
    @{ src = "TESTING_CHECKLIST.md"; dst = "docs/guides/" }
)

Write-Host "`n📖 Moving guide documentation..." -ForegroundColor Yellow
foreach ($file in $guideFiles) {
    if (Test-Path $file.src) {
        Move-Item -Path $file.src -Destination $file.dst -Force
        Write-Host "  ✓ $($file.src) → $($file.dst)"
    }
}

# Move reference documentation
$refFiles = @(
    @{ src = "QUICK_REFERENCE.md"; dst = "docs/reference/" },
    @{ src = "SYSTEM_OVERVIEW.md"; dst = "docs/reference/" },
    @{ src = "FEATURES_OVERVIEW.md"; dst = "docs/reference/" }
)

Write-Host "`n📚 Moving reference documentation..." -ForegroundColor Yellow
foreach ($file in $refFiles) {
    if (Test-Path $file.src) {
        Move-Item -Path $file.src -Destination $file.dst -Force
        Write-Host "  ✓ $($file.src) → $($file.dst)"
    }
}

# Delete redundant files
$redundantFiles = @(
    "CHANGES_SUMMARY.md",
    "DASHBOARD_LAYOUT.md",
    "FINAL_SUMMARY.md",
    "FRIDGE_DETECTION_QUICK_START.md",
    "FRIDGE_DETECTION_SETUP.md",
    "FRIDGE_IMAGES_PROCEDURE.md",
    "FRIDGE_IMAGE_USAGE.md",
    "FULL_DUPLEX_TEST.md",
    "REORGANIZATION_SUMMARY.md",
    "QUICK_REFERENCE.txt",
    "face_recognition_requirements.txt",
    "face_recognition_simple_requirements.txt",
    "simple_requirements.txt"
)

Write-Host "`n🗑️  Removing redundant files..." -ForegroundColor Red
foreach ($file in $redundantFiles) {
    if (Test-Path $file) {
        Remove-Item -Path $file -Force
        Write-Host "  ✗ Deleted: $file"
    }
}

Write-Host "`n✅ Cleanup complete!" -ForegroundColor Green
Write-Host "`n[FINAL STRUCTURE]" -ForegroundColor Cyan
Write-Host "docs/"
Write-Host "  - features/     (Face Recognition, Fridge Detection, Water Motor)"
Write-Host "  - setup/        (How to run, startup guides)"
Write-Host "  - guides/       (Implementation, testing, dashboard)"
Write-Host "  - reference/    (System overview, features, quick reference)"
Write-Host "`nRoot files:"
Write-Host "  - README.md"
Write-Host "  - START_PROJECT.bat"
Write-Host "  - STOP_PROJECT.bat"
Write-Host "  - RUN_FRIDGE_DETECTION.bat"
Write-Host "  - install_python_deps.bat"
