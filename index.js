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
    const BookmarkCollection = client.db('PetHouse').collection('Bookmarks');
    const AdoptedCollection = client.db('PetHouse').collection('Adopted');

    //POST

    //insert data in the AdoptedCollection
    app.post('/adoptions', async (req, res) => {
      const AdoptedPost = req.body;
      try {
        const existingPost = await AdoptedCollection.findOne({ _id: AdoptedPost._id });
        if (existingPost) {
          res.status(200).send({ error: 'You have already adopted this post.' });
        } else {
          const result = await AdoptedCollection.insertOne(AdoptedPost);
          res.status(200).send(result);
        }
      } catch (error) {
        res.status(500).send('Internal Server Error');
      }
    });
    
    

    // insert blog in the BlogsCollection
    app.post('/blogs', async (req, res) => {
      const blog = req.body;
      console.log(blog);
      const result = await BlogsCollection.insertOne(blog);
      res.send(result);
    })

    // insert POST in the BookmarkCollection
    app.post('/bookmarks', async (req, res) => {
      try {
        const bookmark = req.body;
        const result = await BookmarkCollection.insertOne(bookmark);
        res.status(201).json({ success: true, message: 'Bookmark added successfully', insertedId: result.insertedId });
      } catch (error) {
        console.error('Error adding bookmark:', error);
        res.status(500).json({ success: false, message: 'Internal Server Error' });
      }
    });



    //GET
    // Get all data from AdoptedCollection
    app.get('/adoptions', async (req, res) => {
      const cursor = AdoptedCollection.find();
      const result = await cursor.toArray();
      res.send(result);
    });


    // Get single data from AdoptedCollection by id
    app.get('/adoptions/:id', async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) }
      const result = AdoptedCollection.findOne(query)
      res.send(result);
    })

    // Get all data from AvailableCollection
    app.get('/avaiable-pets', async (req, res) => {
      const cursor = AvailableCollection.find();
      const result = await cursor.toArray();
      res.send(result);
    })

    //Get single data from AvailableCollection
    app.get('/avaiable-pets/:id', async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) }
      const result = await AvailableCollection.findOne(query)
      res.send(result);
    })

    // Get all data from BlogsCollection
    app.get('/blogs', async (req, res) => {
      const cursor = BlogsCollection.find();
      const result = await cursor.toArray();
      res.send(result);
    })
    // Get all data from BlogsCollection
    app.get('/bookmarks', async (req, res) => {
      const cursor = BookmarkCollection.find();
      const result = await cursor.toArray();
      res.send(result);
    })

    // bookmarks that matches email with user email
    // app.get('/bookmarks', async (req, res) => {
    //   try {
    //     const userEmail = req.query.BookmarkerEmail;
    //     console.log('User Email:', userEmail);

    //     const cursor = BookmarkCollection.find({ BookmarkerEmail: userEmail });
    //     const bookmarks = await cursor.toArray();
    //     console.log('Fetched Bookmarks:', bookmarks);

    //     res.json(bookmarks);
    //   } catch (error) {
    //     console.error('Error fetching bookmarks:', error);
    //     res.status(500).json({ success: false, message: 'Internal Server Error' });
    //   }
    // });




    //DELETE

    // delete post from BlogsCollection
    app.delete('/blogs/:id', async (req, res) => {
      try {
        const id = req.params.id;
        console.log(id);
        const query = { _id: new ObjectId(id) };
        const result = await BlogsCollection.deleteOne(query);
        res.send(result);
      } catch (error) {
        console.error('Error deleting the task:', error);
        res.status(500).send({ error: 'Internal Server Error' });
      }
    });


    // Remove a bookmark for a specific user and post
    app.delete('/bookmarks/:postId/:userEmail', async (req, res) => {
      try {
        const { postId, userEmail } = req.params;
        // Find and delete the bookmark where postId and BookmarkerEmail match
        const result = await BookmarkCollection.deleteOne({ postId, BookmarkerEmail: userEmail });
        if (result.deletedCount > 0) {
          res.json({ success: true, message: 'Bookmark removed successfully' });
        } else {
          res.status(404).json({ success: false, message: 'Bookmark not found' });
        }
      } catch (error) {
        console.error('Error removing bookmark:', error);
        res.status(500).json({ success: false, message: 'Internal Server Error' });
      }
    });


    //UPDATE & PATCH

    // Update a specific field in the blog post
    app.patch('/blogs/:id', async (req, res) => {
      try {
        const postID = req.params.id;
        const updatedData = req.body;
        const query = { _id: new ObjectId(postID) };
        const update = { $set: updatedData };

        const result = await BlogsCollection.updateOne(query, update);

        if (result.modifiedCount > 0) {
          const updatedDocument = await BlogsCollection.findOne(query);
          console.log('Updated Blog Post:', updatedDocument);

          res.status(200).json({ message: 'Blog post updated successfully', modifiedCount: result.modifiedCount });
        } else {
          res.status(404).json({ error: 'Blog post not found' });
        }
      } catch (error) {
        console.error('Error updating blog post:', error);
        res.status(500).json({ error: 'Internal Server Error' });
      }
    });
    //Increment ReactCount
    app.patch('/blogs/incReactCount/:id', async (req, res) => {
      try {
        const postID = req.params.id;
        const query = { _id: new ObjectId(postID) };
        const blogPost = await BlogsCollection.findOne(query);
        if (!blogPost) {
          return res.status(404).json({ success: false, message: 'Blog not found' });
        }
        // Check if the blog has the reactCount field
        if (!blogPost.reactCount) {
          blogPost.reactCount = 1; // Set to 1 if the field doesn't exist
        } else {
          blogPost.reactCount += 1; // Increment by 1 if the field exists
        }
        await BlogsCollection.updateOne(query, { $set: { reactCount: blogPost.reactCount } });
        res.json({ success: true, message: 'React count updated successfully', reactCount: blogPost.reactCount });
      }
      catch (error) {
        console.error('Error updating blog post:', error);
        res.status(500).json({ error: 'Internal Server Error' });
      }
    });
    //Decrement ReactCount
    app.patch('/blogs/decReactCount/:id', async (req, res) => {
      try {
        const postID = req.params.id;
        const query = { _id: new ObjectId(postID) };
        const blogPost = await BlogsCollection.findOne(query);
        if (!blogPost) {
          return res.status(404).json({ success: false, message: 'Blog not found' });
        }
        if (!blogPost.reactCount == 0) {
          blogPost.reactCount -= 1;
        } else {
          blogPost.reactCount = 0;
        }
        await BlogsCollection.updateOne(query, { $set: { reactCount: blogPost.reactCount } });
        res.json({ success: true, message: 'React count updated successfully', reactCount: blogPost.reactCount });
      }
      catch (error) {
        console.error('Error updating blog post:', error);
        res.status(500).json({ error: 'Internal Server Error' });
      }
    });






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