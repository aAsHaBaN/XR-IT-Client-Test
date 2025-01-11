param ($adapterName)

$SUCCESS_MESSAGE = "The command completed successfully."

if($null -eq $adapterName) {
    throw "Must provide an adapter name."
}

$removeAdapterResponse = vpncmd /CLIENT localhost /CMD NicDelete $adapterName
$successMessage = $removeAdapterResponse[10]

if($successMessage -ne $SUCCESS_MESSAGE) {
    throw "Removing VPN adapter was unsuccessful."
}