param ($hub_name, $account_pw, $hub_pw)

if($null -eq $hub_name) 
{
    throw "Must provide a hub name to create"
} elseif($null -eq $account_pw)
{
    throw "Must provide account password"
} 

Set-Location $PSScriptRoot
$get_hub_info = "./VPNServer-GetHubInfo.ps1 -hub_name " + $hub_name + " -account_pw " + $account_pw
$res = Invoke-Expression $get_hub_info

$hub_exists = $res[0]

if($hub_exists) 
{
    vpncmd /SERVER localhost /PASSWORD:$account_pw /CMD HubDelete $hub_name
    $successResponse = '{"is_successful":true}'
    [string]::Format("<PS-SCRIPT-RETURN>`n{0}", $successResponse)
} 
else 
{
    throw "Hub with provided name does not exist."
}