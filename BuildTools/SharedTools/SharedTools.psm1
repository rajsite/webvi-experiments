function Assert-FileExists {
    Param ([string]$path)
    if (![System.IO.File]::Exists($path))
    {
        throw "Could not find file at $path resolved to ${Resolve-Path($path)}"
    }
    else 
    {
        Write-Host "Found file at $path"
    }
}

function Assert-DirectoryExists {
    Param ([string]$path)
    if (![System.IO.Directory]::Exists($path))
    {
        throw "Could not find directory at $path"
    }
    else 
    {
        Write-Host "Found directory at $path"
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
        Write-Host "$path not installed."
    }
}

function Invoke-Run {
    Param ([string]$fileName, [string]$arguments, [string]$workingdirectory)

    $pinfo = New-Object System.Diagnostics.ProcessStartInfo
    $pinfo.FileName = $fileName
    $pinfo.UseShellExecute = $false
    $pinfo.Arguments = $arguments
    if ($workingdirectory) {
        $pinfo.WorkingDirectory = $workingdirectory
    }
    $p = New-Object System.Diagnostics.Process
    $p.StartInfo = $pinfo
    $p.Start();
    $p.WaitForExit();
}

function Invoke-PrintDiskspace {
    Get-WmiObject -Class Win32_logicaldisk
}

Export-ModuleMember -Function Assert-FileExists, Assert-DirectoryExists, Assert-FileDoesNotExist, Invoke-Run, Invoke-PrintDiskspace
