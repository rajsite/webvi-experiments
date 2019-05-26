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

$labviewnxgcli = 'C:\Program Files\National Instruments\LabVIEW NXG 3.0\labviewnxgcli.exe'
Assert-FileExists($labviewnxgcli)

Run $labviewnxgcli 'build-application -n Application.gcomp -t "Web Server" -p ".\Fire\LabVIEW PSX Doom Fire.lvproject"'

$ghpagesbuilddir = ".\ghpagesbuild"
Remove-Item $ghpagesbuilddir -Recurse -Force -ErrorAction SilentlyContinue -ErrorVariable err
Write-Output $err
New-Item -Name $ghpagesbuilddir -ItemType directory | Out-Null

# The Fire project
Write-Output "Building Fire project"
New-Item -Name "$ghpagesbuilddir\Fire" -ItemType directory | Out-Null
Get-ChildItem ".\Fire\Builds\Application_Web Server\*" | ForEach-Object {
    Move-Item $_.FullName "$ghpagesbuilddir\Fire"
}

# Create zip of all contents
Write-Output "Creating archive of all build output"
Compress-Archive -Path $ghpagesbuilddir\* -DestinationPath "$ghpagesbuilddir\ghpages"

# All done
Write-Output "Done! :D"
