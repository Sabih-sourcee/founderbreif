<#
.SYNOPSIS
  FounderBrief Android pre-release gate. Run before every production EAS build / Play upload.

.EXAMPLE
  cd C:\Users\PC\Documents\founderbreif\mobile
  .\scripts\pre-release-check.ps1

.EXAMPLE
  .\scripts\pre-release-check.ps1 -MinVersionCode 4
#>

[CmdletBinding()]
param(
  # Pass the highest versionCode currently on the Play track you are uploading to.
  [int]$MinVersionCode = 0
)

$ErrorActionPreference = "Continue"

# Script lives in mobile/scripts -> mobile root is parent of scripts
$Mobile = Split-Path $PSScriptRoot -Parent
if (-not (Test-Path (Join-Path $Mobile "app.json"))) {
  Write-Host "Could not find mobile/app.json above $PSScriptRoot" -ForegroundColor Red
  exit 1
}

# ---- Expected values (update here if Play / Expo ever change) ----
$Expected = @{
  ExpoUser           = "sabih-source"
  ProjectId          = "53e234a3-5c39-4a3f-9191-f0e6bdd480e6"
  ForbiddenProject   = "c1d8b43a-3276-4987-ba7c-9f26836de165"
  AndroidPackage     = "com.founderbreif.app"
  ForbiddenPackage   = "com.founderbrief.app"
  KeyAlias           = "5464264642eae9ad6b98a60fde71177c"
  UploadSha1         = "4E:3C:CC:D2:23:43:A1:29:9C:F9:01:3E:5E:B5:9B:BF:FC:71:90:AF"
  UploadSha256       = "A7:DF:99:A4:56:A2:D6:61:5F:3D:C0:36:6C:EF:53:78:78:8D:05:4F:C5:01:DA:C8:3D:C2:A2:0F:6E:13:00:E8"
  ForbiddenSha1      = "73:3E:AA:C1:6A:A5:C9:79:60:81:5A:C3:FC:CB:36:9E:E6:17:FE:13"
  ApiUrl             = "https://founderbreif.vercel.app"
  Offering           = "FounderBreif Pro Plans"
}

$pass = 0
$fail = 0
$warn = 0

function Write-Pass([string]$msg) {
  $script:pass++
  Write-Host "  PASS  $msg" -ForegroundColor Green
}
function Write-Fail([string]$msg) {
  $script:fail++
  Write-Host "  FAIL  $msg" -ForegroundColor Red
}
function Write-Warn([string]$msg) {
  $script:warn++
  Write-Host "  WARN  $msg" -ForegroundColor Yellow
}
function Write-Info([string]$msg) {
  Write-Host "  ----  $msg" -ForegroundColor DarkGray
}
function Section([string]$title) {
  Write-Host ""
  Write-Host "== $title ==" -ForegroundColor Cyan
}

Write-Host ""
Write-Host "FounderBrief pre-release check" -ForegroundColor White
Write-Host "Mobile root: $Mobile" -ForegroundColor DarkGray

$keytoolCandidates = @(
  "C:\Program Files\Eclipse Adoptium\jdk-17.0.20.101-hotspot\bin\keytool.exe",
  "C:\Program Files\Android\Android Studio\jbr\bin\keytool.exe"
)
$cmdKeytool = Get-Command keytool -ErrorAction SilentlyContinue
if ($cmdKeytool) { $keytoolCandidates += $cmdKeytool.Source }
$Keytool = $keytoolCandidates | Where-Object { $_ -and (Test-Path $_) } | Select-Object -First 1

$appJsonPath = Join-Path $Mobile "app.json"
$easJsonPath = Join-Path $Mobile "eas.json"
$credJsonPath = Join-Path $Mobile "credentials.json"
$rcPath = Join-Path $Mobile "services\revenuecat.ts"
$envExample = Join-Path $Mobile ".env.example"

if (-not (Test-Path $appJsonPath)) {
  Write-Fail "app.json not found at $appJsonPath"
  exit 1
}

