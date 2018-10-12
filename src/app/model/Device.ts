export class DeviceInfo {
    public platform: string;
    public osVersion: string;
    public model: string;
    public manufacturer: string;
    public isVirtual: boolean;

    constructor(deviceInfo: any) {
        this.platform = deviceInfo.platform;
        this.isVirtual = deviceInfo.isVirtual;
        this.manufacturer = deviceInfo.manufacturer;
        this.model = deviceInfo.model;
        this.osVersion = deviceInfo.osVersion;
    }
}
