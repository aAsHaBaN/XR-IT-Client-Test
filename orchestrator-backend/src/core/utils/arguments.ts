export function getArguments() {
  const start_vpn_arg = process.argv.find(a => a.startsWith("start_vpn="))
  const start_vpn = start_vpn_arg ? start_vpn_arg?.slice("start_vpn=".length) === 'true' : false

  return {
    start_vpn: start_vpn
  };
}
