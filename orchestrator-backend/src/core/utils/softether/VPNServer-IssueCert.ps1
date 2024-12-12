param ($hub_name, $hub_pw, $username)

if($null -eq $hub_name) {
    throw "Must provide a hub name to create"
} elseif($null -eq $hub_pw) {
    throw "Must provide a hub password"
} elseif($null -eq $username) {
    throw "Must provide a new username"
}

Set-Location "../../../../"

$new_directory_name = "temp"
New-Item -Name $new_directory_name -ItemType Directory -Force

$cert_location = $new_directory_name + "/" + $username + ".cer"
$key_location = $new_directory_name + "/" + $username + ".key"

vpncmd /TOOLS /CMD MakeCert MakeCert /CN:none /O:none /OU:none /C:none /ST:none /L:none /SERIAL:none /EXPIRES:none /SAVECERT:$cert_location /SAVEKEY:$key_location

"Certificates issued, location in directory: " + $new_directory_name
vpncmd /SERVER localhost /HUB:$hub_name /PASSWORD:$hub_pw  /CMD UserCertSet $username /LOADCERT:$cert_location

"Certificate successfully associated to user."

$response = [string]::Format('{"locations":{"cert":{0},"key":{1}}}', $cert_location, $key_location)
[string]::Format("<PS-SCRIPT-RETURN>`n{0}", $response)


