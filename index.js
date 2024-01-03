require('dotenv').config();
const express = require('express');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const port = process.env.PORT || 5000;
const app = express();
const cors = require('cors');

//middleware
app.use(cors());
app.use(express.json());


const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.fc0zsls.mongodb.net/?retryWrites=true&w=majority`;
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

async function run() {
  try {
    const AvailableCollection = client.db('PetHouse').collection('AvaiablePets');
    const BlogsCollection = client.db('PetHouse').collection('Blogs');
    // Get all data from taskCollection
    app.get('/avaiable-pets', async (req, res) => {
      const cursor = AvailableCollection.find();
      const result = await cursor.toArray();
      res.send(result);
    })
    // Get all data from taskCollection
    app.get('/blogs', async (req, res) => {
      const cursor = BlogsCollection.find();
      const result = await cursor.toArray();
      res.send(result);
    })

    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {
  }
}
run().catch(console.dir);


app.get('/', (req, res) => {
  res.send('Task Management server is running');
});

app.listen(port, () => {
  console.log(`Task Management server is running on port ${port}`);
});