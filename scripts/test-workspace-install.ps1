#Requires -Version 5.1
[CmdletBinding()]
param([string]$TempRoot = [System.IO.Path]::GetTempPath())

$ErrorActionPreference = 'Stop'
Set-StrictMode -Version Latest
if (-not (Test-Path -LiteralPath $TempRoot -PathType Container)) {
    throw "Temporary parent does not exist: $TempRoot"
}
$sandbox = Join-Path $TempRoot ('opencode-workspace-' + [guid]::NewGuid().ToString('N'))
$installer = Join-Path $PSScriptRoot 'install-workspace.ps1'
$globalInstaller = Join-Path $PSScriptRoot 'install-opencode.ps1'
$workspaces = @()
$globalRoot = $null

function Assert-True([bool]$Condition, [string]$Message) {
    if (-not $Condition) { throw $Message }
}

try {
    New-Item -ItemType Directory -Path $sandbox | Out-Null
    $workspace = Join-Path $sandbox 'workspace with spaces'
    New-Item -ItemType Directory -Path $workspace | Out-Null
    $workspaces += $workspace

    & $installer -WorkspaceRoot $workspace -WhatIf
    Assert-True (-not (Test-Path -LiteralPath (Join-Path $workspace '.opencode'))) 'WhatIf changed the workspace.'

    & $installer -WorkspaceRoot $workspace
    & $installer -WorkspaceRoot $workspace
    foreach ($name in @('agents', 'skills', 'commands', 'instructions')) {
        $link = Get-Item -LiteralPath (Join-Path $workspace ".opencode\$name") -Force
        Assert-True ($link.LinkType -eq 'Junction') "Not a junction: $name"
        $expected = Join-Path (Split-Path -Parent $PSScriptRoot) "src\$name"
        Assert-True ($link.Target[0] -eq $expected) "Wrong target: $name"
    }

    $conflict = Join-Path $sandbox 'conflict'
    New-Item -ItemType Directory -Path (Join-Path $conflict '.opencode\skills') -Force | Out-Null
    $workspaces += $conflict
    $failed = $false
    try { & $installer -WorkspaceRoot $conflict }
    catch { $failed = $_.Exception.Message -like 'Destination already exists*' }
    Assert-True $failed 'Existing real directory was not rejected.'
    Assert-True (Test-Path -LiteralPath (Join-Path $conflict '.opencode\skills')) 'Existing content was removed.'
    Assert-True (-not (Test-Path -LiteralPath (Join-Path $conflict '.opencode\agents'))) 'Preflight created a partial install.'

    $wrongLink = Join-Path $conflict '.opencode\agents'
    New-Item -ItemType Junction -Path $wrongLink -Target $workspace | Out-Null
    $failed = $false
    try { & $installer -WorkspaceRoot $conflict }
    catch { $failed = $_.Exception.Message -like 'Destination already exists*' }
    Assert-True $failed 'Wrong-target junction was not rejected.'

    $failed = $false
    try { & $installer -WorkspaceRoot (Join-Path $sandbox 'missing') }
    catch { $failed = $_.Exception.Message -like 'Workspace directory does not exist*' }
    Assert-True $failed 'Missing workspace was not rejected.'

    $globalRoot = Join-Path $sandbox 'global config\opencode'
    & $globalInstaller -Global -ConfigRoot $globalRoot -WhatIf
    Assert-True (-not (Test-Path -LiteralPath $globalRoot)) 'Global WhatIf changed the filesystem.'
    New-Item -ItemType Directory -Path $globalRoot -Force | Out-Null
    $config = Join-Path $globalRoot 'opencode.json'
    New-Item -ItemType File -Path $config -Value '{"model":"example/preserved"}' | Out-Null
    $before = (Get-FileHash -LiteralPath $config).Hash
    & $globalInstaller -Global -ConfigRoot $globalRoot
    & $globalInstaller -Global -ConfigRoot $globalRoot
    Assert-True ((Get-FileHash -LiteralPath $config).Hash -eq $before) 'Global installation changed user config.'
    foreach ($name in @('agents', 'skills', 'commands', 'instructions')) {
        $link = Get-Item -LiteralPath (Join-Path $globalRoot $name) -Force
        Assert-True ($link.LinkType -eq 'Junction') "Global target not a junction: $name"
        $expected = Join-Path (Split-Path -Parent $PSScriptRoot) "src\$name"
        Assert-True ($link.Target[0] -eq $expected) "Wrong global target: $name"
    }
    Write-Output 'PASS: local/global dry-run, spaced paths, targets, repeat install, config preservation, conflicts and missing workspace.'
}
finally {
    # Unlink junctions non-recursively before deleting the sandbox; never traverse their targets.
    $destinations = @($workspaces | ForEach-Object { Join-Path $_ '.opencode' })
    if ($globalRoot) { $destinations += $globalRoot }
    foreach ($root in $destinations) {
        foreach ($name in @('agents', 'skills', 'commands', 'instructions')) {
            $path = Join-Path $root $name
            $item = Get-Item -LiteralPath $path -Force -ErrorAction SilentlyContinue
            if ($null -ne $item -and $item.LinkType -eq 'Junction') {
                $item.Delete()
            }
        }
    }
    if (Test-Path -LiteralPath $sandbox) {
        Remove-Item -LiteralPath $sandbox -Recurse -Force
    }
}
