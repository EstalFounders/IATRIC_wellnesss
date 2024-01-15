import { signIn } from "next-auth/react"

export const loginUser = async ({email, password}) => {
    console.log('login user console')
    const res = await signIn('credentials',{
        redirect: false,
        email,
        password
    })

    return res
}