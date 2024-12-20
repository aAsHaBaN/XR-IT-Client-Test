import Link from "next/link";
import Alert from "./Alert";
import Button from "./Button";

function NoConfigurationAlert() {
  return (
    <div className="min-w-96">
      <Alert type="warning" withButton={false}>
        <div className="flex flex-col gap-1">
          <span>
            <span className="font-bold">No configuration is running.</span>
          </span>
          <div className="flex flex-row items-center gap-1">
            <span>Please select a configuration to launch {"=>"}</span>
            <Button color="secondary">
              <Link href="/">Go to Home</Link>
            </Button>
          </div>
        </div>
      </Alert>
    </div>
  );
}

export default NoConfigurationAlert;
