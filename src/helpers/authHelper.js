import { account } from '../appwrite.config'
import { OAuthProvider } from 'appwrite'
import { frontendUrl } from '../env.exports'

export const loginWithGoogle = async () => {
  try {
    // await account.createOAuth2Session(
    //   OAuthProvider.Google,
    //   'https://saarthi.naitiktiwari.in/'
    // )
    await account.createOAuth2Session(OAuthProvider.Google, frontendUrl)
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
