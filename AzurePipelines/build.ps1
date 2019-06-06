Import-Module -Name "$PSScriptRoot\NXGBuildTools" -Verbose -Force

Write-Host "Build AugmentedReality project"
Invoke-NXGBuildApplication -ProjectDirectory ".\AugmentedReality" -ProjectFileName "AugmentedReality.lvproject" -TargetName "Web Server" -ComponentFileName "WebApp.gcomp"

Write-Host "Build AugmentedReality SecretBox project"
Invoke-NXGBuildApplication -ProjectDirectory ".\AugmentedReality" -ProjectFileName "AugmentedReality.lvproject" -TargetName "Web Server" -ComponentFileName "SecretBox.gcomp"

Write-Host "Build BusyState"
Invoke-NXGBuildApplication -ProjectDirectory ".\BusyState" -ProjectFileName "BusyState.lvproject" -TargetName "Web Server" -ComponentFileName "WebApp.gcomp"

Write-Host "Build ECharts"
Invoke-NXGBuildApplication -ProjectDirectory ".\ECharts" -ProjectFileName "ECharts.lvproject" -TargetName "Web Server" -ComponentFileName "WebApp.gcomp"

Write-Host "Build Express"
Invoke-NXGBuildApplication -ProjectDirectory ".\Express" -ProjectFileName "Express.lvproject" -TargetName "Web Server" -ComponentFileName "WebApp.gcomp"

Write-Host "Build Fire project"
Invoke-NXGBuildApplication -ProjectDirectory ".\Fire" -ProjectFileName "LabVIEW PSX Doom Fire.lvproject" -TargetName "Web Server" -ComponentFileName "Application.gcomp"

Write-Host "Build Leaflet project"
Invoke-NXGBuildApplication -ProjectDirectory ".\Leaflet" -ProjectFileName "Leaflet.lvproject" -TargetName "Web Server" -ComponentFileName "WebApp.gcomp"

Write-Host "Build WebBluetooth project"
Invoke-NXGBuildApplication -ProjectDirectory ".\WebBluetooth" -ProjectFileName "WebBluetooth.lvproject" -TargetName "Web Server" -ComponentFileName "WebApp.gcomp"
