. .\AzurePipelines\shared.ps1

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
New-Item -Name "$ghpagesbuilddir\AugmentedReality" -ItemType directory | Out-Null
Get-ChildItem ".\AugmentedReality\Builds\WebApp_Web Server\*" | ForEach-Object {
    Copy-Item $_.FullName "$ghpagesbuilddir\AugmentedReality" -Recurse
}

Write-Host "Copy Fire project build to ghpages output folder"
New-Item -Name "$ghpagesbuilddir\Fire" -ItemType directory | Out-Null
Get-ChildItem ".\Fire\Builds\Application_Web Server\*" | ForEach-Object {
    Copy-Item $_.FullName "$ghpagesbuilddir\Fire" -Recurse
}

Write-Host "Copy Express build to ghpages output folder"
New-Item -Name "$ghpagesbuilddir\Express" -ItemType directory | Out-Null
Get-ChildItem ".\Express\Builds\WebApp_Web Server\*" | ForEach-Object {
    Copy-Item $_.FullName "$ghpagesbuilddir\Express" -Recurse
}

Write-Host "Creating archive of all build output"
Run $7zip "a ghpages.zip ." .\ghpagesbuild

Write-Host "Done! :D"
