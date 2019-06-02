Import-Module -Name "$PSScriptRoot\NXGBuildTools" -Verbose -Force

$ghpagesbuilddir = ".\ghpagesbuild"

$7zip = "C:\Program Files\7-Zip\7z.exe"
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

Write-Host "Copy AugmentedReality build to ghpages output folder"
Invoke-CopyBuildOutput -ProjectDirectory ".\AugmentedReality" -TargetName "Web Server" -ComponentFileName "WebApp.gcomp" -TargetDirectory "$ghpagesbuilddir\AugmentedReality"

Write-Host "Copy Fire build to ghpages output folder"
Invoke-CopyBuildOutput -ProjectDirectory ".\Fire" -TargetName "Web Server" -ComponentFileName "Application.gcomp" -TargetDirectory "$ghpagesbuilddir\Fire"

Write-Host "Copy Express build to ghpages output folder"
Invoke-CopyBuildOutput -ProjectDirectory ".\Express" -TargetName "Web Server" -ComponentFileName "WebApp.gcomp" -TargetDirectory "$ghpagesbuilddir\Express"


Write-Host "Creating archive of all build output"
Run $7zip "a ghpages.zip ." .\ghpagesbuild

Write-Host "Done! :D"
