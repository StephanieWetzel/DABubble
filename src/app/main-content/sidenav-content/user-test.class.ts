export class User {
  isUserOnline: boolean | undefined;
  fullName: string | undefined;
  email: string | undefined;
  avatar: string | undefined;

  constructor(state: boolean, name: string, mail: string, avatar: string) {
    this.isUserOnline = state;
    this.email = mail;
    this.fullName = name;
    this.avatar = avatar;
  }
}
