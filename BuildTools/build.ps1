Param ([switch]$usemonitor = $false)

Import-Module -Name "$PSScriptRoot\NXGBuildTools" -Verbose -Force

Write-Host "Use cli monitor?: $usemonitor"

Write-Host "Build Arcade projects: Avalanche"
Invoke-NXGBuildApplication -ProjectDirectory ".\Arcade\Avalanche\nxg" -ProjectFileName "Avalanche.lvproject" -TargetName "Web Server" -ComponentFileName "WebApp.gcomp" -usemonitor:$usemonitor

Write-Host "Build Arcade projects: DigitalClock"
Invoke-NXGBuildApplication -ProjectDirectory ".\Arcade\DigitalClock" -ProjectFileName "DigitalClock.lvproject" -TargetName "Web Server" -ComponentFileName "WebApp.gcomp" -usemonitor:$usemonitor

Write-Host "Build Arcade projects: DrEmoji"
Invoke-NXGBuildApplication -ProjectDirectory ".\Arcade\DrEmoji\nxg" -ProjectFileName "DrEmoji.lvproject" -TargetName "Web Server" -ComponentFileName "WebApp.gcomp" -usemonitor:$usemonitor

Write-Host "Build Arcade projects: Fire"
Invoke-NXGBuildApplication -ProjectDirectory ".\Arcade\Fire" -ProjectFileName "LabVIEW PSX Doom Fire.lvproject" -TargetName "Web Server" -ComponentFileName "Application.gcomp" -usemonitor:$usemonitor

Write-Host "Build Arcade projects: Reflex"
Invoke-NXGBuildApplication -ProjectDirectory ".\Arcade\Reflex" -ProjectFileName "Reflex.lvproject" -TargetName "Web Server" -ComponentFileName "WebApp.gcomp" -usemonitor:$usemonitor

Write-Host "Build Arcade projects: Snake"
Invoke-NXGBuildApplication -ProjectDirectory ".\Arcade\Snake\nxg" -ProjectFileName "Snake.lvproject" -TargetName "Web Server" -ComponentFileName "WebApp.gcomp" -usemonitor:$usemonitor

Write-Host "Build Bootstrap project"
Invoke-NXGBuildApplication -ProjectDirectory ".\Bootstrap" -ProjectFileName "Bootstrap.lvproject" -TargetName "Web Server" -ComponentFileName "WebApp.gcomp" -usemonitor:$usemonitor

Write-Host "Build ControlTools project"
Invoke-NXGBuildApplication -ProjectDirectory ".\ControlTools" -ProjectFileName "ControlTools.lvproject" -TargetName "Web Server" -ComponentFileName "WebApp.gcomp" -usemonitor:$usemonitor

Write-Host "Build DeclarativeStyle project"
Invoke-NXGBuildApplication -ProjectDirectory ".\DeclarativeStyle" -ProjectFileName "DeclarativeStyle.lvproject" -TargetName "Web Server" -ComponentFileName "WebApp.gcomp" -usemonitor:$usemonitor

Write-Host "Build ECharts project"
Invoke-NXGBuildApplication -ProjectDirectory ".\ECharts" -ProjectFileName "ECharts.lvproject" -TargetName "Web Server" -ComponentFileName "WebApp.gcomp" -usemonitor:$usemonitor

Write-Host "Build File project"
Invoke-NXGBuildApplication -ProjectDirectory ".\File" -ProjectFileName "File.lvproject" -TargetName "Web Server" -ComponentFileName "WebApp.gcomp" -usemonitor:$usemonitor

Write-Host "Build GoogleCharts project"
Invoke-NXGBuildApplication -ProjectDirectory ".\GoogleCharts" -ProjectFileName "GoogleCharts.lvproject" -TargetName "Web Server" -ComponentFileName "WebApp.gcomp" -usemonitor:$usemonitor

Write-Host "Build IFrame project"
Invoke-NXGBuildApplication -ProjectDirectory ".\IFrame" -ProjectFileName "IFrame.lvproject" -TargetName "Web Server" -ComponentFileName "WebApp.gcomp" -usemonitor:$usemonitor

Write-Host "Build ImmersiveWeb projects: AugmentedReality"
Invoke-NXGBuildApplication -ProjectDirectory ".\ImmersiveWeb" -ProjectFileName "ImmersiveWeb.lvproject" -TargetName "Web Server" -ComponentFileName "WebApp.gcomp" -usemonitor:$usemonitor

