#Requires -Version 5.1
[CmdletBinding(SupportsShouldProcess = $true)]
param(
    [Parameter(Mandatory = $true)]
    [string]$WorkspaceRoot
)

# Backward-compatible local entrypoint. Both modes share the same installer.
& (Join-Path $PSScriptRoot 'install-opencode.ps1') @PSBoundParameters
