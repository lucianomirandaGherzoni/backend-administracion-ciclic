import { api } from './api.js';

export async function validarYDescontarStock(itemsCarrito, cantidadesSalsas) {
    try {
        const [productos, salsas] = await Promise.all([api.getProductos(), api.getSalsas()]);

        // 1. Validar Productos
        for (const item of itemsCarrito) {
            const productoReal = productos.find(p => p.id === item.id);
            if (!productoReal) throw new Error(`Producto ${item.nombre} ya no existe.`);
            if (productoReal.stock < item.quantity) throw new Error(`Stock insuficiente para ${item.nombre}.`);
        }

        // 2. Validar Salsas
        for (const [id, salsaData] of Object.entries(cantidadesSalsas)) {
            if (salsaData.cantidad > 0) {
                const salsaReal = salsas.find(s => s.id === parseInt(id));
                if (!salsaReal || salsaReal.salsa_stock < salsaData.cantidad) {
                    throw new Error(`Stock insuficiente para salsa ${salsaData.nombre}.`);
                }
            }
        }

        // 3. Descontar (Si llegamos aquí, todo es válido)
        // Descontar productos
        await Promise.all(itemsCarrito.map(item => {
            const productoReal = productos.find(p => p.id === item.id);
            return api.updateProducto(item.id, { ...productoReal, stock: productoReal.stock - item.quantity });
        }));

        // Descontar salsas
        await Promise.all(Object.entries(cantidadesSalsas).map(([id, salsaData]) => {
            if (salsaData.cantidad > 0) {
                const salsaReal = salsas.find(s => s.id === parseInt(id));
                return api.updateSalsa(id, { ...salsaReal, salsa_stock: salsaReal.salsa_stock - salsaData.cantidad });
            }
        }));

        return true;

    } catch (error) {
        throw error; // Re-lanzamos para que el controlador muestre el Toast
    }
}