export interface Credentials {
  email: string;
  password: string;
}

export interface Registration extends Credentials {
  name: string;
}

export interface Account {
  id: string;
  name: string;
  email: string;
}
