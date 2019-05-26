# The chocolately rsync requires custom paths so the pages provider still fails https://itefix.net/content/rsync-does-not-recognize-windows-paths-correct-manner
# Write-Host "Installing rsync"
# choco install -y rsync

Write-Host "Installing dpl"
gem install dpl
