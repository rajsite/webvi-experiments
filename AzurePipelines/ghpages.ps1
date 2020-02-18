Import-Module -Name "$PSScriptRoot\NXGBuildTools" -Verbose -Force

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
Get-ChildItem ".\AzurePipelines\GitHubPagesRoot\*" | ForEach-Object {
    Copy-Item $_.FullName "$ghpagesbuilddir" -Recurse
}

Write-Host "Copy Arcade projects: Avalanche build to ghpages output folder"
Invoke-CopyBuildOutput -ProjectDirectory ".\Arcade\Avalanche\nxg" -TargetName "Web Server" -ComponentFileName "WebApp.gcomp" -TargetDirectory "$ghpagesbuilddir\Avalanche"

Write-Host "Copy Arcade projects: DrEmoji build to ghpages output folder"
Invoke-CopyBuildOutput -ProjectDirectory ".\Arcade\DrEmoji\nxg" -TargetName "Web Server" -ComponentFileName "WebApp.gcomp" -TargetDirectory "$ghpagesbuilddir\DrEmoji"

Write-Host "Copy Arcade projects: Fire build to ghpages output folder"
Invoke-CopyBuildOutput -ProjectDirectory ".\Arcade\Fire" -TargetName "Web Server" -ComponentFileName "Application.gcomp" -TargetDirectory "$ghpagesbuilddir\build\Fire"

Write-Host "Copy Arcade projects: Fire build to ghpages output folder duplicate"
Invoke-CopyBuildOutput -ProjectDirectory ".\Arcade\Fire" -TargetName "Web Server" -ComponentFileName "Application.gcomp" -TargetDirectory "$ghpagesbuilddir\build\FireAgain"

Write-Host "Copy Arcade projects: Reflex build to ghpages output folder"
Invoke-CopyBuildOutput -ProjectDirectory ".\Arcade\Reflex" -TargetName "Web Server" -ComponentFileName "WebApp.gcomp" -TargetDirectory "$ghpagesbuilddir\Reflex"

Write-Host "Copy Arcade projects: Snake build to ghpages output folder"
Invoke-CopyBuildOutput -ProjectDirectory ".\Arcade\Snake\nxg" -TargetName "Web Server" -ComponentFileName "WebApp.gcomp" -TargetDirectory "$ghpagesbuilddir\Snake"

Write-Host "Copy BusyState build to ghpages output folder"
Invoke-CopyBuildOutput -ProjectDirectory ".\BusyState" -TargetName "Web Server" -ComponentFileName "WebApp.gcomp" -TargetDirectory "$ghpagesbuilddir\BusyState"

Write-Host "Copy ECharts build to ghpages output folder"
Invoke-CopyBuildOutput -ProjectDirectory ".\ECharts" -TargetName "Web Server" -ComponentFileName "WebApp.gcomp" -TargetDirectory "$ghpagesbuilddir\ECharts"

Write-Host "Copy ImmersiveWeb projects: AugmentedReality build to ghpages output folder"
Invoke-CopyBuildOutput -ProjectDirectory ".\ImmersiveWeb" -TargetName "Web Server" -ComponentFileName "WebApp.gcomp" -TargetDirectory "$ghpagesbuilddir\AugmentedReality"

Write-Host "Copy ImmersiveWeb projects: HardwareDashboard build to ghpages output folder"
Invoke-CopyBuildOutput -ProjectDirectory ".\ImmersiveWeb" -TargetName "Web Server" -ComponentFileName "HardwareDashboard.gcomp" -TargetDirectory "$ghpagesbuilddir\HardwareDashboard"

Write-Host "Copy ImmersiveWeb projects: SecretBox build to ghpages output folder"
Invoke-CopyBuildOutput -ProjectDirectory ".\ImmersiveWeb" -TargetName "Web Server" -ComponentFileName "SecretBox.gcomp" -TargetDirectory "$ghpagesbuilddir\AugmentedRealitySecretBox"

Write-Host "Copy ImmersiveWeb projects: VirtualReality build to ghpages output folder"
Invoke-CopyBuildOutput -ProjectDirectory ".\ImmersiveWeb" -TargetName "Web Server" -ComponentFileName "VirtualReality.gcomp" -TargetDirectory "$ghpagesbuilddir\VirtualReality"

Write-Host "Copy JSONParser build to ghpages output folder"
Invoke-CopyBuildOutput -ProjectDirectory ".\JSONParser" -TargetName "Web Server" -ComponentFileName "WebApp.gcomp" -TargetDirectory "$ghpagesbuilddir\JSONParser"

Write-Host "Copy Leaflet build to ghpages output folder"
Invoke-CopyBuildOutput -ProjectDirectory ".\Leaflet" -TargetName "Web Server" -ComponentFileName "WebApp.gcomp" -TargetDirectory "$ghpagesbuilddir\Leaflet"

Write-Host "Copy MachineLearning build to ghpages output folder"
Invoke-CopyBuildOutput -ProjectDirectory ".\MachineLearning" -TargetName "Web Server" -ComponentFileName "WebApp.gcomp" -TargetDirectory "$ghpagesbuilddir\MachineLearning"

Write-Host "Copy RichText build to ghpages output folder"
Invoke-CopyBuildOutput -ProjectDirectory ".\RichText" -TargetName "Web Server" -ComponentFileName "WebApp.gcomp" -TargetDirectory "$ghpagesbuilddir\RichText"

Write-Host "Copy SweetAlert build to ghpages output folder"
Invoke-CopyBuildOutput -ProjectDirectory ".\SweetAlert" -TargetName "Web Server" -ComponentFileName "WebApp.gcomp" -TargetDirectory "$ghpagesbuilddir\SweetAlert"

Write-Host "Copy WebBluetooth build to ghpages output folder"
Invoke-CopyBuildOutput -ProjectDirectory ".\WebBluetooth" -TargetName "Web Server" -ComponentFileName "WebApp.gcomp" -TargetDirectory "$ghpagesbuilddir\WebBluetooth"

Write-Host "Copy WebVINode build to ghpages output folder"
Invoke-CopyBuildOutput -ProjectDirectory ".\WebVINode" -TargetName "express" -ComponentFileName "TestExpressServer.gcomp" -TargetDirectory "$ghpagesbuilddir\WebVINode\Builds\TestExpressServer_express"
Invoke-CopyBuildOutput -ProjectDirectory ".\WebVINode" -TargetName "express" -ComponentFileName "TestExpressClient.gcomp" -TargetDirectory "$ghpagesbuilddir\WebVINode\Builds\TestExpressClient_express"
Copy-item -Force -Recurse ".\WebVINode\packages" -Destination "$ghpagesbuilddir\WebVINode\packages"
Copy-Item ".\WebVINode\package.json" "$ghpagesbuilddir\WebVINode\package.json"
Copy-Item ".\WebVINode\package-lock.json" "$ghpagesbuilddir\WebVINode\package-lock.json"

Write-Host "Setting up ghpages archive output folder"
Remove-Item $ghpagesarchivedir -Recurse -Force -ErrorAction SilentlyContinue -ErrorVariable err
Write-Host $err
New-Item -Name $ghpagesarchivedir -ItemType directory | Out-Null

Write-Host "Creating archive of all build output"
Run $7zip "a $(Resolve-Path $ghpagesarchivedir)\ghpages.zip" "$(Resolve-Path $ghpagesbuilddir)"

Write-Host "Done! :D"