$app = Get-Content $appJsonPath -Raw -Encoding UTF8 | ConvertFrom-Json
$eas = $null
if (Test-Path $easJsonPath) {
  $eas = Get-Content $easJsonPath -Raw -Encoding UTF8 | ConvertFrom-Json
}
$cred = $null
if (Test-Path $credJsonPath) {
  $cred = Get-Content $credJsonPath -Raw -Encoding UTF8 | ConvertFrom-Json
}

# ------------------------------------------------------------------
Section "0. Expo account and project"

Push-Location $Mobile
try {
  $whoRaw = npx eas-cli whoami 2>&1 | Out-String
  if ($whoRaw -match [regex]::Escape($Expected.ExpoUser)) {
    Write-Pass "Logged in as $($Expected.ExpoUser)"
  } elseif ($whoRaw) {
    Write-Fail "Not logged in as $($Expected.ExpoUser). Run: npx eas-cli login"
    Write-Info ($whoRaw.Trim().Substring(0, [Math]::Min(200, $whoRaw.Trim().Length)))
  } else {
    Write-Fail "Could not read eas whoami. Run: npx eas-cli login"
  }
} catch {
  Write-Fail "eas whoami failed: $($_.Exception.Message)"
}
Pop-Location

$projectId = $app.expo.extra.eas.projectId
if ($projectId -eq $Expected.ProjectId) {
  Write-Pass "projectId = $projectId"
} elseif ($projectId -eq $Expected.ForbiddenProject) {
  Write-Fail "projectId is the FORBIDDEN id ($projectId). Use $($Expected.ProjectId)"
} else {
  Write-Fail "projectId = '$projectId' expected $($Expected.ProjectId)"
}

# ------------------------------------------------------------------
Section "1. Android package name"

$pkg = $app.expo.android.package
if ($pkg -eq $Expected.AndroidPackage) {
  Write-Pass "android.package = $pkg"
} elseif ($pkg -eq $Expected.ForbiddenPackage) {
  Write-Fail "android.package is the WRONG spelling '$pkg'. Must be $($Expected.AndroidPackage)"
} else {
  Write-Fail "android.package = '$pkg' expected $($Expected.AndroidPackage)"
}

$iosId = $app.expo.ios.bundleIdentifier
Write-Info "iOS bundleIdentifier = $iosId - Android package is what Play checks"

# ------------------------------------------------------------------
Section "2. Upload signing key"

if (-not $eas) {
  Write-Fail "eas.json missing"
} else {
  $src = $eas.build.production.android.credentialsSource
  if ($src -eq "local") {
    Write-Pass "eas.json production credentialsSource = local"
  } else {
    Write-Fail "eas.json production credentialsSource = '$src' - must be local"
  }
}

