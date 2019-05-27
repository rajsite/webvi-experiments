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

function Watch-TrialWindow {
    Write-Output "Starting AutoHotKey"
    Start-Process -FilePath "C:\Program Files\AutoHotkey\AutoHotkey.exe" -Args ".\AzurePipelines\trial.ahk"
}
