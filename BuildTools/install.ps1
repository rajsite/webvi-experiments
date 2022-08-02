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
    # Packages from https://download.ni.com/support/nipkg/products/ni-g/ni-g-web-development/22.3/released/Packages
    $packages = ""`

        ## Depends

        + "ni-artistic-style-22 "`
        + "ni-ceip "`
        + "ni-ceip-x86 "`
        + "ni-error-report "`
        + "ni-error-reporting-interface "`
        + "ni-g-web-development-bin-msi "`
        + "ni-g-web-development-chromiumfx-bin "`
        + "ni-g-web-development-command-line-tools-bin "`
        + "ni-g-web-development-context-help "`
        + "ni-g-web-development-dll-bin "`
        + "ni-g-web-development-http-bin "`
        + "ni-g-web-development-licensing-bin "`
        + "ni-g-web-development-resources-bin "`
        + "ni-g-web-development-stdlib-bin "`
        + "ni-g-web-development-support-bin "`
        + "ni-g-web-development-web-support "`
        + "ni-g-web-development-websockets-bin "`
        + "ni-labview-nxg-webserver-bin "`
        + "ni-license-manager "`
        + "ni-logos "`
        + "ni-msdotnet4x "`
        + "ni-mstudio-common-fx40-19.1.0-runtime "`
        + "ni-msvcrt-2015 "`
        + "ni-package-manager-deployment-support "`
        # + "ni-skyline-file-webui "`
        # + "ni-skyline-message-service "`
        # + "ni-skyline-security-webui "`
        # + "ni-skyline-tag-webui "`
        # + "ni-skyline-tdmreader-webservice "`
        + "ni-slcp "`
        + "ni-slcp-x86 "`
        + "ni-sysapi "`
        + "ni-syscfg-dotnet-runtime "`
        + "ni-update-service "`
        + "ni-webserver "`

        ## Recommends

        # + "ni-skyline-file-labview-2019-support "`
        # + "ni-skyline-file-labview-2019-support-x86 "`
        # + "ni-skyline-file-labview-2020-support "`
        # + "ni-skyline-file-labview-2020-support-x86 "`
        # + "ni-skyline-file-labview-2021-support "`
        # + "ni-skyline-file-labview-2021-support-x86 "`
        # + "ni-skyline-file-labview-2022-support "`
        # + "ni-skyline-file-labview-2022-support-x86 "`
        # + "ni-skyline-message-labview-2019-support "`
        # + "ni-skyline-message-labview-2019-support-x86 "`
        # + "ni-skyline-message-labview-2020-support "`
        # + "ni-skyline-message-labview-2020-support-x86 "`
        # + "ni-skyline-message-labview-2021-support "`
        # + "ni-skyline-message-labview-2021-support-x86 "`
        # + "ni-skyline-message-labview-2022-support "`
        # + "ni-skyline-message-labview-2022-support-x86 "`
        # + "ni-skyline-tag-labview-2019-support "`
        # + "ni-skyline-tag-labview-2019-support-x86 "`
        # + "ni-skyline-tag-labview-2020-support "`
        # + "ni-skyline-tag-labview-2020-support-x86 "`
        # + "ni-skyline-tag-labview-2021-support "`
        # + "ni-skyline-tag-labview-2021-support-x86 "`
        # + "ni-skyline-tag-labview-2022-support "`
        # + "ni-skyline-tag-labview-2022-support-x86 "`
        # + "ni-systemlink-cloud-connector-webui "`
        + "ni-systemlink-message-g-web-development-support "`
        + "ni-systemlink-tag-g-web-development-support "`
        + "ni-systemlink-tdm-reader-g-web-development-support "`
        # + "ni-systemlink-webvi-host-webui "`
        + ""
    Invoke-Run $nipm "install $packages --accept-eulas --assume-yes"
    $time = (Get-Date).ToUniversalTime()
    Write-Host "...done at UTC $time"
    Invoke-PrintDiskspace
}

Write-Host "Done! :D"
