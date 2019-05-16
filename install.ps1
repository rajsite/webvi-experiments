function Assert-FileExists {
    Param ([string]$path)
    if (![System.IO.File]::Exists($path))
    {
        throw "Could not find file at $path"
    }
    else 
    {
        Write-Output "Found file at $path"
    }
}

function Assert-FileDoesNotExist {
    Param ([string]$path)
    if ([System.IO.File]::Exists($path))
    {
        throw "Found unexpected file at $path."
    }
    else 
    {
        Write-Output "$path not installed."
    }
}

function Run {
    Param ([string]$fileName, [string]$arguments)
    
    $pinfo = New-Object System.Diagnostics.ProcessStartInfo
    $pinfo.FileName = $fileName
    $pinfo.RedirectStandardError = $true
    $pinfo.RedirectStandardOutput = $true
    $pinfo.UseShellExecute = $false
    $pinfo.Arguments = $arguments
    $p = New-Object System.Diagnostics.Process
    $p.StartInfo = $pinfo
    
    $out = New-Object System.Collections.ArrayList
    $handler = 
    {
        if (! [String]::IsNullOrEmpty($EventArgs.Data)) 
        {
            $Event.MessageData.Add($EventArgs.Data)
        }
    }
    
    $outEvent = Register-ObjectEvent -InputObject $p -Action $handler -EventName 'OutputDataReceived' -MessageData $out
        
    $p.Start() | Out-Null
    $p.BeginOutputReadLine()	
    while (!$p.HasExited)
    {
        Wait-Event -Timeout 1
        while($out.Length -gt 0)
        {
            $out[0].ToString()
            $out.RemoveAt(0)
        }
    }
    while($out.Length -gt 0)
    {
        $out[0].ToString()
        $out.RemoveAt(0)
    }
    Unregister-Event -SourceIdentifier $outEvent.Name
}

$rootDirectory = (Get-Location).Path
Write-Output "Current directory $rootDirectory"


# $nipm = 'C:\Program Files\National Instruments\NI Package Manager\NIPackageManager.exe'
$nipm = 'C:\Program Files\National Instruments\NI Package Manager\nipkg.exe'
$install_NIPM = $true
if ($install_NIPM)
{
    $nipmDownloadPath = 'http://download.ni.com/support/softlib/AST/NIPM/NIPackageManager19.0.exe'
    $nipmInstaller = Join-Path -Path $rootDirectory -ChildPath 'install-nipm.exe'
    Assert-FileDoesNotExist($nipm)
    $time = (Get-Date).ToUniversalTime()
    Write-Output "Downloading NIPM from $nipmDownloadPath... UTC $time"
    $webClient = New-Object System.Net.WebClient
    $webClient.DownloadFile($nipmDownloadPath, $nipmInstaller)
    $time = (Get-Date).ToUniversalTime()
    Write-Output "...done at UTC $time"
    Assert-FileExists($nipmInstaller)
    
    Assert-FileDoesNotExist($nipm)
    Write-Output "Installing NIPM..."
    Start-Process -FilePath $nipmInstaller -ArgumentList "/Q" -Wait
    $time = (Get-Date).ToUniversalTime()
    Write-Output "...done at UTC $time"
    Remove-Item $nipmInstaller
}

Assert-FileExists($nipm)

$install_nxg = $true
if ($install_nxg)
{
    $nxg = 'C:\Program Files\National Instruments\LabVIEW NXG 3.0\LabVIEW NXG.exe'
    Assert-FileDoesNotExist($nxg)
    
    Write-Output "Adding LabVIEW NXG feeds to NI Package Manager"
    Run $nipm 'feed-add https://download.ni.com/support/nipkg/products/ni-l/ni-labview-nxg-3.0.0/6.4/released'
    Run $nipm 'feed-add https://download.ni.com/support/nipkg/products/ni-l/ni-labview-nxg-3.0.0-rte/6.4/released'
    Run $nipm 'feed-add https://download.ni.com/support/nipkg/products/ni-l/ni-labview-nxg-3.0.0-web-module/6.4/released'
    Run $nipm 'update'
    
    Write-Output "Installing NI Certificates..."
    Run $nipm 'install ni-certificates --accept-eulas --assume-yes --verbose'
    $time = (Get-Date).ToUniversalTime()
    Write-Output "...done at UTC $time"
    
    Write-Output "Installing LabVIEW NXG..."
    Run $nipm 'install ni-labview-nxg-3.0.0 --accept-eulas --assume-yes --verbose'
    $time = (Get-Date).ToUniversalTime()
    Write-Output "...done at UTC $time"
    
    Write-Output "Installing LabVIEW NXG Web Module..."
    Run $nipm 'install ni-labview-nxg-3.0.0-web-module --accept-eulas --assume-yes --verbose'
    $time = (Get-Date).ToUniversalTime()
    Write-Output "...done at UTC $time"
    Assert-FileExists($nxg)
}

return
