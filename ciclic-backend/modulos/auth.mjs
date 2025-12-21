import crypto from 'crypto';

// Configuración de seguridad
const SALT = process.env.AUTH_SALT || 'ciclic-admin-salt-2025';

// Credenciales hasheadas (cambiar en producción)
// Usuario: ciclic
// Contraseña: CiclicAdmin2025!
const ADMIN_CREDENTIALS = {
    username: 'ciclic',
    // Hash de la contraseña usando SHA-256 con salt
    passwordHash: hashPassword('CiclicAdmin2025!')
};

/**
 * Genera un hash SHA-256 de la contraseña con salt
 */
function hashPassword(password) {
    return crypto
        .createHash('sha256')
        .update(password + SALT)
        .digest('hex');
}

/**
 * Valida las credenciales del usuario
 */
export function validateCredentials(username, password) {
    if (!username || !password) {
        return false;
    }

    const hashedPassword = hashPassword(password);
    
    return (
        username === ADMIN_CREDENTIALS.username &&
        hashedPassword === ADMIN_CREDENTIALS.passwordHash
    );
}

/**
 * Controlador de login
 */
export async function login(req, res) {
    try {
        const { username, password } = req.body;

        if (!username || !password) {
            return res.status(400).json({
                success: false,
                message: 'Usuario y contraseña son requeridos'
            });
        }

        const isValid = validateCredentials(username, password);

        if (isValid) {
            return res.status(200).json({
                success: true,
                message: 'Login exitoso',
                user: {
                    username: username,
                    role: 'admin'
                }
            });
        } else {
            return res.status(401).json({
                success: false,
                message: 'Credenciales incorrectas'
            });
        }
    } catch (error) {
        console.error('Error en login:', error);
        return res.status(500).json({
            success: false,
            message: 'Error en el servidor'
        });
    }
}
