. .\AzurePipelines\shared.ps1

Write-Output "Current directory $((Get-Location).Path)"

Write-Output "Checking if LabVIEW NXG CLI is available"
$labviewnxgcli = 'C:\Program Files\National Instruments\LabVIEW NXG 3.0\labviewnxgcli.exe'
Assert-FileExists($labviewnxgcli)

Write-Output "Setting up ghpages output folder"
$ghpagesbuilddir = ".\ghpagesbuild"
Remove-Item $ghpagesbuilddir -Recurse -Force -ErrorAction SilentlyContinue -ErrorVariable err
Write-Output $err
New-Item -Name $ghpagesbuilddir -ItemType directory | Out-Null

Write-Output "Start building projects"

Write-Output "Build Fire project"
Watch-TrialWindow
Run $labviewnxgcli 'build-application -n Application.gcomp -t "Web Server" -p ".\Fire\LabVIEW PSX Doom Fire.lvproject"'
Write-Output "Copy Fire project build to ghpages output folder"
New-Item -Name "$ghpagesbuilddir\Fire" -ItemType directory | Out-Null
Get-ChildItem ".\Fire\Builds\Application_Web Server\*" | ForEach-Object {
    Move-Item $_.FullName "$ghpagesbuilddir\Fire"
}

Write-Output "Creating archive of all build output"
Compress-Archive -Path $ghpagesbuilddir\* -DestinationPath "$ghpagesbuilddir\ghpages"

Write-Output "Done! :D"
