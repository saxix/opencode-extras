#Requires -Version 5.1
[CmdletBinding(SupportsShouldProcess = $true, DefaultParameterSetName = 'Global')]
param(
    [Parameter(Mandatory = $true, ParameterSetName = 'Local')]
    [string]$WorkspaceRoot,

    [Parameter(ParameterSetName = 'Global')]
    [switch]$Global,

    [Parameter(ParameterSetName = 'Global')]
    [string]$ConfigRoot
)

$ErrorActionPreference = 'Stop'
Set-StrictMode -Version Latest

if ($env:OS -ne 'Windows_NT') {
    throw 'This installer requires Windows. See docs/deploy/installation.md for other platforms.'
}
$toolkit = Split-Path -Parent $PSScriptRoot
if ($PSCmdlet.ParameterSetName -eq 'Local') {
    if (-not (Test-Path -LiteralPath $WorkspaceRoot -PathType Container)) {
        throw "Workspace directory does not exist: $WorkspaceRoot"
    }
    $workspace = (Resolve-Path -LiteralPath $WorkspaceRoot).ProviderPath
    $destination = Join-Path $workspace '.opencode'
}
else {
    if ([string]::IsNullOrWhiteSpace($ConfigRoot)) {
        $configParent = if ($env:XDG_CONFIG_HOME) { $env:XDG_CONFIG_HOME } else { Join-Path $HOME '.config' }
        $ConfigRoot = Join-Path $configParent 'opencode'
    }
    $destination = $ExecutionContext.SessionState.Path.GetUnresolvedProviderPathFromPSPath($ConfigRoot)
}
$names = @('agents', 'skills', 'commands', 'instructions')
$pending = @()

# Preflight every target before making changes. Existing user content is never replaced.
if ((Test-Path -LiteralPath $destination) -and
    -not (Test-Path -LiteralPath $destination -PathType Container)) {
    throw "Destination is not a directory: $destination"
}
foreach ($name in $names) {
    $source = Join-Path $toolkit "src\$name"
    $link = Join-Path $destination $name
    if (-not (Test-Path -LiteralPath $source -PathType Container)) {
        throw "Source directory does not exist: $source"
    }
    $source = (Resolve-Path -LiteralPath $source).ProviderPath
    $existing = Get-Item -LiteralPath $link -Force -ErrorAction SilentlyContinue
    if ($null -ne $existing) {
        if ($existing.LinkType -ne 'Junction' -or
            @($existing.Target).Count -ne 1 -or
            -not [string]::Equals(
                ([string]$existing.Target[0]).TrimEnd('\'),
                $source.TrimEnd('\'),
                [System.StringComparison]::OrdinalIgnoreCase)) {
            throw "Destination already exists and is not the expected junction: $link"
        }
        Write-Output "Already installed: $link"
    }
    else {
        $pending += [PSCustomObject]@{ Link = $link; Source = $source }
    }
}

if (-not (Test-Path -LiteralPath $destination) -and
    $PSCmdlet.ShouldProcess($destination, 'Create OpenCode configuration directory')) {
    New-Item -ItemType Directory -Path $destination -Force | Out-Null
}
foreach ($entry in $pending) {
    if ($PSCmdlet.ShouldProcess($entry.Link, "Create junction to $($entry.Source)")) {
        New-Item -ItemType Junction -Path $entry.Link -Target $entry.Source | Out-Null
        Write-Output "Installed: $($entry.Link)"
    }
}

Write-Output "Optional shared instructions: $(Join-Path $destination 'instructions\workspace.md')"
Write-Output 'Add that path to your existing instructions array only if you want the shared operating defaults.'
Write-Output 'Preserve existing configuration values. Restart OpenCode after installation.'
