declare namespace db {
    interface IDBConnector {
        getPath(): string;
        source(data: any): void;
        sink(): any;
    }
}
