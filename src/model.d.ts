interface User {
  username: string;
}

interface FSAction {
  type: string;
  payload: any;
  meta?: any;
  error?: boolean;
}
