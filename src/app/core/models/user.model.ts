export interface User {
  id_usuario: number;
  username: string;
  correo: string;
  roles: string[];
  permisos: string[];
  empleado?: any;
}
