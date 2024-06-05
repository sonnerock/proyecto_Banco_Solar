const { Pool } = require("pg")

const config = {
    host: process.env.HOST,
    port: process.env.PORT,
    database: process.env.DATABASE,
    user: process.env.USER,
    password: process.env.PASS
}

const pool = new Pool(config)

const insertarCliente = async (payload) => {
    const text = "INSERT INTO usuarios(nombre, balance) VALUES ($1, $2) RETURNING *";
    const values = [payload.nombre, payload.balance]

    const result = await pool.query(text, values)

    return result
}

const consultaCliente = async () => {

    const text = "SELECT * FROM usuarios"
    const result = await pool.query(text)

    return result
}

const actualizarCliente = async (payload) => {
    const text = "UPDATE usuarios SET nombre = $1, balance = $2 WHERE id = $3";
    const values = [payload.name, payload.balance, payload.id]

    const result = await pool.query(text, values)

    return result

}

const eliminarCliente = async (payload) => {
    const text = "DELETE FROM usuarios WHERE id = $1"
    const values = [payload.id]

    const result = await pool.query(text, values)

    return result
}

const insertarTransferencia = async (payload) => {
    const client = await pool.connect()

    try {
        await client.query("BEGIN");

        const id1 = "SELECT * FROM usuarios WHERE nombre = $1"
        const values1 = [payload.emisor]
        const emisor = await client.query(id1, values1)

        const id2 = "SELECT * FROM usuarios WHERE nombre = $1"
        const values2 = [payload.receptor]
        const receptor = await client.query(id2, values2)

        const idEmisor = emisor.rows[0].id
        const idReceptor = receptor.rows[0].id

        const descontar = "UPDATE usuarios SET balance = balance - $1 WHERE id= $2";
        const valuesDescontar = [payload.monto, idEmisor];

        await client.query(descontar, valuesDescontar);


        const aumentar = "UPDATE usuarios SET balance = balance + $1 WHERE id = $2";
        const valuesAumentar = [payload.monto, idReceptor];

        await client.query(aumentar, valuesAumentar);


        const text = "INSERT INTO transferencias(emisor, receptor, monto, fecha) VALUES($1, $2, $3, $4) RETURNING *";
        const valuesTransferencia = [idEmisor, idReceptor, payload.monto, payload.fecha];

        const result = await pool.query(text, valuesTransferencia);

        await client.query("COMMIT");

        return result;
    }
    catch (error) {
        await client.query("ROLLBACK")
        console.error(error)
    } finally {
        client.release()
        console.log("Termino Transaccion")
    }
}


const consultaTransferencias = async () => {
    const text = "SELECT * FROM transferencias"
    const values = []

    const queryObject = {
        text: text,
        values: values,
        rowMode: "array"
    }

    const result = await pool.query(queryObject)

    return result
}

module.exports = { insertarCliente, consultaCliente, actualizarCliente, eliminarCliente, insertarTransferencia, consultaTransferencias }