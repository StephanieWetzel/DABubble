export class Message{
    sendId: string;
    getId: string;
    time: number;
    content: string;
    id: string;

    constructor(obj?: any){
        this.sendId = obj ? obj.sendId : '';
        this.getId = obj ? obj.getId : '';
        this.time = obj ? obj.time :  new Date().getTime();
        this.content = obj ? obj.content : '';
        this.id = obj ? obj.id : '';
    }
}