. .\AzurePipelines\shared.ps1

$ghpagesbuilddir = ".\ghpagesbuild"

$7zip = "C:\Program Files\7-Zip\7z.exe"
Write-Output "Checking if 7zip is already installed"
if ([System.IO.File]::Exists($7zip))
{
    Write-Output "7zip already installed"
}
else
{
    Write-Output "Installing 7zip"
    choco install -y 7zip
    Write-Output "7zip installed"
}

Write-Output "Setting up ghpages output folder"
Remove-Item $ghpagesbuilddir -Recurse -Force -ErrorAction SilentlyContinue -ErrorVariable err
Write-Output $err
New-Item -Name $ghpagesbuilddir -ItemType directory | Out-Null

Write-Ouput "Creating GitHub Pages README"
Copy-Item .\README.ghpages.md "$ghpagesbuilddir\README.md"

Write-Output "Copy Fire project build to ghpages output folder"
New-Item -Name "$ghpagesbuilddir\Fire" -ItemType directory | Out-Null
Get-ChildItem ".\Fire\Builds\Application_Web Server\*" | ForEach-Object {
    Copy-Item $_.FullName "$ghpagesbuilddir\Fire" -Recurse
}

Write-Output "Creating archive of all build output"
Run $7zip "a ghpages.zip ." .\ghpagesbuild

Write-Output "Done! :D"