if (-not $cred) {
  Write-Fail "credentials.json missing - create it from Expo credentials download"
} else {
  $ks = $cred.android.keystore
  $ksPath = Join-Path $Mobile ($ks.keystorePath -replace '/', '\')

  if ($ks.keyAlias -eq $Expected.KeyAlias) {
    Write-Pass "keyAlias = $($ks.keyAlias)"
  } else {
    Write-Fail "keyAlias = '$($ks.keyAlias)' expected $($Expected.KeyAlias)"
  }

  if ($ks.keystorePath -match "playstore_verified") {
    Write-Pass "keystorePath points at Play-verified file: $($ks.keystorePath)"
  } else {
    Write-Warn "keystorePath = $($ks.keystorePath) - prefer playstore_verified_keystore.jks"
  }

  if (-not (Test-Path $ksPath)) {
    Write-Fail "Keystore file not found: $ksPath"
  } elseif (-not $Keytool) {
    Write-Fail "keytool.exe not found. Install JDK or Android Studio JBR."
  } elseif (-not $ks.keystorePassword) {
    Write-Fail "credentials.json missing keystorePassword"
  } else {
    $out = & $Keytool -list -v -keystore $ksPath -storepass $ks.keystorePassword -alias $ks.keyAlias 2>&1 | Out-String
    if ($out -match "password was incorrect|Keystore was tampered") {
      Write-Fail "Keystore password incorrect for $ksPath"
    } elseif ($out -match "does not exist") {
      Write-Fail "Alias $($ks.keyAlias) not found in keystore"
    } else {
      $sha1 = ""
      $sha256 = ""
      if ($out -match "SHA1:\s*([0-9A-Fa-f:]+)") { $sha1 = $Matches[1].ToUpper() }
      if ($out -match "SHA256:\s*([0-9A-Fa-f:]+)") { $sha256 = $Matches[1].ToUpper() }

      if ($sha1 -eq $Expected.UploadSha1) {
        Write-Pass "Upload SHA-1 matches Play: $sha1"
      } elseif ($sha1 -eq $Expected.ForbiddenSha1) {
        Write-Fail "SHA-1 is the WRONG Oct-12 key ($sha1). Play expects $($Expected.UploadSha1)"
      } elseif ($sha1) {
        Write-Fail "SHA-1 = $sha1 expected $($Expected.UploadSha1)"
      } else {
        Write-Fail "Could not read SHA-1 from keystore"
      }

      if ($sha256 -eq $Expected.UploadSha256) {
        Write-Pass "Upload SHA-256 matches Play"
      } elseif ($sha256) {
        Write-Fail "SHA-256 = $sha256 expected $($Expected.UploadSha256)"
      }
    }
  }
}

# ------------------------------------------------------------------
Section "3. Version / rollout"

$ver = $app.expo.version
Write-Info "app.json version name = $ver"
$localVc = $app.expo.android.versionCode
$appVersionSource = if ($eas) { $eas.cli.appVersionSource } else { $null }

if ($appVersionSource -eq "local") {
  Write-Pass "appVersionSource = local - versionCode comes from app.json"
  if ($null -ne $localVc) {
    Write-Pass "android.versionCode = $localVc"
    if ($MinVersionCode -gt 0 -and $localVc -le $MinVersionCode) {
      Write-Fail "versionCode $localVc is not higher than Play last ($MinVersionCode). Bump app.json android.versionCode."
    } elseif ($MinVersionCode -gt 0) {
      Write-Pass "versionCode $localVc is higher than Play last ($MinVersionCode)"
    }
  } else {
    Write-Fail "android.versionCode missing from app.json"
  }
} elseif ($appVersionSource -eq "remote") {
  Write-Warn "appVersionSource = remote - app.json versionCode is ignored. Use eas build:version:set or switch to local."
  if ($null -ne $localVc) {
    Write-Info "app.json versionCode=$localVc is ignored while remote is on"
  }
} else {
  Write-Warn "appVersionSource = '$appVersionSource'"
}

if ($eas) {
  if ($eas.build.production.autoIncrement -eq $true) {
    Write-Info "production autoIncrement = true"
  } else {
    Write-Info "production autoIncrement = false - exact app.json versionCode will be used"
  }
}

if ($MinVersionCode -le 0) {
  Write-Warn "Pass -MinVersionCode N next time. Example: .\scripts\pre-release-check.ps1 -MinVersionCode 16"
}

# ------------------------------------------------------------------
Section "4. Production API"

if ($eas) {
  $prodUrl = $eas.build.production.env.EXPO_PUBLIC_API_URL
  if ($prodUrl -eq $Expected.ApiUrl) {
    Write-Pass "EXPO_PUBLIC_API_URL = $prodUrl"
  } elseif ($prodUrl -match "localhost") {
    Write-Fail "Production API URL is localhost: $prodUrl"
  } elseif ($prodUrl) {
    Write-Fail "EXPO_PUBLIC_API_URL = '$prodUrl' expected $($Expected.ApiUrl)"
  } else {
    Write-Fail "Missing EXPO_PUBLIC_API_URL in eas.json production.env"
  }
}

$extraApi = $app.expo.extra.apiUrl
if ($extraApi -match "localhost") {
  Write-Info "app.json extra.apiUrl is localhost - OK for local; production uses eas.json env"
}

$healthUrl = $Expected.ApiUrl + "/api/health"
try {
  $health = Invoke-RestMethod -Uri $healthUrl -TimeoutSec 15
  $ok = $false
  if ($health -is [string] -and $health -match "ok") { $ok = $true }
  if ($health.status -eq "ok") { $ok = $true }
  if ($ok) {
    Write-Pass "Backend health OK at $healthUrl"
  } else {
    Write-Warn "Backend responded but status unexpected"
  }
} catch {
  Write-Fail "Backend health check failed: $($_.Exception.Message)"
}

# ------------------------------------------------------------------
Section "5. RevenueCat"

if (Test-Path $rcPath) {
  $rcText = Get-Content $rcPath -Raw -Encoding UTF8
  if ($rcText -match [regex]::Escape($Expected.Offering)) {
    Write-Pass "Offering id present: $($Expected.Offering)"
  } else {
    Write-Fail "Offering '$($Expected.Offering)' not found in revenuecat.ts"
  }
  if ($rcText -match "pro" -or $rcText -match "Pro Plan") {
    Write-Pass "Entitlement ids referenced in revenuecat.ts"
  } else {
    Write-Warn "Could not confirm entitlement ids in revenuecat.ts"
  }
  if ($rcText -match "goog_") {
    Write-Pass "Android public key fallback present"
  } else {
    Write-Warn "No goog_ key visible in revenuecat.ts - ensure EXPO_PUBLIC_RC_ANDROID_KEY is set"
  }
} else {
  Write-Fail "services/revenuecat.ts missing"
}

if (Test-Path $envExample) {
  $ex = Get-Content $envExample -Raw -Encoding UTF8
  if ($ex -match "EXPO_PUBLIC_RC_ANDROID_KEY=goog_") {
    Write-Pass ".env.example documents EXPO_PUBLIC_RC_ANDROID_KEY"
  } else {
    Write-Warn ".env.example missing EXPO_PUBLIC_RC_ANDROID_KEY"
  }
}

Write-Info "Real purchases only work on an EAS APK/AAB - not Expo Go."

# ------------------------------------------------------------------
Section "6. Git safety"

$repoRoot = Split-Path $Mobile -Parent
Push-Location $repoRoot
try {
  $ignoreCred = git check-ignore -v "mobile/credentials.json" 2>$null
  if ($ignoreCred) {
    Write-Pass "mobile/credentials.json is gitignored"
  } else {
    Write-Fail "mobile/credentials.json is NOT gitignored - add it to .gitignore"
  }

  $ignoreDir = git check-ignore -v "mobile/credentials/android/keystore.jks" 2>$null
  if ($ignoreDir) {
    Write-Pass "mobile/credentials/ keystore path is gitignored"
  } else {
    Write-Warn "Could not confirm credentials/android is gitignored"
  }
} catch {
  Write-Warn "Git checks skipped: $($_.Exception.Message)"
}
Pop-Location

# ------------------------------------------------------------------
Section "Summary"

Write-Host ""
Write-Host "  Passed: $pass   Failed: $fail   Warnings: $warn" -ForegroundColor White
Write-Host ""

if ($fail -gt 0) {
  Write-Host "NOT READY - fix FAIL items before building / uploading." -ForegroundColor Red
  Write-Host "Full checklist: mobile\PRE_RELEASE_CHECKLIST.md" -ForegroundColor DarkGray
  exit 1
}

Write-Host "READY for production build - still confirm Play versionCode manually." -ForegroundColor Green
Write-Host ""
Write-Host "Next:" -ForegroundColor Cyan
Write-Host "  npx eas-cli build -p android --profile production"
Write-Host "  Then upload ONLY the new .aab from the Expo build page."
Write-Host ""
exit 0
