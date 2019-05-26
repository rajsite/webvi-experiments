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

Write-Output "Current directory $((Get-Location).Path)"

Write-Output "Checking if LabVIEW NXG CLI is available"
$labviewnxgcli = 'C:\Program Files\National Instruments\LabVIEW NXG 3.0\labviewnxgcli.exe'
Assert-FileExists($labviewnxgcli)

Write-Output "Setting up ghpages output folder"
$ghpagesbuilddir = ".\ghpagesbuild"
Remove-Item $ghpagesbuilddir -Recurse -Force -ErrorAction SilentlyContinue -ErrorVariable err
Write-Output $err
New-Item -Name $ghpagesbuilddir -ItemType directory | Out-Null

Write-Output "Start building projects"

Write-Output "Build Fire project"
Run $labviewnxgcli 'build-application -n Application.gcomp -t "Web Server" -p ".\Fire\LabVIEW PSX Doom Fire.lvproject"'
Write-Output "Copy Fire project build to ghpages output folder"
New-Item -Name "$ghpagesbuilddir\Fire" -ItemType directory | Out-Null
Get-ChildItem ".\Fire\Builds\Application_Web Server\*" | ForEach-Object {
    Move-Item $_.FullName "$ghpagesbuilddir\Fire"
}

Write-Output "Creating archive of all build output"
Compress-Archive -Path $ghpagesbuilddir\* -DestinationPath "$ghpagesbuilddir\ghpages"

Write-Output "Done! :D"
