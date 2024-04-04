export class User {
    name: string;
    userId: string;
    email: string;
    state: string; //online / offline state
    avatar: string;
    password: string ;

    constructor(obj?: any) {
        this.name = obj ? obj.name : '';
        this.userId = obj ? obj.userId : '';
        this.email = obj ? obj.email : '';
        this.state = obj ? obj.state : '';
        this.avatar = obj ? obj.avatar : '';
        this.password = obj ? obj.password : '';
    }  

   

    toJSON() {
        return {
        name: this.name,
        userId: this.userId,
        email: this.email,
        state: this.state,
        avatar: this.avatar,
        password: this.password
    }
}
}