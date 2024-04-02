export class User {
    //name: string;
    userId: string;
    email: string;
    //state: boolean; //online / offline state
    //avatar: string;
    password: string ;

    constructor(obj?: any) {
        //this.name = obj ? obj.name : '';
        this.userId = obj ? obj.userId : '';
        this.email = obj ? obj.email : '';
        // this.state = obj ? obj.state : false;
        // this.avatar = obj ? obj.avatar : '';
        this.password = obj ? obj.password : '';
    }  

    // constructor(name: string, id: string, mail: string, state: boolean, avatar: string) {
    //     this.name = name;
    //     this.userId = id;
    //     this.email = mail;
    //     this.state = state;
    //     this.avatar = avatar;
    // }

    toJSON() {
        return {
        //name: this.name,
        userId: this.userId,
        email: this.email,
        // state: this.state,
        // avatar: this.avatar,
        password: this.password
    }
}
}