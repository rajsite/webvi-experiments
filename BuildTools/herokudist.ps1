# Order is significant
Import-Module -Name "$PSScriptRoot\EditorTools" -Verbose -Force
Import-Module -Name "$PSScriptRoot\SharedTools" -Verbose -Force

$herokudistbuilddir = ".\herokudistbuild"
$herokudistarchivedir = ".\herokudistarchive"

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

Write-Host "Setting up herokudist output folder"
Remove-Item $herokudistbuilddir -Recurse -Force -ErrorAction SilentlyContinue -ErrorVariable err
Write-Host $err
New-Item -Name $herokudistbuilddir -ItemType directory | Out-Null

Write-Host "Copying HerokuDistRoot contents to herokudist output folder"
Get-ChildItem ".\BuildTools\HerokuDistRoot\*" | ForEach-Object {
    Copy-Item $_.FullName "$herokudistbuilddir" -Recurse
}

Write-Host "Copy WebVINode build to herokudist output folder"
Copy-item -Force -Recurse ".\WebVINode\examples\webvinode-express-example" -Destination "$herokudistbuilddir\WebVINode\examples\webvinode-express-example"
Copy-item -Force -Recurse ".\WebVINode\packages\@webvi-node\cli" -Destination "$herokudistbuilddir\WebVINode\packages\@webvi-node\cli"
Copy-item -Force -Recurse ".\WebVINode\packages\@webvi-node\express" -Destination "$herokudistbuilddir\WebVINode\packages\@webvi-node\express"
Copy-item -Force -Recurse ".\WebVINode\packages\@webvi-node\fs" -Destination "$herokudistbuilddir\WebVINode\packages\@webvi-node\fs"
Copy-item -Force -Recurse ".\WebVINode\packages\@webvi-node\html-require" -Destination "$herokudistbuilddir\WebVINode\packages\@webvi-node\html-require"
Copy-item -Force -Recurse ".\WebVINode\packages\@webvi-node\path" -Destination "$herokudistbuilddir\WebVINode\packages\@webvi-node\path"
Copy-item -Force -Recurse ".\WebVINode\packages\@webvi-node\runner" -Destination "$herokudistbuilddir\WebVINode\packages\@webvi-node\runner"
Copy-item -Force -Recurse ".\WebVINode\packages\@webvi-node\vireo" -Destination "$herokudistbuilddir\WebVINode\packages\@webvi-node\vireo"
Invoke-CopyBuildOutput -ProjectDirectory ".\WebVINode" -TargetName "Default Web Server" -ComponentFileName "ExpressExample.gcomp" -TargetDirectory "$herokudistbuilddir\WebVINode\examples\webvinode-express-example\Builds\ExpressExample_Default Web Server"
Invoke-CopyBuildOutput -ProjectDirectory ".\WebVINode" -TargetName "Default Web Server" -ComponentFileName "ExpressUI.gcomp" -TargetDirectory "$herokudistbuilddir\WebVINode\examples\webvinode-express-example\Builds\ExpressUI_Default Web Server"
Copy-Item ".\WebVINode\package.json" "$herokudistbuilddir\WebVINode\package.json"

Write-Host "Setting up herokudist archive output folder"
Remove-Item $herokudistarchivedir -Recurse -Force -ErrorAction SilentlyContinue -ErrorVariable err
Write-Host $err
New-Item -Name $herokudistarchivedir -ItemType directory | Out-Null

Write-Host "Creating archive of all build output"
Invoke-Run $7zip "a $(Resolve-Path $herokudistarchivedir)\herokudist.zip" "$(Resolve-Path $herokudistbuilddir)"

Write-Host "Done! :D"
