$ErrorActionPreference = 'Stop'
$backupDirectory = Join-Path $PSScriptRoot '../.local/backups'
New-Item -ItemType Directory -Force -Path $backupDirectory | Out-Null
$backupStamp = Get-Date -Format 'yyyyMMdd-HHmmss'
docker compose exec -T mongo mongodump --archive=/tmp/everlang-mongo.archive --gzip
if ($LASTEXITCODE -ne 0) { throw 'Mongo backup failed' }
docker compose cp mongo:/tmp/everlang-mongo.archive (Join-Path $backupDirectory "$backupStamp-mongo.archive")
if ($LASTEXITCODE -ne 0) { throw 'Mongo copy failed' }
docker compose exec -T postgres pg_dump -U everlang -d everlang -Fc -f /tmp/everlang-postgres.dump
if ($LASTEXITCODE -ne 0) { throw 'PostgreSQL backup failed' }
docker compose cp postgres:/tmp/everlang-postgres.dump (Join-Path $backupDirectory "$backupStamp-postgres.dump")
if ($LASTEXITCODE -ne 0) { throw 'PostgreSQL copy failed' }
Write-Output "Backups saved under .local/backups ($backupStamp). Keep these private."
