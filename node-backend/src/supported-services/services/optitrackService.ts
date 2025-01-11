import * as fs from 'fs';
import * as xml2js from 'xml2js';
import { launchApplication, killApplication, Callback, isApplicationOpen } from '../../core/utils/application';

const MOTIVE_PATH = 'C:\\Program Files\\OptiTrack\\Motive\\Motive.exe'
const MOTIVE_EXE = 'Motive.exe'
const MOTIVE_FILE_PATH: string = 'C:\\ProgramData\\OptiTrack\\MotiveProfile.motive';


// Updates the default used by OptiTrack Motive on application open to enable / disable unicast streaming
// from the streaming interface (IP address) provided.
export async function updateMotiveFile(localInterfaceValue: string, streamingValue: string): Promise<void> {
    const parser = new xml2js.Parser();
    const builder = new xml2js.Builder();

    const requiredProperties = [
        { name: "SelectedTabIndexInTabCtrl", value: "3" },
        { name: "LocalInterface", value: localInterfaceValue },
        { name: "Streaming", value: streamingValue },
        { name: "StreamTrainedMarkersetMarkers", value: "false" },
        { name: "StreamTrainedMarkersetBones", value: "false" },
        { name: "LocalRigidBodies", value: "Local" },
        { name: "Type", value: "Unicast" },
        { name: "StreamingStatus", value: "3" }
    ];

    try {
        const xmlData: string = fs.readFileSync(MOTIVE_FILE_PATH, 'utf8');
        const parsedXml = await parser.parseStringPromise(xmlData) as any;

        const properties = parsedXml.profile?.property_warehouse?.[0]?.properties?.[0]?.property || [];
        const propertyMap: Record<string, any> = Object.fromEntries(
            properties.map((prop: any) => [prop.$.name, prop])
        );

        const updatedProperties = requiredProperties.map(({ name, value }) => {
            if (propertyMap[name]) {
                propertyMap[name].$.value = value;
                return propertyMap[name];
            }
            return { $: { name, value } };
        });

        parsedXml.profile.property_warehouse[0].properties[0].property = [
            ...updatedProperties,
            ...properties.filter((prop: any) => !propertyMap[prop.$.name])
        ];

        const updatedXml: string = builder.buildObject(parsedXml);
        fs.writeFileSync(MOTIVE_FILE_PATH, updatedXml, 'utf8');
        console.log(`File successfully updated: ${MOTIVE_FILE_PATH}`);
    } catch (error) {
        console.error(`Error processing the file: ${(error as Error).message}`);
    }
}

// Launches Motive OptiTrack
export async function launchMotive() {
    launchApplication(MOTIVE_PATH);
    await new Promise(resolve => setTimeout(resolve, 5000));
}

// Closes Motive OptiTrack
export async function killMotive() {
    killApplication(MOTIVE_EXE);
    await new Promise(resolve => setTimeout(resolve, 5000));
}

// Checks if Motive OptiTrack is open and executes a callback function based on the result
export function isMotiveOpen(callback: Callback) {
    return isApplicationOpen(MOTIVE_EXE, callback)
}
