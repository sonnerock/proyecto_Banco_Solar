const express = require("express")
const app = express()
const { insertarCliente, consultaCliente, actualizarCliente, eliminarCliente, insertarTransferencia, consultaTransferencias } = require("./db")

app.use(express.json())

app.listen(3000, () => { console.log("App escuchando puerto 3000") })

app.get("/", (req, res) => {
    res.sendFile(__dirname + "/index.html")
})

app.post("/usuario", async (req, res) => {
    const payload = req.body

    try {
        const response = await insertarCliente(payload)

        res.send(response.rows)
    } catch (error) {
        res.statusCode = 500
        res.json({ error: "algo salió mal, intentalo más tarde" })
    }
})

app.get("/usuarios", async (req, res) => {
    try {
        const response = await consultaCliente()

        res.send(response.rows)
    } catch (error) {
        res.statusCode = 500
        res.json({ error: "algo salió mal, intentalo más tarde" })
    }
})

app.put("/usuario", async (req, res) => {
    const { id } = req.query
    const payload = req.body
    payload.id = id;

    try {
        const response = await actualizarCliente(payload)

        res.json(response.rows)
    } catch (error) {
        res.statusCode = 500
        res.json({ error: "algo salió mal, intentalo más tarde" })
    }
})

app.delete("/usuario", async (req, res) => {
    const payload = req.query

    try {
        const result = await eliminarCliente(payload)

        res.statusCode = 202
        res.json({ message: "Usuario Eliminado" })
    } catch (error) {
        res.statusCode = 500
        res.json({ error: "algo salió mal, intentalo más tarde" })
    }

})

app.post("/transferencia", async (req, res) => {
    const payload = req.body
    const fecha = new Date;
    payload.fecha = fecha;

    try {
        if(payload.emisor != payload.receptor){
            const response = await insertarTransferencia(payload)

            res.send(response.rows)
        }else{
            res.statusCode = 400
            res.send({
                error:"No se puede transferir a la misma cuenta"
            })
        }
    } catch (error) {
        console.log("No se puede transferir a la misma cuenta")
    }
})

app.get("/transferencias", async (req, res) => {
    try {
        const result = await consultaTransferencias()

        res.json(result.rows)
    } catch (error) {       
        res.statusCode = 500;
        res.json({error: "Error en BD."})
    }
})