Write-Host "Build ImmersiveWeb projects: HardwareDashboard"
Invoke-NXGBuildApplication -ProjectDirectory ".\ImmersiveWeb" -ProjectFileName "ImmersiveWeb.lvproject" -TargetName "Web Server" -ComponentFileName "HardwareDashboard.gcomp" -usemonitor:$usemonitor

Write-Host "Build ImmersiveWeb projects: SecretBox"
Invoke-NXGBuildApplication -ProjectDirectory ".\ImmersiveWeb" -ProjectFileName "ImmersiveWeb.lvproject" -TargetName "Web Server" -ComponentFileName "SecretBox.gcomp" -usemonitor:$usemonitor

Write-Host "Build ImmersiveWeb projects: VirtualReality"
Invoke-NXGBuildApplication -ProjectDirectory ".\ImmersiveWeb" -ProjectFileName "ImmersiveWeb.lvproject" -TargetName "Web Server" -ComponentFileName "VirtualReality.gcomp" -usemonitor:$usemonitor

Write-Host "Build JSONParser project"
Invoke-NXGBuildApplication -ProjectDirectory ".\JSONParser" -ProjectFileName "JSONParser.lvproject" -TargetName "Web Server" -ComponentFileName "WebApp.gcomp" -usemonitor:$usemonitor

Write-Host "Build Leaflet project"
Invoke-NXGBuildApplication -ProjectDirectory ".\Map" -ProjectFileName "Map.lvproject" -TargetName "Web Server" -ComponentFileName "WebApp.gcomp" -usemonitor:$usemonitor

Write-Host "Build MachineLearning project"
Invoke-NXGBuildApplication -ProjectDirectory ".\MachineLearning" -ProjectFileName "MachineLearning.lvproject" -TargetName "Web Server" -ComponentFileName "WebApp.gcomp" -usemonitor:$usemonitor

Write-Host "Build Plotly project"
Invoke-NXGBuildApplication -ProjectDirectory ".\Plotly" -ProjectFileName "Plotly.lvproject" -TargetName "Web Server" -ComponentFileName "WebApp.gcomp" -usemonitor:$usemonitor

Write-Host "Build PlotToolDemo project"
Invoke-NXGBuildApplication -ProjectDirectory ".\PlotToolDemo" -ProjectFileName "PlotToolDemo.lvproject" -TargetName "Web Server" -ComponentFileName "WebApp.gcomp" -usemonitor:$usemonitor

Write-Host "Build RichText project"
Invoke-NXGBuildApplication -ProjectDirectory ".\RichText" -ProjectFileName "RichText.lvproject" -TargetName "Web Server" -ComponentFileName "WebApp.gcomp" -usemonitor:$usemonitor

Write-Host "Build SelectElement project"
Invoke-NXGBuildApplication -ProjectDirectory ".\SelectElement" -ProjectFileName "SelectElement.lvproject" -TargetName "Web Server" -ComponentFileName "WebApp.gcomp" -usemonitor:$usemonitor

Write-Host "Build SweetAlert project"
Invoke-NXGBuildApplication -ProjectDirectory ".\SweetAlert" -ProjectFileName "SweetAlert.lvproject" -TargetName "Web Server" -ComponentFileName "WebApp.gcomp" -usemonitor:$usemonitor

Write-Host "Build VideoJS project"
Invoke-NXGBuildApplication -ProjectDirectory ".\VideoJS" -ProjectFileName "VideoJS.lvproject" -TargetName "Web Server" -ComponentFileName "WebApp.gcomp" -usemonitor:$usemonitor

Write-Host "Build WebAudio project"
Invoke-NXGBuildApplication -ProjectDirectory ".\WebAudio" -ProjectFileName "WebAudio.lvproject" -TargetName "Web Server" -ComponentFileName "WebApp.gcomp" -usemonitor:$usemonitor

Write-Host "Build WebBluetooth project"
Invoke-NXGBuildApplication -ProjectDirectory ".\WebBluetooth" -ProjectFileName "WebBluetooth.lvproject" -TargetName "Web Server" -ComponentFileName "WebApp.gcomp" -usemonitor:$usemonitor

Write-Host "Build WebVINode project"
Invoke-NXGBuildApplication -ProjectDirectory ".\WebVINode" -ProjectFileName "WebVINode.lvproject" -TargetName "Web Server" -ComponentFileName "ExpressExample.gcomp" -usemonitor:$usemonitor
Invoke-NXGBuildApplication -ProjectDirectory ".\WebVINode" -ProjectFileName "WebVINode.lvproject" -TargetName "Web Server" -ComponentFileName "ExpressUI.gcomp" -usemonitor:$usemonitor
