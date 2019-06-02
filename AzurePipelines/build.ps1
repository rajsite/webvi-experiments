Import-Module -Name "$PSScriptRoot\NXGBuildTools" -Verbose -Force

Write-Host "Build Augmented Reality project"
Invoke-NXGBuildApplication -ProjectDirectory ".\AugmentedReality" -ProjectFileName "AugmentedReality.lvproject" -TargetName "Web Server" -ComponentFileName "WebApp.gcomp"

Write-Host "Build Fire project"
Invoke-NXGBuildApplication -ProjectDirectory ".\Fire" -ProjectFileName "LabVIEW PSX Doom Fire.lvproject" -TargetName "Web Server" -ComponentFileName "Application.gcomp"

Write-Host "Build Express project"
Invoke-NXGBuildApplication -ProjectDirectory ".\Express" -ProjectFileName "Express.lvproject" -TargetName "Web Server" -ComponentFileName "WebApp.gcomp"
