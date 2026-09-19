#Requires -Version 5.1
[CmdletBinding()]
param([string]$TempRoot = [System.IO.Path]::GetTempPath())

$ErrorActionPreference = 'Stop'
Set-StrictMode -Version Latest
if (-not (Test-Path -LiteralPath $TempRoot -PathType Container)) { throw 'Temporary parent must exist.' }
Get-Command opencode -ErrorAction Stop | Out-Null
Get-Command git -ErrorAction Stop | Out-Null
$sandbox = Join-Path $TempRoot ('opencode-loader-' + [guid]::NewGuid().ToString('N'))
$installer = Join-Path $PSScriptRoot 'install-opencode.ps1'
$destinations = @()
$variables = @('XDG_CONFIG_HOME', 'XDG_DATA_HOME', 'XDG_CACHE_HOME', 'XDG_STATE_HOME',
    'OPENCODE_CONFIG', 'OPENCODE_CONFIG_DIR', 'OPENCODE_CONFIG_CONTENT',
    'OPENCODE_DISABLE_PROJECT_CONFIG', 'OPENCODE_PURE', 'OPENCODE_DISABLE_EXTERNAL_SKILLS')
$saved = @{}
foreach ($name in $variables) { $saved[$name] = [Environment]::GetEnvironmentVariable($name, 'Process') }

function Invoke-Loader([string]$Directory, [string]$Arguments) {
    $info = New-Object System.Diagnostics.ProcessStartInfo
    $info.FileName = 'powershell.exe'
    $info.Arguments = "-NoProfile -Command `"& opencode $Arguments; exit `$LASTEXITCODE`""
    $info.WorkingDirectory = $Directory
    $info.UseShellExecute = $false
    $info.RedirectStandardOutput = $true
    $info.RedirectStandardError = $true
    $process = [System.Diagnostics.Process]::Start($info)
    $errors = $process.StandardError.ReadToEndAsync()
    $output = $process.StandardOutput.ReadToEnd()
    $process.WaitForExit()
    if ($process.ExitCode -ne 0) { throw "Loader failed ($Arguments): $($errors.Result)" }
    $process.Dispose()
    return ($output | ConvertFrom-Json)
}

function Assert-Definitions([string]$Directory) {
    $config = Invoke-Loader $Directory 'debug config'
    foreach ($name in @('business-analyst', 'system-analyst', 'coder', 'documenter',
        'code-impact-explorer', 'ticket-context-reader', 'docs-glossary-reader', 'docs-topic-reader', 'researcher')) {
        if ($config.agent.PSObject.Properties.Name -notcontains $name) { throw "Missing agent: $name" }
    }
    if (@($config.command.PSObject.Properties).Count -lt 9) { throw 'Missing commands.' }
    $skills = @(Invoke-Loader $Directory 'debug skill')
    if (@($skills | Where-Object { $_.name -eq 'django-models' }).Count -ne 1) { throw 'Skill discovery failed.' }
    $agent = Invoke-Loader $Directory 'debug agent system-analyst'
    $edits = @($agent.permission | Where-Object { $_.permission -eq 'edit' })
    if ($edits.Count -ne 2 -or $edits[0].pattern -ne '*' -or $edits[0].action -ne 'deny' -or
        $edits[1].pattern -ne '**/.ai-temp/**' -or $edits[1].action -ne 'allow') {
        throw 'Generic analyst permissions must allow scratch only.'
    }
}

try {
    New-Item -ItemType Directory -Path $sandbox | Out-Null
    foreach ($name in $variables) { [Environment]::SetEnvironmentVariable($name, $null, 'Process') }
    $env:XDG_CONFIG_HOME = Join-Path $sandbox 'config'
    $env:XDG_DATA_HOME = Join-Path $sandbox 'data'
    $env:XDG_CACHE_HOME = Join-Path $sandbox 'cache'
    $env:XDG_STATE_HOME = Join-Path $sandbox 'state'
    $env:OPENCODE_PURE = '1'
    $env:OPENCODE_DISABLE_EXTERNAL_SKILLS = '1'

    # Separate roots ensure local definitions cannot leak into the global-mode check.
    foreach ($mode in @('standalone', 'multi-repository', 'global-consumer')) {
        $root = Join-Path $sandbox $mode
        New-Item -ItemType Directory -Path $root | Out-Null
        if ($mode -eq 'multi-repository') {
            foreach ($project in @('application', 'library')) {
                $repo = Join-Path $root $project
                New-Item -ItemType Directory -Path $repo | Out-Null
                & git -C $repo init --quiet
                if ($LASTEXITCODE -ne 0) { throw 'Cannot create temporary repository.' }
            }
        }
        else {
            & git -C $root init --quiet
            if ($LASTEXITCODE -ne 0) { throw 'Cannot create temporary repository.' }
        }
        if ($mode -eq 'global-consumer') {
            $globalRoot = Join-Path $env:XDG_CONFIG_HOME 'opencode'
            $destinations += $globalRoot
            & $installer -Global
        }
        else {
            $destinations += (Join-Path $root '.opencode')
            & $installer -WorkspaceRoot $root
        }
        Assert-Definitions $root
        Write-Output "PASS: loader in $mode mode; generic analyst permissions."
    }

    # Local report policy uses an arbitrary directory, not an organization-specific name.
    foreach ($mode in @('standalone', 'global-consumer')) {
        $root = Join-Path $sandbox $mode
        $reportPattern = ($root.Replace('\', '/') + '/reports/**')
        $policy = @{
            agent = @{
                'system-analyst' = @{ permission = @{ edit = [ordered]@{ '*' = 'deny'; $reportPattern = 'allow' } } }
            }
        } | ConvertTo-Json -Depth 8
        New-Item -ItemType File -Path (Join-Path $root 'opencode.json') -Value $policy | Out-Null
        $agent = Invoke-Loader $root 'debug agent system-analyst'
        $edits = @($agent.permission | Where-Object { $_.permission -eq 'edit' })
        $lastReportRule = $null
        foreach ($rule in $edits) {
            if ($rule.pattern -eq '*' -or $rule.pattern -eq $reportPattern) { $lastReportRule = $rule }
        }
        if ($null -eq $lastReportRule -or $lastReportRule.pattern -ne $reportPattern -or
            $lastReportRule.action -ne 'allow') { throw 'Local report permission was shadowed by base rules.' }
        Write-Output "PASS: report overlay survives Markdown-agent merge order in $mode mode."
    }
}
finally {
    foreach ($name in $variables) { [Environment]::SetEnvironmentVariable($name, $saved[$name], 'Process') }
    foreach ($root in $destinations) {
        foreach ($name in @('agents', 'skills', 'commands', 'instructions')) {
            $item = Get-Item -LiteralPath (Join-Path $root $name) -Force -ErrorAction SilentlyContinue
            if ($null -ne $item -and $item.LinkType -eq 'Junction') { $item.Delete() }
        }
    }
    if (Test-Path -LiteralPath $sandbox) { Remove-Item -LiteralPath $sandbox -Recurse -Force }
}
