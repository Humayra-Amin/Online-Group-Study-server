const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken')
require('dotenv').config();
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const app = express();
const port = process.env.PORT || 5000;


//middleware
app.use(cors({
  origin: ["http://localhost:5173",
    "http://localhost:5000",
    "https://online-group-study-d5764.web.app",
    "https://online-group-study-server-sepia.vercel.app"],
  credentials: true,
}));
app.use(express.json());



const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.9jkswbp.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;


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


    const assignmentCollection = client.db('AssignmentDB').collection('assignment');

    // auth related api
    


    // To get data
    app.get('/assignments', async (req, res) => {
      const cursor = assignmentCollection.find();
      const result = await cursor.toArray();
      res.send(result);
    })


    // for update
    app.get('/assignments/:_id', async (req, res) => {
      const _id = req.params._id;
      const query = { _id: new ObjectId(_id) }
      const result = await assignmentCollection.findOne(query);
      res.send(result);
    })


    // for create
    app.post('/assignments', async (req, res) => {
      const newAssignment = req.body;
      console.log(newAssignment);
      const result = await assignmentCollection.insertOne(newAssignment);
      res.send(result);
    })


    // to update
    app.put('/assignments/:_id', async (req, res) => {
      const _id = req.params._id;
      const filter = { _id: new ObjectId(_id) }
      const options = { upsert: true };
      const updatedAssignments = req.body;
      const assignments = {
        $set: {
          title: updatedAssignments.title,
          description: updatedAssignments.description,
          image: updatedAssignments.image,
          marks: updatedAssignments.marks,
          difficultyLevel: updatedAssignments.difficultyLevel,
        }
      }
      const result = await assignmentCollection.updateOne(filter, assignments, options);
      res.send(result);
    })


    // for delete
    app.delete('/assignments/:_id', async (req, res) => {
      const _id = req.params._id;
      const query = { _id: new ObjectId(_id) }
      const result = await assignmentCollection.deleteOne(query);
      res.send(result);
    })




    // Send a ping to confirm a successful connection
    // await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);



app.get('/', (req, res) => {
  res.send('Server Started')
})

app.listen(port, () => {
  console.log(`Server started on http://localhost: ${port}`)
})