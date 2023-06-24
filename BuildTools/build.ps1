Import-Module -Name "$PSScriptRoot\EditorTools" -Verbose -Force

Write-Host "Build Arcade projects: Avalanche"
Invoke-BuildApplication -ProjectDirectory ".\Arcade\Avalanche" -ProjectFileName "Avalanche.gwebproject" -TargetName "Default Web Server" -ComponentFileName "WebApp.gcomp"

Write-Host "Build Arcade projects: DigitalClock"
Invoke-BuildApplication -ProjectDirectory ".\Arcade\DigitalClock" -ProjectFileName "DigitalClock.gwebproject" -TargetName "Default Web Server" -ComponentFileName "WebApp.gcomp"

Write-Host "Build Arcade projects: DrEmoji"
Invoke-BuildApplication -ProjectDirectory ".\Arcade\DrEmoji" -ProjectFileName "DrEmoji.gwebproject" -TargetName "Default Web Server" -ComponentFileName "WebApp.gcomp"

Write-Host "Build Arcade projects: Fire"
Invoke-BuildApplication -ProjectDirectory ".\Arcade\Fire" -ProjectFileName "LabVIEW PSX Doom Fire.gwebproject" -TargetName "Default Web Server" -ComponentFileName "Application.gcomp"

Write-Host "Build Arcade projects: NICCC"
Invoke-BuildApplication -ProjectDirectory ".\Arcade\NICCC" -ProjectFileName "NICCC.gwebproject" -TargetName "Default Web Server" -ComponentFileName "WebApp.gcomp"

Write-Host "Build Arcade projects: Reflex"
Invoke-BuildApplication -ProjectDirectory ".\Arcade\Reflex" -ProjectFileName "Reflex.gwebproject" -TargetName "Default Web Server" -ComponentFileName "WebApp.gcomp"

# TODO ShootStar

Write-Host "Build Arcade projects: Snake"
Invoke-BuildApplication -ProjectDirectory ".\Arcade\Snake" -ProjectFileName "Snake.gwebproject" -TargetName "Default Web Server" -ComponentFileName "WebApp.gcomp"

# TODO Snek

Write-Host "Build Bootstrap project"
Invoke-BuildApplication -ProjectDirectory ".\Bootstrap" -ProjectFileName "Bootstrap.gwebproject" -TargetName "Default Web Server" -ComponentFileName "WebApp.gcomp"

Write-Host "Build ControlExtensions project"
Invoke-BuildApplication -ProjectDirectory ".\ControlExtensions" -ProjectFileName "ControlExtensions.gwebproject" -TargetName "Default Web Server" -ComponentFileName "WebApp.gcomp"

Write-Host "Build ControlTools project"
Invoke-BuildApplication -ProjectDirectory ".\ControlTools" -ProjectFileName "ControlTools.gwebproject" -TargetName "Default Web Server" -ComponentFileName "WebApp.gcomp"

Write-Host "Build DeclarativeStyle project"
Invoke-BuildApplication -ProjectDirectory ".\DeclarativeStyle" -ProjectFileName "DeclarativeStyle.gwebproject" -TargetName "Default Web Server" -ComponentFileName "WebApp.gcomp"

Write-Host "Build ECharts project"
Invoke-BuildApplication -ProjectDirectory ".\ECharts" -ProjectFileName "ECharts.gwebproject" -TargetName "Default Web Server" -ComponentFileName "WebApp.gcomp"

# TODO EventTarget

Write-Host "Build Exorbitant project"
Invoke-BuildApplication -ProjectDirectory ".\Exorbitant" -ProjectFileName "Exorbitant.gwebproject" -TargetName "Default Web Server" -ComponentFileName "WebApp.gcomp"

Write-Host "Build File project"
Invoke-BuildApplication -ProjectDirectory ".\File" -ProjectFileName "File.gwebproject" -TargetName "Default Web Server" -ComponentFileName "WebApp.gcomp"

Write-Host "Build File SystemLink project"
Invoke-BuildApplication -ProjectDirectory ".\File" -ProjectFileName "File.gwebproject" -TargetName "Default Web Server" -ComponentFileName "WebAppSystemLink.gcomp"

Write-Host "Build GoogleCharts project"
Invoke-BuildApplication -ProjectDirectory ".\GoogleCharts" -ProjectFileName "GoogleCharts.gwebproject" -TargetName "Default Web Server" -ComponentFileName "WebApp.gcomp"

Write-Host "Build IFrame project"
Invoke-BuildApplication -ProjectDirectory ".\IFrame" -ProjectFileName "IFrame.gwebproject" -TargetName "Default Web Server" -ComponentFileName "WebApp.gcomp"

Write-Host "Build ImmersiveWeb projects: AugmentedReality"
Invoke-BuildApplication -ProjectDirectory ".\ImmersiveWeb" -ProjectFileName "ImmersiveWeb.gwebproject" -TargetName "Default Web Server" -ComponentFileName "WebApp.gcomp"

