import { Client, Account, OAuthProvider } from 'appwrite'

const client = new Client()
client
    .setEndpoint('https://cloud.appwrite.io/v1')// The Appwrite API endpoint
    .setProject('67a78fd50027ee57e719')// Your Appwrite project IDexport const account = new Account(client)

const account = new Account(client)

export const loginWithGoogle = async () => {
    try {
        await account.createOAuth2Session(OAuthProvider.Google, 'http://localhost:3000')
    } catch (error) {
        console.error(error)
    }
}

export const logoutUser = async () => {
    try {
        await account.deleteSession('current')
    } catch (error) {
        console.error(error)
    }
}

export const getUser = async () => {
    try {
        return await account.get()
    } catch (error) {
        console.error(error)
    }
}

