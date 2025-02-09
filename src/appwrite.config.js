import { Client, Account, OAuthProvider } from 'appwrite'

const client = new Client()
client
    .setEndpoint('https://cloud.appwrite.io/v1')// The Appwrite API endpoint
    .setProject('67a6e45f000203990327')// Your Appwrite project IDexport const account = new Account(client)

const account = new Account(client)

export const loginWithGoogle = async () => {
    try {
        await account.createOAuth2Session(OAuthProvider.Google, 'https://saarthi.naitiktiwari.in/')
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

