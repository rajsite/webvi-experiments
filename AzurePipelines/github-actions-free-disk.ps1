Import-Module -Name "$PSScriptRoot\NXGBuildTools" -Verbose -Force

Write-Host "Before removing some Program Files"
Invoke-PrintFolderSizes("$Env:Programfiles")
Invoke-PrintDiskspace

Remove-Item "$Env:Programfiles\Unity" -Recurse -Force -ErrorAction SilentlyContinue -ErrorVariable err
Write-Host $err

Remove-Item "$Env:Programfiles\Boost" -Recurse -Force -ErrorAction SilentlyContinue -ErrorVariable err
Write-Host $err

Write-Host "After removing some Program Files"
Invoke-PrintDiskspace
