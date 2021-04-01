import { VercelRequest, VercelResponse } from '@vercel/node'
import { MongoClient, Db } from 'mongodb'
import url from 'url';

let cachedDb: Db = null;

async function connectToDataBase(uri: string) {
    if (cachedDb) {
        return cachedDb;
    }

    const client = await MongoClient.connect(uri, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
    })

    const dbName = url.parse(uri).pathname.substr(1);

    const db = client.db(dbName);

    return db;
}

export default async (request: VercelRequest, response: VercelResponse) => {
    const { email } = request.body;

    const db = await connectToDataBase(process.env.MONGODB_URI);

    const collection = db.collection('subscribers');

    await collection.insertOne({
        email,
        subscribedAt: new Date(),
    })

    return response.status(201).json({ message: true });
}