export class DirectMessage {
    member: any[];
    id: string;
    messages: any[]

    /**
     * Constructs a new instance of the DirectMessage class
     * @param {any} obj - An object containing values used to initialize the channel properties. If not provided, defaults will be set.
     */
    constructor(obj?: any) {
        this.member = obj ? obj.member : [];
        this.id = obj ? obj.id : '';
        this.messages = obj ? obj.messages : []
    }


    /**
     * Converts the directmessage instance to a JSON representative
     * @returns {object} - An object containing the properties of the directmessage
     */
    toJSON() {
        return {
            member: this.member,
            id: this.id,
            messages: this.messages
        }
    }
}