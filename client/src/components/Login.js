import { useAuth0 } from '@auth0/auth0-react';

export function Login() {
    const { loginWithRedirect } = useAuth0();

    return (
        <>
            <h1>Please Log In</h1>
            <button onClick={loginWithRedirect}>Click Here to Log In</button>
        </>
    );
}
