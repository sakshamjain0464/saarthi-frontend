import { Client, Account, Databases } from 'appwrite'

const client = new Client()
client
    .setEndpoint('https://cloud.appwrite.io/v1')// The Appwrite API endpoint
    .setProject('67a78fd50027ee57e719')// Your Appwrite project IDexport const account = new Account(client)

const account = new Account(client)
const databases = new Databases(client);

export { account, databases }