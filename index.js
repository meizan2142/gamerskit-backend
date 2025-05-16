const express = require('express');
const cors = require('cors');
const port = process.env.PORT || 5000
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const app = express()
require('dotenv').config()

const corsOptions = {
    origin: ['http://localhost:5173',
        'https://cheery-chimera-b69472.netlify.app',
        'https://gamerskitbd.com'
    ],
    credentials: true,
    optionSuccessStatus: 200
}

app.use(cors(corsOptions))
app.use(express.json())




const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.usv0l7z.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;

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
        // All collection of MongoDB
        const cartListCollection = client.db('gamerskit').collection('cartList')
        const addedProductsCollection = client.db('gamerskit').collection('addedProducts')
        const orderDetailsCollection = client.db('gamerskit').collection('orderdetails')
        const usersCollection = client.db('gamerskit').collection('users')

        // All Backend routes start from here

        // Add to cart list
        app.get('/users', async (req, res) => {
            const result = await usersCollection.find().toArray()
            res.send(result)
        })
        app.get('/users/:email', async (req, res) => {
            const email = req.params.email
            const result = await usersCollection.findOne({ email })
            res.send(result)
        })
        app.get('/cartList', async (req, res) => {
            const result = await cartListCollection.find().toArray()
            res.send(result)
        })
        app.get('/addedProducts', async (req, res) => {
            const result = await addedProductsCollection.find().toArray()
            res.send(result)
        })
        app.get('/orderdetails', async (req, res) => {
            const result = await orderDetailsCollection.find().toArray()
            res.send(result)
        })
        // Get single product
        app.get('/addedProducts/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: new ObjectId(id) }
            const result = await addedProductsCollection.findOne(query)
            res.send(result)
        })
        app.get('/orderdetails/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: new ObjectId(id) }
            const result = await orderDetailsCollection.findOne(query)
            res.send(result)
        })

        app.post('/users', async (req, res) => {
            const newUsers = req.body;
            const query = { email: newUsers.email }
            const existingUser = await usersCollection.findOne(query)
            if (existingUser) {
                return res.send({ message: 'User Already exists', insertedId: null })
            }
            const result = await usersCollection.insertOne(newUsers);
            res.send(result)
        });
        app.post('/addedProducts', async (req, res) => {
            const addedProducts = req.body;
            const result = await addedProductsCollection.insertOne(addedProducts);
            res.send(result)
        });
        app.post('/cartList', async (req, res) => {
            const allCartLists = req.body;
            const result = await cartListCollection.insertOne(allCartLists);
            res.send(result)
        });
        app.post('/orderdetails', async (req, res) => {
            const allOrderDetails = req.body;
            const result = await orderDetailsCollection.insertOne(allOrderDetails);
            res.send(result)
        });
        // Delete a single item
        app.delete('/cartList/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: new ObjectId(id) }
            const result = await cartListCollection.deleteOne(query)
            res.send(result)
        })
        app.delete('/orderdetails/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: new ObjectId(id) }
            const result = await orderDetailsCollection.deleteOne(query)
            res.send(result)
        })
        // After placing orders the cart will clear
        app.delete('/clearCart', async (req, res) => {
            try {
                const result = await cartListCollection.deleteMany({});
                res.status(200).json({
                    success: true,
                    deletedCount: result.deletedCount
                });
            } catch (error) {
                res.status(500).json({ success: false, message: 'Failed to clear cart' });
            }
        });

        app.patch('/orderdetails/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: new ObjectId(id) };

            const updateFields = {
                status: req.body.status,
                updatedAt: req.body.updatedAt,
            };

            const update = { $set: updateFields };

            const result = await orderDetailsCollection.updateOne(query, update);
            res.send(result);
        });

        app.patch('/addedProducts/:id', async (req, res) => {
            try {
                const id = req.params.id;
                const query = { _id: new ObjectId(id) };
                const update = {
                    $set: {
                        totalSizes: req.body.openingStock,
                        leftProducts: req.body.closingStock,
                        sizes: req.body.sizeValues,
                        modified: req.body.modified
                    }
                };
                const result = await addedProductsCollection.updateOne(query, update);
                res.send(result);
            } catch (error) {
                console.error('Error updating product:', error);
                res.status(500).send({ error: 'Internal server error' });
            }
        });
    }
    finally { }
}
run().catch(console.dir);

app.get('/', (req, res) => {
    res.send('Gamerskit - Backend - Saif Sultan Mizan')
})

app.listen(port, () => {
    console.log(`Example app listening on port ${port}`)
})