Import-Module -Name "$PSScriptRoot\..\SharedTools" -Verbose -Force

function Invoke-BuildApplication {
    Param ([string]$ProjectDirectory, [string]$ProjectFileName, [string]$TargetName, [string]$ComponentFileName)
    Write-Host "Checking if GWeb CLI is available"
    $cli = "$Env:Programfiles\National Instruments\G Web Development Software\gwebcli.exe"
    Assert-FileExists($cli)

    $projectpath = Resolve-Path (Join-Path $ProjectDirectory $ProjectFileName)
    $buildapplicationcommand = 'build-application -n "{0}" -t "{1}" -p "{2}"' -f $ComponentFileName, $TargetName, $projectpath

    Write-Host "Running build command: $buildapplicationcommand"
    Invoke-Run $cli $buildapplicationcommand
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
    $buildoutput = Resolve-Path (Join-Path $ProjectDirectory "Builds\$targetfolder")
    $buildoutputfiles = Join-Path $buildoutput "\*"
    Assert-DirectoryExists $buildoutput
    
    Write-Host "Start copy from $buildoutput to $TargetDirectory"
    Get-ChildItem $buildoutputfiles | ForEach-Object {
        Copy-Item $_.FullName $TargetDirectory -Recurse
    }
}

Export-ModuleMember -Function Invoke-BuildApplication, Invoke-CopyBuildOutput
