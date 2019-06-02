. .\AzurePipelines\shared.ps1

function Watch-TrialWindow
{
    $autohotkey = "C:\Program Files\AutoHotkey\AutoHotkey.exe"
    Write-Host "Checking if AutoHotKey is already installed"
    if ([System.IO.File]::Exists($autohotkey))
    {
        Write-Host "AutoHotKey already installed"
    }
    else
    {
        Write-Host "Installing AutoHotKey"
        choco install -y autohotkey
        Write-Host "AutoHotKey installed"
    }

    Write-Host "Starting AutoHotKey"
    return Start-Process -FilePath $autohotkey -Args ".\AzurePipelines\trial.ahk" -PassThru
}

Write-Host "Current directory $((Get-Location).Path)"

Write-Host "Checking if LabVIEW NXG CLI is available"
$labviewnxgcli = 'C:\Program Files\National Instruments\LabVIEW NXG 3.0\labviewnxgcli.exe'
Assert-FileExists($labviewnxgcli)

Write-Host "Build Augmented Reality project"
$process = Watch-TrialWindow
Run $labviewnxgcli 'build-application -n WebApp.gcomp -t "Web Server" -p ".\AugmentedReality\AugmentedReality.lvproject"'
Stop-Process -InputObject $process

Write-Host "Build Fire project"
$process = Watch-TrialWindow
Run $labviewnxgcli 'build-application -n Application.gcomp -t "Web Server" -p ".\Fire\LabVIEW PSX Doom Fire.lvproject"'
Stop-Process -InputObject $process

Write-Host "Build Express project"
$process = Watch-TrialWindow
Run $labviewnxgcli 'build-application -n WebApp.gcomp -t "Web Server" -p ".\Express\Express.lvproject"'
Stop-Process -InputObject $process
