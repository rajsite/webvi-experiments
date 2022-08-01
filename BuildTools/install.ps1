Import-Module -Name "$PSScriptRoot\SharedTools" -Verbose -Force

$rootDirectory = (Get-Location).Path
Write-Host "Current directory $rootDirectory"

$nipm = "$Env:Programfiles\National Instruments\NI Package Manager\nipkg.exe"
$install_NIPM = $true
if ($install_NIPM)
{
    $nipmDownloadPath = 'https://download.ni.com/support/nipkg/products/ni-package-manager/installers/NIPackageManager22.5.0.exe'
    $nipmInstaller = Join-Path -Path $rootDirectory -ChildPath 'install-nipm.exe'
    Assert-FileDoesNotExist($nipm)
    $time = (Get-Date).ToUniversalTime()
    Write-Host "Downloading NIPM from $nipmDownloadPath... UTC $time"
    $webClient = New-Object System.Net.WebClient
    $webClient.DownloadFile($nipmDownloadPath, $nipmInstaller)
    $time = (Get-Date).ToUniversalTime()
    Write-Host "...done at UTC $time"
    Assert-FileExists($nipmInstaller)

    Assert-FileDoesNotExist($nipm)
    Write-Host "Installing NIPM..."
    # Command line flags http://www.ni.com/documentation/en/ni-package-manager/latest/manual/automate-installer/
    Start-Process -FilePath $nipmInstaller -ArgumentList "--passive --accept-eulas --prevent-reboot" -Wait
    $time = (Get-Date).ToUniversalTime()
    Write-Host "...done at UTC $time"
    Remove-Item $nipmInstaller
}

Assert-FileExists($nipm)

$install_editor = $true
if ($install_editor)
{
    $editor = "$Env:Programfiles\National Instruments\G Web Development Software\GWeb.exe"
    Assert-FileDoesNotExist($editor)

    Write-Host "Adding Editor feeds to NI Package Manager"
    Invoke-Run $nipm 'feed-add https://download.ni.com/support/nipkg/products/ni-g/ni-g-web-development/22.3/released'
    Invoke-Run $nipm 'feed-add https://download.ni.com/support/nipkg/products/ni-g/ni-g-web-development/22.3/released-critical'
    Invoke-Run $nipm 'update'

    Write-Host "Installing NI Certificates..."
    Invoke-PrintDiskspace
    Invoke-Run $nipm 'install ni-certificates --accept-eulas --assume-yes'
    $time = (Get-Date).ToUniversalTime()
    Write-Host "...done at UTC $time"
    Invoke-PrintDiskspace

    Write-Host "Installing Editor..."
    Invoke-PrintDiskspace
    Invoke-Run $nipm 'install ni-g-web-development --accept-eulas --assume-yes'
    $time = (Get-Date).ToUniversalTime()
    Write-Host "...done at UTC $time"
    Invoke-PrintDiskspace
}

Write-Host "Done! :D"
