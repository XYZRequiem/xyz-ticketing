import buildClient from '../api/build-client';

const LandingPage = ({ currentUser }) => {
    const signedInMessage = <h1>You are signed in</h1>;
    const notSignedInMessage = <h1>You are not signed in</h1>;
    return currentUser ? signedInMessage : notSignedInMessage;
};

LandingPage.getInitialProps = async (context) => {
    const client = buildClient(context);
    const currentUserRoute = '/api/users/currentuser';

    const { data } = await client.get(currentUserRoute);
    return data;
};

export default LandingPage;
