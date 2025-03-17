import {IUserStartData} from '../interfaces/user-auth/i-user-start-data';

export class UserStartData implements IUserStartData {
  roles: string[];
  username: string;

  constructor(roles: string[], username: string) {
    this.roles = roles;
    this.username = username;
  }

}
