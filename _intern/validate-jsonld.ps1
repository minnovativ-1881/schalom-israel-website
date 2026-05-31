# Validiert alle JSON-LD-Bloecke (<script type="application/ld+json">) der Website.
# Faengt z.B. gerade ASCII-Anfuehrungszeichen (") in description-Feldern, die den
# JSON-String vorzeitig beenden -> GSC-Fehler "Strukturierte Daten, fuer die kein
# Parsen moeglich ist".
#
# Exit-Code 0 = alles valide, 1 = mindestens ein Fehler (blockiert pre-commit).
#
# Aufruf manuell:  powershell -NoProfile -ExecutionPolicy Bypass -File _intern\validate-jsonld.ps1

$ErrorActionPreference = "Stop"

# Repo-Root = eine Ebene ueber _intern\
$root = Split-Path -Parent $PSScriptRoot

$files = Get-ChildItem -Path $root -Recurse -Filter *.html -File |
    Where-Object { $_.FullName -notmatch '\\node_modules\\' }

$rx = [regex]'(?s)<script type="application/ld\+json">(.*?)</script>'
$errors = New-Object System.Collections.Generic.List[string]
$blockCount = 0

foreach ($f in $files) {
    $html = Get-Content $f.FullName -Raw -Encoding UTF8
    $i = 0
    foreach ($m in $rx.Matches($html)) {
        $blockCount++
        $block = $m.Groups[1].Value
        try {
            $null = ConvertFrom-Json $block -ErrorAction Stop
        }
        catch {
            $rel = $f.FullName.Substring($root.Length + 1)
            $msg = ($_.Exception.Message -split "`n")[0].Trim()
            $errors.Add(("  {0} (Block #{1}): {2}" -f $rel, $i, $msg))
        }
        $i++
    }
}

Write-Host ("JSON-LD-Validierung: {0} Bloecke in {1} Dateien geprueft." -f $blockCount, $files.Count)

if ($errors.Count -gt 0) {
    Write-Host ""
    Write-Host ("FEHLER: {0} ungueltige(r) JSON-LD-Block/Bloecke gefunden:" -f $errors.Count) -ForegroundColor Red
    foreach ($e in $errors) { Write-Host $e -ForegroundColor Red }
    Write-Host ""
    Write-Host "Haeufigste Ursache: gerades Anfuehrungszeichen (`") als deutsches Schlusszeichen" -ForegroundColor Yellow
    Write-Host "in einem String-Feld. Durch typografisches Zeichen ersetzen." -ForegroundColor Yellow
    exit 1
}

Write-Host "Alle JSON-LD-Bloecke sind valide." -ForegroundColor Green
exit 0
