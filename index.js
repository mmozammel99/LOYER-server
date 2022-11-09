const express = require('express')
const cors = require('cors')
const app = express()
const port = process.env.PORT || 5000
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
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
        const reviewsCollection = client.db('lawyer').collection('reviews')


        app.get('/services', async (req, res) => {
            const query = {}
            const cursor = serviceCollection.find(query)
            const service = await cursor.toArray()
            res.send(service)
        })
        app.get('/home', async (req, res) => {
            const query = {}
            const cursor = serviceCollection.find(query).sort({"time":-1})
            const service = await cursor.limit(3).toArray()
            res.send(service)
        })
        app.get('/services/:id', async (req, res) => {
            const id = req.params.id
            const query = { _id: ObjectId(id) }
            const service = await serviceCollection.findOne(query)
            res.send(service)
        })
        app.post('/services', async (req, res) => {
            const service = req.body
            const result = await serviceCollection.insertOne(service)
            res.send(result)
        })
        app.get('/reviews', async (req, res) => {
            let query = {}
            const serviceId = req.query.serviceId
            if (serviceId) {
                query = {
                    serviceId: serviceId
                }
            }
            const cursor = reviewsCollection.find(query).sort({"time":-1})
            const service = await cursor.toArray()
            res.send(service)
        })
        app.post('/review', async (req, res) => {
            const review = req.body
            const result = await reviewsCollection.insertOne(review)
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