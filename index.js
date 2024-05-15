const express = require('express');
const cors = require('cors');
require('dotenv').config();
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const multer = require('multer');
const { Readable } = require('stream');
const app = express();
const port = process.env.PORT || 5000;

const upload = multer({
  dest: 'uploads/', // Adjust destination folder as needed
  fileFilter: (req, file, cb) => {
    const allowedFileTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
    if (allowedFileTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only PDF or DOC files are allowed.'));
    }
  }
});

// Middleware
app.use(cors({
  origin: ["http://localhost:5173",
    "http://localhost:5000",
    "https://online-group-study-d5764.web.app",
    "https://online-group-study-d5764.firebaseapp.com",
    "https://online-group-study-server-sepia.vercel.app",
    "https://online-group-study-server-66irkm0h6-humayra-amins-projects.vercel.app"],
}));
app.use(express.json());

// MongoDB setup
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.9jkswbp.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

// Connect to MongoDB
async function run() {
  try {
    // await client.connect();
    // console.log("Connected to MongoDB!");

    const assignmentCollection = client.db('AssignmentDB').collection('assignment');
    const submissionCollection = client.db('AssignmentDB').collection('submission');



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
    });

    // app.get('/myAssignment/:email', async (req, res) => {
    //   const email = req.params.email;
    //   const query = { email: email };
    //   const cursor = submissionCollection.find(query);
    //   const results = await cursor.toArray();
    //   res.send(results);
    // });



    // for create
    app.post('/assignments', async (req, res) => {
      const newAssignment = req.body;
      console.log(newAssignment);
      const result = await assignmentCollection.insertOne(newAssignment);
      res.send(result);
    })


    app.post('/submit-assignment', upload.single('pdfFile'), async (req, res) => {
      try {
        const { assignmentId, quickNote, userEmail } = req.body;
        const pdfFile = req.file;

        if (!assignmentId || !pdfFile || !quickNote || !userEmail) {
          return res.status(400).json({ error: 'Missing required fields' });
        }

        const fileBuffer = req.file.buffer;

        const submission = {
          assignmentId: new ObjectId(assignmentId),
          pdfFile: fileBuffer,
          quickNote,
          userEmail,
          status: 'pending'
        };
        const result = await submissionCollection.insertOne(submission);

        res.status(200).json({ message: 'Assignment submitted successfully!' });
      } catch (error) {
        console.error('Error submitting assignment:', error);
        res.status(500).json({ error: 'Failed to submit assignment' });
      }
    });



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
    });


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