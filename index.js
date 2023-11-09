const express = require('express');
const cors = require('cors');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
require('dotenv').config()
const app = express();

const port = process.env.PORT || 5000;

// middleware
app.use(cors())
app.use(express.json())


const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.7exoi4x.mongodb.net/?retryWrites=true&w=majority`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
    serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
    }
});

async function run() {
    try {
        // Connect the client to the server	(optional starting in v4.7)
        // await client.connect();

        const foodCollection = client.db('foodBondDB').collection('foods');
        const foodRequestCollection = client.db('foodBondDB').collection('foodRequest');


        app.get('/foods', async (req, res) => {
            let query = {};
            if (req.query?.donatorEmail) {
                query = { donatorEmail: req.query.donatorEmail }
            }
            const result = await foodCollection.find(query).toArray()
            res.send(result)
        })

        app.get('/foods/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: new ObjectId(id) }
            const result = await foodCollection.findOne(query)
            res.send(result)
        })

        app.post('/foods', async (req, res) => {
            const newFood = req.body;
            const result = await foodCollection.insertOne(newFood)
            res.send(result)
        })

        app.patch('/foods/:id', async (req, res) => {
            const id = req.params.id;
            const filter = { _id: new ObjectId(id) }
            const updatedFood = req.body;
            const updatedDoc = {
                $set: {
                    foodName: updatedFood.foodName,
                    foodImage: updatedFood.foodImage,
                    foodQuantity: updatedFood.foodQuantity,
                    pickupLocation: updatedFood.pickupLocation,
                    expiredDateTime: updatedFood.expiredDateTime,
                    additionalNotes: updatedFood.additionalNotes,
                }
            }
            const result = await foodCollection.updateOne(filter, updatedDoc)
            res.send(result)
        })

        app.delete('/foods/:id', async (req, res) => {
            const id = req.params.id
            const query = { _id: new ObjectId(id) }
            const result = await foodCollection.deleteOne(query)
            res.send(result)
        })

        // request
        app.get('/food-request', async (req, res) => {
            const cursor = foodRequestCollection.find()
            const result = await cursor.toArray()
            res.send(result)
        })

        app.get('/food-request/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: new ObjectId(id) }
            const result = await foodRequestCollection.findOne(query)
            res.send(result)
        })

        app.post('/food-request', async (req, res) => {
            const newFoodRequest = req.body;
            const result = await foodRequestCollection.insertOne(newFoodRequest)
            res.send(result)
        })

        app.put('/food-request/:id', async (req, res) => {
            const id = req.params.id;
            const filter = { _id: new ObjectId(id) }
            const updatedFoodRequest = req.body;
            const updatedDoc = {
                $set: {
                    foodStatus: updatedFoodRequest.foodStatus,
                }
            }
            const result = await foodRequestCollection.updateOne(filter, updatedDoc)
            res.send(result)
        })

        // Send a ping to confirm a successful connection
        await client.db("admin").command({ ping: 1 });
        console.log("Pinged your deployment. You successfully connected to MongoDB!");
    } finally {
        // Ensures that the client will close when you finish/error
        // await client.close();
    }
}
run().catch(console.dir);


app.get('/', (req, res) => {
    res.send('Food Bond server in running')
})

app.listen(port, () => {
    console.log(`Food bond server running on port ${port}`)
})