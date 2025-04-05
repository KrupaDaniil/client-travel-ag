import {IRole} from './i-role';

export interface IUser {
  id: number;
  username: string;
  password: string;
  firstName: string;
  lastName: string;
  email: string;
  birthday: Date;
  active: boolean;
  roles: IRole[];
}
