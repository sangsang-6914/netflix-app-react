import {BrowserRouter as Router, Switch, Route} from 'react-router-dom'
import Header from './Components/Header';
import Home from './Routes/Home';
import Search from './Routes/Search';
import Test from './Routes/Test';
import Tv from './Routes/Tv';

function App() {
  return (
    <Router>
      <Header />
      <Switch>
        <Route path={["/tv", "/tv/:tvId"]}>
          <Tv />
        </Route>
        <Route path={["/search", "/search/:contentId"]}>
          <Search />
        </Route>
        <Route path="/test">
          <Test />
        </Route>
        <Route path={["/", "/movies/:movieId"]}>
          <Home />
        </Route>
      </Switch>
    </Router>
  );
}

export default App;
