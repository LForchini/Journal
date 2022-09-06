import './App.css';
import { useAuth0 } from '@auth0/auth0-react';

import { Loading } from './components/Loading';
import { Login } from './components/Login';
import { Entries } from './components/Entries';

function App() {
    const { isLoading, isAuthenticated } = useAuth0();

    return (
        <div className="App">
            {isLoading ? (
                <Loading />
            ) : isAuthenticated ? (
                <Entries />
            ) : (
                <Login />
            )}
        </div>
    );
}

export default App;
