import React, { Component } from 'react';
import { Route } from 'react-router-dom';
import { Home, EditInfo, Mileage, Purchase, Return,
         Review, ReviewWrite, Wish, ImgTab } from './pages';


class App extends Component {

  render() {
    return (
      <div className="App">
        <Route exact path="/users" component={Home} />
        <Route exact path="/users/edit" component={EditInfo} />
        <Route exact path="/users/mlg" component={Mileage} />
        <Route exact path="/users/purchase" component={Purchase} />
        <Route exact path="/users/return" component={Return} />
        <Route exact path="/users/review" component={Review} />
        <Route exact path="/users/wish" component={Wish} />
        <Route exact path="/users/imgtab" component={ImgTab} />
        <Route exact path="/users/rvwrite/:listId" component={ReviewWrite} />
      </div>
    );
  }
}

export default App;
