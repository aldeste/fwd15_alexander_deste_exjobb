// @flow
import React from "react";
import Wrapper from "./Tags/Wrapper";
import DocumentTitle from "./Document/Title";
import Login from "./Login/Login";
import Welcome from "./Welcome/Welcome";
import { Map, type Map as ImmutableMap } from "immutable";
import Ping from "./PingTest/Ping";

type MessageEventWithOptions = {
  ...MessageEvent,
  data: { type: string, data: string }
};

type State = {
  signedIn: ImmutableMap<string, ImmutableMap<string, string>>
};

class App extends React.Component<*, State, *> {
  state = {
    signedIn: Map()
  };

  receiveMessage = (event: MessageEventWithOptions): boolean => {
    if (
      event.origin === "http://localhost:4000" &&
      event.data.type === "AuthVerificationConnection"
    ) {
      // this.setState(() => ({ user: event.data.data }));
      console.log(event.data.data);
      return true;
    }

    return false;
  };

  handleLogin = (formName: string): Function => (props: Object): void => {
    this.setState(() => ({
      signedIn: this.state.signedIn.set(formName, Map(props))
    }));
  };

  handleLogOut = (logoutName: string): Function => (
    event: SyntheticEvent
  ): void => {
    this.setState(() => ({
      signedIn: this.state.signedIn.remove(logoutName)
    }));
  };

  componentDidMount() {
    window && window.addEventListener("message", this.receiveMessage, false);
  }

  shouldComponentUpdate(nextState: State) {
    return this.state.signedIn !== nextState.signedIn;
  }

  render() {
    const UserBases: Array<string> = ["StarWars", "StarTrek"];
    const { signedIn } = this.state;
    const token: number = Math.ceil(Math.random() * 50);

    return (
      <Wrapper>
        <DocumentTitle>This is a demo page</DocumentTitle>
        {UserBases.some(userBase => signedIn.has(userBase)) &&
          <p>{JSON.stringify(signedIn, null, 2)}</p>}
        <Ping token={token} />
        {UserBases.map(
          part =>
            signedIn.has(part)
              ? <Welcome
                  key={part}
                  title={`${part.replace(/([a-z])([A-Z])/g, "$1 $2")} user logged in!`}
                  username={signedIn.getIn([part, "name"])}
                  onLogoutSubmit={this.handleLogOut(part)}
                />
              : <Login
                  key={part}
                  title={`${part.replace(/([a-z])([A-Z])/g, "$1 $2")} login`}
                  onLoginSubmit={this.handleLogin(part)}
                />
        )}
      </Wrapper>
    );
  }
}

export default App;
