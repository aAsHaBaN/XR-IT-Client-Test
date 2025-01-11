/* 
  Arguments supported by the XR-IT orchestrator when launching it from the CLI. See README for usage.
*/
export function getArguments() {
  const start_vpn_arg = process.argv.find(a => a.startsWith("start_vpn="))
  const start_vpn = start_vpn_arg ? start_vpn_arg?.slice("start_vpn=".length) === 'true' : false
  const use_auth_arg = process.argv.find(a => a.startsWith("use_auth="))
  const use_auth = use_auth_arg ? use_auth_arg?.slice("use_auth=".length) === 'true' : false

  return {
    start_vpn: start_vpn,
    use_auth: use_auth
  };
}
