# Order is significant
Import-Module -Name "$PSScriptRoot\EditorTools" -Verbose -Force
Import-Module -Name "$PSScriptRoot\SharedTools" -Verbose -Force

$ghpagesbuilddir = ".\ghpagesbuild"
$ghpagesarchivedir = ".\ghpagesarchive"

$7zip = "$Env:Programfiles\7-Zip\7z.exe"
Write-Host "Checking if 7zip is already installed"
if ([System.IO.File]::Exists($7zip))
{
    Write-Host "7zip already installed"
}
else
{
    Write-Host "Installing 7zip"
    choco install -y 7zip
    Write-Host "7zip installed"
}

Write-Host "Setting up ghpages output folder"
Remove-Item $ghpagesbuilddir -Recurse -Force -ErrorAction SilentlyContinue -ErrorVariable err
Write-Host $err
New-Item -Name $ghpagesbuilddir -ItemType directory | Out-Null

Write-Host "Copying GitHubPagesRoot contents to ghpages output folder"
Get-ChildItem ".\BuildTools\GitHubPagesRoot\*" | ForEach-Object {
    Copy-Item $_.FullName "$ghpagesbuilddir" -Recurse
}

Write-Host "Copy Arcade projects: Avalanche build to ghpages output folder"
Invoke-CopyBuildOutput -ProjectDirectory ".\Arcade\Avalanche" -TargetName "Default Web Server" -ComponentFileName "WebApp.gcomp" -TargetDirectory "$ghpagesbuilddir\Avalanche"

Write-Host "Copy Arcade projects: CityInBottle build to ghpages output folder"
Invoke-CopyBuildOutput -ProjectDirectory ".\Arcade\CityInBottle" -TargetName "Default Web Server" -ComponentFileName "WebApp.gcomp" -TargetDirectory "$ghpagesbuilddir\CityInBottle"

Write-Host "Copy Arcade projects: DigitalClock build to ghpages output folder"
Invoke-CopyBuildOutput -ProjectDirectory ".\Arcade\DigitalClock" -TargetName "Default Web Server" -ComponentFileName "WebApp.gcomp" -TargetDirectory "$ghpagesbuilddir\DigitalClock"

Write-Host "Copy Arcade projects: DrEmoji build to ghpages output folder"
Invoke-CopyBuildOutput -ProjectDirectory ".\Arcade\DrEmoji" -TargetName "Default Web Server" -ComponentFileName "WebApp.gcomp" -TargetDirectory "$ghpagesbuilddir\DrEmoji"

Write-Host "Copy Arcade projects: Fire build to ghpages output folder"
Invoke-CopyBuildOutput -ProjectDirectory ".\Arcade\Fire" -TargetName "Default Web Server" -ComponentFileName "Application.gcomp" -TargetDirectory "$ghpagesbuilddir\build\Fire"

Write-Host "Copy Arcade projects: Fire build to ghpages output folder duplicate"
Invoke-CopyBuildOutput -ProjectDirectory ".\Arcade\Fire" -TargetName "Default Web Server" -ComponentFileName "Application.gcomp" -TargetDirectory "$ghpagesbuilddir\build\FireAgain"

Write-Host "Copy Arcade projects: NICCC build to ghpages output folder"
Invoke-CopyBuildOutput -ProjectDirectory ".\Arcade\NICCC" -TargetName "Default Web Server" -ComponentFileName "WebApp.gcomp" -TargetDirectory "$ghpagesbuilddir\NICCC"

Write-Host "Copy Arcade projects: Reflex build to ghpages output folder"
Invoke-CopyBuildOutput -ProjectDirectory ".\Arcade\Reflex" -TargetName "Default Web Server" -ComponentFileName "WebApp.gcomp" -TargetDirectory "$ghpagesbuilddir\Reflex"

# TODO ShootStar

Write-Host "Copy Arcade projects: Snake build to ghpages output folder"
Invoke-CopyBuildOutput -ProjectDirectory ".\Arcade\Snake" -TargetName "Default Web Server" -ComponentFileName "WebApp.gcomp" -TargetDirectory "$ghpagesbuilddir\Snake"

# TODO Snek

