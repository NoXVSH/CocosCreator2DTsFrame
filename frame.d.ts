declare function regVar(key : string, value : any, force? : boolean);
declare function dirRegVar(key : string, value : any, force? : boolean);
declare function require(value : any);
declare function log(...value : any);
declare function errorlog(...value : any);
declare function warnlog(...value : any);
declare let wx : any;
declare let tywx : any;
declare let wxDownloader : any;
declare let selfComponent : any;
declare const Object: ObjectConstructor;
interface ObjectConstructor {
    values(o: object) : any[];
}

interface Window {
    regVar : (key : string, value : any, force? : boolean) => void
}


    
