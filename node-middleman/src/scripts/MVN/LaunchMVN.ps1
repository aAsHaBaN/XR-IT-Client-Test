param ($MvnPath)

if((Get-Process "mvn_studio64" -ea SilentlyContinue) -ne $Null){ 
    echo "MVN is already running, continuing..."
} else {
    if($null -eq $MvnPath) {
        
$baseDir = "C:\Program Files\Xsens"
$folders = [System.IO.Directory]::GetDirectories($baseDir, "Xsens MVN*", [System.IO.SearchOption]::TopDirectoryOnly)

if ($folders.Length -eq 0) {
    Write-Host "No folder starting with 'Xsens MVN' found."
    exit
}

$lastFolder = $folders | ForEach-Object {
    New-Object PSObject -Property @{
        Path = $_
        LastWriteTime = (Get-Item $_).LastWriteTime
    }
} | Sort-Object LastWriteTime -Descending | Select-Object -First 1

$mvnFolder = Join-Path $lastFolder.Path "MVN"

if (-not (Test-Path $mvnFolder)) {
    Write-Host "No 'MVN' folder found inside the selected folder."
    exit
}

$exePath = [System.IO.Directory]::GetFiles($mvnFolder, "mvn_studio64*.exe", [System.IO.SearchOption]::AllDirectories) |
    Select-Object -First 1

if ($exePath -eq $null) {
    Write-Host "No executable starting with 'mvn_studio64' found."
    exit
}
    } else {
        echo "Using path provided in config."
    }

    $response = Start-Process -PassThru -FilePath $exePath

    if((Get-Process "mvn_studio64" -ea SilentlyContinue) -ne $Null){
        echo "MVN started!"
    } else {
        throw "Unable to open MVN, check file executable location and update the config manually."
    }
}