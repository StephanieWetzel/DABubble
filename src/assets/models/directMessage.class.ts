export class DirectMessage {
    member: any[];
    id: string;
    messages: any[]


    constructor(obj?: any) {
        this.member = obj ? obj.member : [];
        this.id = obj ? obj.id : '';
        this.messages = obj ? obj.messages : []
    }


    toJSON() {
        return {
            member: this.member,
            id: this.id,
            messages: this.messages
        }
    }
}