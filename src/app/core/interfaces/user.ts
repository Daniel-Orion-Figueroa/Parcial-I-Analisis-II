export interface User {
    id: number;
    name: string;
    email: string;
    password: string;
    tipoUsuario: TipoUsuario;
    fechaRegistro: string;
}

export enum TipoUsuario {
    ESTUDIANTE = 'ESTUDIANTE',
    DOCENTE = 'DOCENTE', 
    ADMIN = 'ADMIN'
}
