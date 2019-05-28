. .\AzurePipelines\shared.ps1

function Watch-TrialWindow
{
    $autohotkey = "C:\Program Files\AutoHotkey\AutoHotkey.exe"
    Write-Output "Checking if AutoHotKey is already installed"
    if ([System.IO.File]::Exists($autohotkey))
    {
        Write-Output "AutoHotKey already installed"
    }
    else
    {
        Write-Output "Installing AutoHotKey"
        choco install -y autohotkey
        Write-Output "AutoHotKey installed"
    }

    Write-Output "Starting AutoHotKey"
    Start-Process -FilePath $autohotkey -Args ".\AzurePipelines\trial.ahk"
}

Write-Output "Current directory $((Get-Location).Path)"

Write-Output "Checking if LabVIEW NXG CLI is available"
$labviewnxgcli = 'C:\Program Files\National Instruments\LabVIEW NXG 3.0\labviewnxgcli.exe'
Assert-FileExists($labviewnxgcli)

Write-Output "Build Augmented Reality project"
Watch-TrialWindow
Run $labviewnxgcli 'build-application -n WebApp.gcomp -t "Web Server" -p ".\AugmentedReality\AugmentedReality.lvproject"'

Write-Output "Build Fire project"
Watch-TrialWindow
Run $labviewnxgcli 'build-application -n Application.gcomp -t "Web Server" -p ".\Fire\LabVIEW PSX Doom Fire.lvproject"'
