param ()
$ReturnDelimeter = '<PS-SCRIPT-RETURN>'
$IsRunning = "false"

if((Get-Process "mvn_studio64" -ea SilentlyContinue) -ne $Null){ 
    $IsRunning = "true"
} 

'<PS-SCRIPT-RETURN>`n{"is_running":' + $IsRunning + '}'