export class User {
    name: string;
    email: string;
    avatar: string;
    online: boolean;
    id: string;

    constructor(obj?: any) {
        this.name = obj ? obj.name : '';
        this.email = obj ? obj.email : '';
        this.avatar = obj ? obj.avatar : '';
        this.online = obj ? obj.online : false;
        this.id = obj ? obj.id : ''
    }

    public toJSON() {
        return {
            name: this.name,
            mail: this.email,
            avatar: this.avatar,
            online: this.online,
            id: this.id
        }
    }

}