Write-Host "Copy Bootstrap build to ghpages output folder"
Invoke-CopyBuildOutput -ProjectDirectory ".\Bootstrap" -TargetName "Default Web Server" -ComponentFileName "WebApp.gcomp" -TargetDirectory "$ghpagesbuilddir\Bootstrap"

Write-Host "Copy ControlExtensions build to ghpages output folder"
Invoke-CopyBuildOutput -ProjectDirectory ".\ControlExtensions" -TargetName "Default Web Server" -ComponentFileName "WebApp.gcomp" -TargetDirectory "$ghpagesbuilddir\ControlExtensions"

Write-Host "Copy Demo projects: PlotTool build to ghpages output folder"
Invoke-CopyBuildOutput -ProjectDirectory ".\Demos\PlotTool" -TargetName "Default Web Server" -ComponentFileName "WebApp.gcomp" -TargetDirectory "$ghpagesbuilddir\PlotToolDemo"

Write-Host "Copy ECharts build to ghpages output folder"
Invoke-CopyBuildOutput -ProjectDirectory ".\File" -TargetName "Default Web Server" -ComponentFileName "WebApp.gcomp" -TargetDirectory "$ghpagesbuilddir\File"

Write-Host "Copy File SystemLink build to ghpages output folder"
Invoke-CopyBuildOutput -ProjectDirectory ".\File" -TargetName "Default Web Server" -ComponentFileName "WebAppSystemLink.gcomp" -TargetDirectory "$ghpagesbuilddir\FileSystemLink"

Write-Host "Copy GoogleCharts build to ghpages output folder"
Invoke-CopyBuildOutput -ProjectDirectory ".\GoogleCharts" -TargetName "Default Web Server" -ComponentFileName "WebApp.gcomp" -TargetDirectory "$ghpagesbuilddir\GoogleCharts"

Write-Host "Copy IFrame build to ghpages output folder"
Invoke-CopyBuildOutput -ProjectDirectory ".\IFrame" -TargetName "Default Web Server" -ComponentFileName "WebApp.gcomp" -TargetDirectory "$ghpagesbuilddir\IFrame"

Write-Host "Copy ImmersiveWeb projects: AugmentedReality build to ghpages output folder"
Invoke-CopyBuildOutput -ProjectDirectory ".\ImmersiveWeb" -TargetName "Default Web Server" -ComponentFileName "WebApp.gcomp" -TargetDirectory "$ghpagesbuilddir\AugmentedReality"

Write-Host "Copy ImmersiveWeb projects: HardwareDashboard build to ghpages output folder"
Invoke-CopyBuildOutput -ProjectDirectory ".\ImmersiveWeb" -TargetName "Default Web Server" -ComponentFileName "HardwareDashboard.gcomp" -TargetDirectory "$ghpagesbuilddir\HardwareDashboard"

Write-Host "Copy ImmersiveWeb projects: SecretBox build to ghpages output folder"
Invoke-CopyBuildOutput -ProjectDirectory ".\ImmersiveWeb" -TargetName "Default Web Server" -ComponentFileName "SecretBox.gcomp" -TargetDirectory "$ghpagesbuilddir\AugmentedRealitySecretBox"

Write-Host "Copy ImmersiveWeb projects: VirtualReality build to ghpages output folder"
Invoke-CopyBuildOutput -ProjectDirectory ".\ImmersiveWeb" -TargetName "Default Web Server" -ComponentFileName "VirtualReality.gcomp" -TargetDirectory "$ghpagesbuilddir\VirtualReality"

# TODO InputElement
# TODO IntegrationTest

Write-Host "Copy MachineLearning build to ghpages output folder"
Invoke-CopyBuildOutput -ProjectDirectory ".\MachineLearning" -TargetName "Default Web Server" -ComponentFileName "WebApp.gcomp" -TargetDirectory "$ghpagesbuilddir\MachineLearning"

Write-Host "Copy Map build to ghpages output folder"
Invoke-CopyBuildOutput -ProjectDirectory ".\Map" -TargetName "Default Web Server" -ComponentFileName "WebApp.gcomp" -TargetDirectory "$ghpagesbuilddir\Leaflet"

Write-Host "Copy Perspective build to ghpages output folder"
Invoke-CopyBuildOutput -ProjectDirectory ".\Perspective" -TargetName "Default Web Server" -ComponentFileName "WebApp.gcomp" -TargetDirectory "$ghpagesbuilddir\Perspective"

