function Assert-FileExists {
    Param ([string]$path)
    if (![System.IO.File]::Exists($path))
    {
        throw "Could not find file at $path"
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

function Run {
    Param ([string]$fileName, [string]$arguments, [string]$workingdirectory)
    
    $pinfo = New-Object System.Diagnostics.ProcessStartInfo
    $pinfo.FileName = $fileName
    $pinfo.RedirectStandardError = $true
    $pinfo.RedirectStandardOutput = $true
    $pinfo.UseShellExecute = $false
    $pinfo.Arguments = $arguments
    if ($workingdirectory) {
        $pinfo.WorkingDirectory = $workingdirectory
    }
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
    return Start-Process -FilePath $autohotkey -Args "$PSScriptRoot\trial.ahk" -PassThru
}
function Invoke-NXGBuildApplication {
    Param ([string]$ProjectDirectory, [string]$ProjectFileName, [string]$TargetName, [string]$ComponentFileName)
    Write-Host "Checking if LabVIEW NXG CLI is available"
    $labviewnxgcli = 'C:\Program Files\National Instruments\LabVIEW NXG 3.0\labviewnxgcli.exe'
    Assert-FileExists($labviewnxgcli)

    $projectpath = Join-Path $ProjectDirectory $ProjectFileName
    $buildapplicationcommand = 'build-application -n "{0}" -t "{1}" -p "{2}"' -f $ComponentFileName, $TargetName, $projectpath

    Write-Host "Running build command: $buildapplicationcommand"
    $process = Watch-TrialWindow
    Run $labviewnxgcli $buildapplicationcommand
    Stop-Process -InputObject $process
}

function Invoke-CopyBuildOutput {
    Param ([string]$ProjectDirectory, [string]$TargetName, [string]$ComponentFileName, [string]$TargetDirectory)
    if ([System.IO.Directory]::Exists($TargetDirectory)) {
        Write-Host "Target directory exists: $TargetDirectory"
    }
    else {
        Write-Host "The target directory does not exist: $TargetDirectory"
        New-Item -Name $TargetDirectory -ItemType directory | Out-Null
        Write-Host "The target directory was created: $TargetDirectory"
    }

    $ComponentFileName -match '(?<ComponentName>.*)\.gcomp' | Out-Null
    $ComponentName = $Matches.ComponentName
    $targetfolder = '{0}_{1}' -f $ComponentName, $TargetName
    $buildoutput = Join-Path $ProjectDirectory "Builds\$targetfolder"
    $buildoutputfiles = Join-Path $buildoutput "\*"
    Assert-DirectoryExists $buildoutput
    
    Write-Host "Start copy from $buildoutput to $TargetDirectory"
    Get-ChildItem $buildoutputfiles | ForEach-Object {
        Copy-Item $_.FullName $TargetDirectory -Recurse
    }
}

Export-ModuleMember -Function Assert-FileExists, Assert-FileDoesNotExist, Run, Invoke-NXGBuildApplication, Invoke-CopyBuildOutput