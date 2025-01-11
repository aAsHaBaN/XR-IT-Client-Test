param ($hub_name, $account_pw, $hub_pw, $new_username)
$USER_ALREADY_EXISTS_MESSAGE = "The user with the specified name already exists on the Virtual Hub."

if($null -eq $hub_name) {
    throw "Must provide a hub name to create"
} elseif($null -eq $account_pw) {
    throw "Must provide account password"
} elseif($null -eq $hub_pw) {
    throw "Must provide a hub password"
} elseif($null -eq $new_username) {
    throw "Must provide a new username"
}

Set-Location $PSScriptRoot
$get_hub_info = "./VPNServer-GetHubInfo.ps1 -hub_name " + $hub_name + " -account_pw " + $account_pw
$hub_info = Invoke-Expression $get_hub_info

$hub_exists = $hub_info[0]

if($hub_exists -eq $False) {
    throw "Hub does not exist."
} else {    
    $res = vpncmd /SERVER localhost /HUB:$hub_name /PASSWORD:$hub_pw  /CMD UserCreate $new_username  /GROUP:"" /REALNAME:"" /NOTE:""

    if($res[13].Trim() -eq $USER_ALREADY_EXISTS_MESSAGE) {
        throw "User with name " + $new_username + " already exists in this hub."
    } else {
        "Created user " + $new_username

        $successResponse = '{"is_successful":true}'
        [string]::Format("<PS-SCRIPT-RETURN>`n{0}", $successResponse)
        
        # Will support certificates in the future
        #$issue_certs = "./vpnserver_issuecert.ps1 -hub_name " + $hub_name + " -hub_pw " + $hub_pw + " -username " + $new_username
        #Invoke-Expression $issue_certs
    }

}