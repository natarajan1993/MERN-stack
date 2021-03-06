import React, {
  Fragment,
  useEffect
} from 'react';
import './App.css';
import Landing from './components/layout/Landing'
import Navbar from './components/layout/Navbar'
import Register from './components/auth/Register'
import Login from './components/auth/Login'
import {BrowserRouter as Router, Route, Switch} from 'react-router-dom'
import {Provider} from 'react-redux';
import store from './store'
import Alert from './components/layout/Alert'
import Dashboard from './components/dashboard/Dashboard'
import CreateProfile from './components/profile-form/CreateProfile'
import EditProfile from './components/profile-form/EditProfile'
import AddExperience from './components/profile-form/AddExperience'
import AddEducation from './components/profile-form/AddEducation'
import Profiles from './components/profiles/Profiles'
import Profile from './components/profile/Profile'
import PrivateRoute from './components/routing/PrivateRoute'
import {loadUser} from './actions/auth'
import setAuthToken from './utils/setAuthToken'

if (localStorage.token){
  setAuthToken(localStorage.token)
}

// Every time page is loaded, user is loaded
const App = () =>{
  useEffect(() => {
    store.dispatch(loadUser())
  }, []); // Life cycle method equivalent for React Hooks which will run once when loaded. By default runs continuosly but overrided by adding [] at the end. Hooks let you use state and other class exclusive features without using a class

  return (
  <Provider store={store}>
    <Router>
      <Fragment>
        <Navbar />
        <Route exact path ='/' component={Landing}></Route>
        <section className="container">
          <Alert/>
          <Switch>
            <Route exact path ='/register' component={Register}></Route>
            <Route exact path ='/login' component={Login}></Route>
            <Route exact path ='/profiles' component={Profiles}></Route>
            <Route exact path ='/profile/:id' component={Profile}></Route>
            <PrivateRoute exact path ='/dashboard' component={Dashboard}></PrivateRoute>
            <PrivateRoute exact path ='/create-profile' component={CreateProfile}></PrivateRoute>
            <PrivateRoute exact path ='/edit-profile' component={EditProfile}></PrivateRoute>
            <PrivateRoute exact path ='/add-experience' component={AddExperience}></PrivateRoute>
            <PrivateRoute exact path ='/add-education' component={AddEducation}></PrivateRoute>
          </Switch>
        </section>
      </Fragment>
    </Router>
  </Provider>
)};
export default App;