Write-Host "Copy Plotly build to ghpages output folder"
Invoke-CopyBuildOutput -ProjectDirectory ".\Plotly" -TargetName "Default Web Server" -ComponentFileName "WebApp.gcomp" -TargetDirectory "$ghpagesbuilddir\Plotly"

# TODO Prerender
# TODO ProgressiveWebApp

Write-Host "Copy RichText build to ghpages output folder"
Invoke-CopyBuildOutput -ProjectDirectory ".\RichText" -TargetName "Default Web Server" -ComponentFileName "WebApp.gcomp" -TargetDirectory "$ghpagesbuilddir\RichText"

Write-Host "Copy SelectElement build to ghpages output folder"
Invoke-CopyBuildOutput -ProjectDirectory ".\SelectElement" -TargetName "Default Web Server" -ComponentFileName "WebApp.gcomp" -TargetDirectory "$ghpagesbuilddir\SelectElement"

# TODO SetAttribute
# TODO SetInnerHtml

Write-Host "Copy SweetAlert build to ghpages output folder"
Invoke-CopyBuildOutput -ProjectDirectory ".\SweetAlert" -TargetName "Default Web Server" -ComponentFileName "WebApp.gcomp" -TargetDirectory "$ghpagesbuilddir\SweetAlert"

Write-Host "Copy SynchronousImage build to ghpages output folder"
Invoke-CopyBuildOutput -ProjectDirectory ".\SynchronousImage" -TargetName "Default Web Server" -ComponentFileName "WebApp.gcomp" -TargetDirectory "$ghpagesbuilddir\SynchronousImage"

Write-Host "Copy URL build to ghpages output folder"
Invoke-CopyBuildOutput -ProjectDirectory ".\URL" -TargetName "Default Web Server" -ComponentFileName "WebApp.gcomp" -TargetDirectory "$ghpagesbuilddir\URL"

Write-Host "Copy VideoElement build to ghpages output folder"
Invoke-CopyBuildOutput -ProjectDirectory ".\VideoElement" -TargetName "Default Web Server" -ComponentFileName "WebApp.gcomp" -TargetDirectory "$ghpagesbuilddir\VideoElement"

Write-Host "Copy VideoJS build to ghpages output folder"
Invoke-CopyBuildOutput -ProjectDirectory ".\VideoJS" -TargetName "Default Web Server" -ComponentFileName "WebApp.gcomp" -TargetDirectory "$ghpagesbuilddir\VideoJS"

Write-Host "Copy WebAudio build to ghpages output folder"
Invoke-CopyBuildOutput -ProjectDirectory ".\WebAudio" -TargetName "Default Web Server" -ComponentFileName "WebApp.gcomp" -TargetDirectory "$ghpagesbuilddir\WebAudio"

Write-Host "Copy WebBluetooth build to ghpages output folder"
Invoke-CopyBuildOutput -ProjectDirectory ".\WebBluetooth" -TargetName "Default Web Server" -ComponentFileName "WebApp.gcomp" -TargetDirectory "$ghpagesbuilddir\WebBluetooth"
Invoke-CopyBuildOutput -ProjectDirectory ".\ECharts" -TargetName "Default Web Server" -ComponentFileName "WebApp.gcomp" -TargetDirectory "$ghpagesbuilddir\ECharts"

# TODO EventTarget

Write-Host "Copy Exorbitant build to ghpages output folder"
Invoke-CopyBuildOutput -ProjectDirectory ".\Exorbitant" -TargetName "Default Web Server" -ComponentFileName "WebApp.gcomp" -TargetDirectory "$ghpagesbuilddir\Exorbitant"

Write-Host "Copy File build to ghpages output folder"

# TODO WebVIDebugger

Write-Host "Setting up ghpages archive output folder"
Remove-Item $ghpagesarchivedir -Recurse -Force -ErrorAction SilentlyContinue -ErrorVariable err
Write-Host $err
New-Item -Name $ghpagesarchivedir -ItemType directory | Out-Null

Write-Host "Creating archive of all build output"
Invoke-Run $7zip "a $(Resolve-Path $ghpagesarchivedir)\ghpages.zip" "$(Resolve-Path $ghpagesbuilddir)"

Write-Host "Done! :D"
