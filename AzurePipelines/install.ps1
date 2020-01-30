Import-Module -Name "$PSScriptRoot\NXGBuildTools" -Verbose -Force

Write-Host "Before removing some Program Files"
Invoke-PrintDiskspace

Remove-Item "$Env:Programfiles\Unity" -Recurse -Force -ErrorAction SilentlyContinue -ErrorVariable err
Write-Host $err

Remove-Item "$Env:Programfiles\Boost" -Recurse -Force -ErrorAction SilentlyContinue -ErrorVariable err
Write-Host $err

Write-Host "After removing some Program Files"
Invoke-PrintDiskspace

$rootDirectory = (Get-Location).Path
Write-Host "Current directory $rootDirectory"

$nipm = "$Env:Programfiles\National Instruments\NI Package Manager\nipkg.exe"
$install_NIPM = $true
if ($install_NIPM)
{
    $nipmDownloadPath = 'http://download.ni.com/support/nipkg/products/ni-package-manager/installers/NIPackageManager19.6.0.exe'
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

    Add-Content "$Env:Localappdata\National Instruments\NI Package Manager\nipkg.ini" "cachepackages=false"
    Invoke-PrintFolderSizes("$Env:Programfiles")
}

Assert-FileExists($nipm)

$install_nxg = $true
if ($install_nxg)
{
    $nxg = "$Env:Programfiles\National Instruments\LabVIEW NXG 4.0\LabVIEW NXG.exe"
    Assert-FileDoesNotExist($nxg)

    Write-Host "Adding LabVIEW NXG feeds to NI Package Manager"
    Run $nipm 'feed-add https://download.ni.com/support/nipkg/products/ni-l/ni-labview-nxg-4.0.0/7.1/released'
    Run $nipm 'feed-add https://download.ni.com/support/nipkg/products/ni-l/ni-labview-nxg-4.0.0-rte/7.1/released'
    Run $nipm 'feed-add https://download.ni.com/support/nipkg/products/ni-l/ni-labview-nxg-4.0.0-web-module/7.1/released'
    Run $nipm 'update'

    Write-Host "Installing NI Certificates..."
    Invoke-PrintDiskspace
    Run $nipm 'install ni-certificates --accept-eulas --assume-yes'
    $time = (Get-Date).ToUniversalTime()
    Write-Host "...done at UTC $time"

    Write-Host "Installing LabVIEW NXG..."
    Invoke-PrintDiskspace
    Run $nipm 'install ni-labview-nxg-4.0.0 --accept-eulas --assume-yes'
    $time = (Get-Date).ToUniversalTime()
    Write-Host "...done at UTC $time"
    Invoke-PrintDiskspace
    Invoke-DeletePackages
    Invoke-PrintDiskspace

    Write-Host "Installing LabVIEW NXG Web Module..."
    Invoke-PrintDiskspace
    Run $nipm 'install ni-labview-nxg-4.0.0-web-module --accept-eulas --assume-yes'
    $time = (Get-Date).ToUniversalTime()
    Write-Host "...done at UTC $time"
    Assert-FileExists($nxg)
    Invoke-PrintDiskspace
    Invoke-DeletePackages
    Invoke-PrintDiskspace
}

return
