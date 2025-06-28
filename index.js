const express = require('express')
const cors = require('cors')
require('dotenv').config()

const port = process.env.PORT || 5000
const app = express()

// middlewares 
app.use(express.json())
app.use(
  cors({
  origin: ["http://localhost:5173", "https://blue-craft-auth.firebaseapp.com"],
  })
)


const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@blue-crafts.m7emkjn.mongodb.net/?retryWrites=true&w=majority&appName=blue-crafts`;

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
        // Send a ping to confirm a successful connection
        // await client.db("admin").command({ ping: 1 });
        console.log("Pinged your deployment. You successfully connected to MongoDB!");


    const craftsCollection = client.db('Art_and_craft_store').collection('arts&crafts')
    const subcategoriesCollection = client.db('Art_and_craft_store').collection('subcategories')

  

    app.get('/subcategories',async(req,res)=>{
      const allCategoires = await subcategoriesCollection.find().toArray()
      res.send(allCategoires)
    })

    app.get('/craftitems',async(req,res)=>{
          const allItems = await craftsCollection.find().limit(6).toArray()
          res.send(allItems)
    })

    app.get('/allcrafts',async(req,res)=>{
      const allItems = await craftsCollection.find().toArray()
      res.send(allItems)
  })

    app.get('/craftitem/:id',async(req,res)=>{
          const {id} = req.params
          const objId = new ObjectId(id)
          const craftItem = await craftsCollection.findOne(objId)
          res.send(craftItem)
    })

    app.get('/mycrafts/:userId/:customized',async(req,res)=>{
        const {userId,customized} = req.params

        if(customized==='customized-yes'){
          const myCrafts = await craftsCollection.aggregate([{$match: {userId, customization:'Yes'}}]).toArray()
          res.send(myCrafts)
        }
        if(customized === 'customized-no'){
          const myCrafts = await craftsCollection.aggregate([{$match: {userId, customization:'No'}}]).toArray()
          res.send(myCrafts)
        }
        if(customized === 'all'){
          const myCrafts = await craftsCollection.aggregate([{$match: {userId}}]).toArray()
          res.send(myCrafts)
        }
       
       
    })

    app.get('/artsAndCrafts/:subcategory',async(req,res)=>{
        const {subcategory} = req.params
        const getSubcategoryItems = await craftsCollection.aggregate([{$match: {subcategoryName:subcategory}}]).toArray()
        res.send(getSubcategoryItems)
    })

    app.post('/crafts',async(req,res)=>{
          const craftData = req.body
          const addItem = await craftsCollection.insertOne(craftData)
          res.send(addItem)
    })

    app.put('/crafts',async(req,res)=>{
          const {formData,id} = req.body
          const objId = new ObjectId(id)
          const options = {uprest:true}
          const craftItem = {
             $set:{
             image: formData.image,
             itemName: formData.itemName,
             subcategoryName: formData.subcategoryName,
             shortDescription: formData.shortDescription,
             price: formData.price,
             rating: formData.rating,
             customization: formData.customization,
             processingTime: formData.processingTime,
             stockStatus: formData.stockStatus,
             }
          }
          const addItem = await craftsCollection.updateOne({_id:objId},craftItem,options)
          res.send(addItem)
    })

    app.delete('/craftitem/:id',async(req,res)=>{
      const {id} = req.params
      const objId = new ObjectId(id)
      const deleteItem = await craftsCollection.deleteOne({_id:objId})
      res.send(deleteItem)
    })

  } finally {
        // Ensures that the client will close when you finish/error
        // await client.close();
  }
}
run().catch(console.dir);

app.get('/',(req,res)=>{
  res.send("Blue Crafts page's server running")
})



app.listen(port,()=>{
    console.log(`listening on port ${port}`)
})

