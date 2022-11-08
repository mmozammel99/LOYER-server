const express = require('express')
const cors = require('cors')
const app = express()
const port = process.env.PORT || 5000
const { MongoClient, ServerApiVersion } = require('mongodb');
require('dotenv').config()

// middle wares
app.use(cors())
app.use(express.json())


app.get('/', (req, res) => {
    res.send('lawyer Server is running')
})

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster0.5otzcjs.mongodb.net/?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });

async function run() {
    try {
        const serviceCollection = client.db('lawyer').collection('service')


        app.get('/services', async (req, res) => {
            const query = {}
            const cursor = serviceCollection.find(query)
            const service = await cursor.toArray()
            res.send(service)
        })
        app.post('/services', async (req, res) => {
            const service = req.body
            const result = await serviceCollection.insertOne(service)
            res.send(result)
        })
    }
    finally {

    }
}
run().catch(err => { console.error(err) })

app.listen(port, () => {
    console.log(`server port is ${port}`);
})