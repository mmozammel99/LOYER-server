const express = require('express')
const cors = require('cors')
const jwt = require('jsonwebtoken')
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


const verifyJWT = (req, res, next) => {
    const authHeader = req.headers.authorization
    if (!authHeader) {
        return res.status(401).send({ message: 'unauthorized access' })
    };
    const token = authHeader.split(' ')[1];
    jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, function (err, decoded) {
        if (err) {
            return res.status(403).send({ message: 'Forbidden access' })
        }
        req.decoded = decoded;
        next()
    })
}

async function run() {
    try {
        const serviceCollection = client.db('lawyer').collection('service')
        const reviewsCollection = client.db('lawyer').collection('reviews')

        app.post('/jwt', (req, res) => {
            const user = req.body;
            const token = jwt.sign(user,
                process.env.ACCESS_TOKEN_SECRET, {
                expiresIn: '1d'
            })
            res.send({ token })
        })
        app.get('/services', async (req, res) => {
            const query = {}
            const cursor = serviceCollection.find(query)
            const service = await cursor.toArray()
            res.send(service)
        })
        app.get('/home', async (req, res) => {
            const query = {}
            const cursor = serviceCollection.find(query).sort({ "time": -1 })
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
            const cursor = reviewsCollection.find(query).sort({ "time": -1 })
            const service = await cursor.toArray()
            res.send(service)
        })
        app.post('/review', async (req, res) => {
            const review = req.body
            const result = await reviewsCollection.insertOne(review)
            res.send(result)
        })
        app.get('/my-reviews', verifyJWT, async (req, res) => {
            const decoded = req.decoded
            if (decoded.email !== req.query.email) {
                return res.status(403).send({
                    message: 'unauthorized access'
                })

            }
            let query = {}
            const email = req.query.email
            if (email) {
                query = {
                    email: email
                }
            }
            const cursor = reviewsCollection.find(query).sort({ "time": -1 })
            const service = await cursor.toArray()
            res.send(service)
        })
        app.patch('/my-reviews/:id', async (req, res) => {
            const id = req.params.id
            const feedback = req.body.feedback;
            const query = { _id: ObjectId(id) }
            const updateDoc = {
                $set: {
                    feedback: feedback
                }
            }
            const result = await reviewsCollection.updateOne(query, updateDoc)
            res.send(result)
        })
        app.delete('/my-reviews/:id', async (req, res) => {
            const id = req.params.id
            const query = { _id: ObjectId(id) }
            const result = await reviewsCollection.deleteOne(query)
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