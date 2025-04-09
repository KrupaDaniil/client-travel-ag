import {IRole} from './i-role';

export interface INewUser {
  username: string;
  password: string;
  firstName: string;
  lastName: string;
  email: string;
  birthday: Date;
  active: boolean;
  roles: IRole[];
}
