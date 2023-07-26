import { MongoClient } from 'mongodb';
const url = 'mongodb://localhost:27017/';
const client = new MongoClient(url);

async function run() {
  try {
    await client.connect();
    const db = client.db('hello');
    const res = await db.command({ ping: 1 });
    console.log('connection established', res);
    const userCollection = db.collection('user');
    const result = await userCollection.insertOne({ name: 'Daisy' });
    console.log(result);
  } catch (e) {
    console.error(e);
  } finally {
    await client.close();
  }
}
run();
