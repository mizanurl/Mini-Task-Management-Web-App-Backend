export interface User {
  	id: string;
  	username: string;
  	email: string;
  	role: 'Admin' | 'Manager' | 'Member';
	token: string;
}