Write-Host "Build ImmersiveWeb projects: HardwareDashboard"
Invoke-BuildApplication -ProjectDirectory ".\ImmersiveWeb" -ProjectFileName "ImmersiveWeb.gwebproject" -TargetName "Default Web Server" -ComponentFileName "HardwareDashboard.gcomp"

Write-Host "Build ImmersiveWeb projects: SecretBox"
Invoke-BuildApplication -ProjectDirectory ".\ImmersiveWeb" -ProjectFileName "ImmersiveWeb.gwebproject" -TargetName "Default Web Server" -ComponentFileName "SecretBox.gcomp"

Write-Host "Build ImmersiveWeb projects: VirtualReality"
Invoke-BuildApplication -ProjectDirectory ".\ImmersiveWeb" -ProjectFileName "ImmersiveWeb.gwebproject" -TargetName "Default Web Server" -ComponentFileName "VirtualReality.gcomp"

# TODO InputElement
# TODO IntegrationTest

Write-Host "Build MachineLearning project"
Invoke-BuildApplication -ProjectDirectory ".\MachineLearning" -ProjectFileName "MachineLearning.gwebproject" -TargetName "Default Web Server" -ComponentFileName "WebApp.gcomp"

Write-Host "Build Map project"
Invoke-BuildApplication -ProjectDirectory ".\Map" -ProjectFileName "Map.gwebproject" -TargetName "Default Web Server" -ComponentFileName "WebApp.gcomp"

Write-Host "Build Perspective project"
Invoke-BuildApplication -ProjectDirectory ".\Perspective" -ProjectFileName "Perspective.gwebproject" -TargetName "Default Web Server" -ComponentFileName "WebApp.gcomp"

Write-Host "Build PlotToolDemo project"
Invoke-BuildApplication -ProjectDirectory ".\PlotToolDemo" -ProjectFileName "PlotToolDemo.gwebproject" -TargetName "Default Web Server" -ComponentFileName "WebApp.gcomp"

Write-Host "Build Plotly project"
Invoke-BuildApplication -ProjectDirectory ".\Plotly" -ProjectFileName "Plotly.gwebproject" -TargetName "Default Web Server" -ComponentFileName "WebApp.gcomp"

# TODO Prerender
# TODO ProgressiveWebApp
# TODO RGraph

Write-Host "Build RichText project"
Invoke-BuildApplication -ProjectDirectory ".\RichText" -ProjectFileName "RichText.gwebproject" -TargetName "Default Web Server" -ComponentFileName "WebApp.gcomp"

Write-Host "Build SelectElement project"
Invoke-BuildApplication -ProjectDirectory ".\SelectElement" -ProjectFileName "SelectElement.gwebproject" -TargetName "Default Web Server" -ComponentFileName "WebApp.gcomp"

# TODO SetAttribute
# TODO SetInnerHtml

Write-Host "Build SweetAlert project"
Invoke-BuildApplication -ProjectDirectory ".\SweetAlert" -ProjectFileName "SweetAlert.gwebproject" -TargetName "Default Web Server" -ComponentFileName "WebApp.gcomp"

Write-Host "Build SynchronousImage project"
Invoke-BuildApplication -ProjectDirectory ".\SynchronousImage" -ProjectFileName "SynchronousImage.gwebproject" -TargetName "Default Web Server" -ComponentFileName "WebApp.gcomp"

Write-Host "Build URL project"
Invoke-BuildApplication -ProjectDirectory ".\URL" -ProjectFileName "URL.gwebproject" -TargetName "Default Web Server" -ComponentFileName "WebApp.gcomp"

Write-Host "Build VideoJS project"
Invoke-BuildApplication -ProjectDirectory ".\VideoJS" -ProjectFileName "VideoJS.gwebproject" -TargetName "Default Web Server" -ComponentFileName "WebApp.gcomp"

Write-Host "Build WebAudio project"
Invoke-BuildApplication -ProjectDirectory ".\WebAudio" -ProjectFileName "WebAudio.gwebproject" -TargetName "Default Web Server" -ComponentFileName "WebApp.gcomp"

Write-Host "Build WebBluetooth project"
Invoke-BuildApplication -ProjectDirectory ".\WebBluetooth" -ProjectFileName "WebBluetooth.gwebproject" -TargetName "Default Web Server" -ComponentFileName "WebApp.gcomp"

# TODO WebVIDebugger

Write-Host "Build WebVINode project"
Invoke-BuildApplication -ProjectDirectory ".\WebVINode" -ProjectFileName "WebVINode.gwebproject" -TargetName "Default Web Server" -ComponentFileName "ExpressExample.gcomp"
Invoke-BuildApplication -ProjectDirectory ".\WebVINode" -ProjectFileName "WebVINode.gwebproject" -TargetName "Default Web Server" -ComponentFileName "ExpressUI.gcomp"

Write-Host "Done! :D"
