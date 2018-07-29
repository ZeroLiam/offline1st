import React, { Component } from 'react';
import logo from './logo.svg';
import './App.css';

import * as RxDB from 'rxdb';
import { QueryChangeDetector } from 'rxdb';
import { schema } from './lib/Schema';

//Declare as constants the URL of the remote database and the name of the local database:
import remdb from './lib/remdb';

import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
// The following line is not needed for react-toastify v3, only for v2.2.1
//import 'react-toastify/dist/ReactToastify.min.css';
import * as moment from 'moment';

//optimizes observed queries by getting new results from database events instead
QueryChangeDetector.enable();
QueryChangeDetector.enableDebugging();

//use IndexDB as the storage engine
RxDB.plugin(require('pouchdb-adapter-idb'));
RxDB.plugin(require('pouchdb-adapter-http'));

class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      newMessage: '', messages: []
    };
    this.subs = [];
    this.addMessage = this.addMessage.bind(this);
    this.handleMessageChange = this.handleMessageChange.bind(this);
  }

  async componentDidMount() {
    this.db = await this.createDatabase();
  
  
    const sub = 
      this.db.messages.find().sort({id: 1}).$.subscribe(messages => {
      if (!messages)
        return;
      toast('Reloading messages');
      this.setState({messages: messages});
    });
    this.subs.push(sub);
  }

  componentWillUnmount() {
    this.subs.forEach(sub => sub.unsubscribe());
  }


  async createDatabase() {
    const db = await RxDB.create(
      {name: remdb.dbName, adapter: 'idb', password: '12345678'}
    );

    /*Next, we enable the leader-election algorithm which makes sure that
      always exactly one tab is managing the remote data access (in case there are
      multiple tabs of the application at the same time). When the leader is
      elected, a crown will be shown next to the page’s title: */
      db.waitForLeadership().then(() => {
        document.title = '♛ ' + document.title;
      });

      //Then, we create the messages collection passing the schema:
      // create collection
    const messagesCollection = await db.collection({
      name: 'messages',
      schema: schema
    });

    // set up replication
    const replicationState = 
      messagesCollection.sync({ remote: remdb.syncURL + remdb.dbName + '/' });
    this.subs.push(
      replicationState.change$.subscribe(change => {
        toast('Replication change');
        console.dir(change)
      })
    );
    this.subs.push(
    replicationState.docs$.subscribe(docData => console.dir(docData))
    );
    this.subs.push(
      replicationState.active$.subscribe(active => toast(`Replication active: ${active}`))
    );
    this.subs.push(
      replicationState.complete$.subscribe(completed => toast(`Replication completed: ${completed}`))
    );
    this.subs.push(
      replicationState.error$.subscribe(error => {
        toast('Replication Error');
        console.dir(error)
      })
    );

    return db;
  }

  async addMessage() {
    const id = Date.now().toString();
    const newMessage = {id, message: this.state.newMessage};
  
    await this.db.messages.insert(newMessage);
  
    this.setState({newMessage: ''});
  }

  renderMessages() {
    return this.state.messages.map(({id, message}) => {
      const date = moment(id, 'x').fromNow();
      return (
        <div key={id}>
          <p>{date}</p>
          <p>{message}</p>
          <hr/>
        </div>
      );
    });
  }

  handleMessageChange(event) {
    this.setState({newMessage: event.target.value});
  }

  render() {
    return (
      <div className="App">
        <ToastContainer autoClose={3000} />
        
        <div className="App-header">
          <img src={logo} className="App-logo" alt="logo" />
          <h2>Welcome to React</h2>
        </div>
  
        <div>{this.renderMessages()}</div>
  
        <div id="add-message-div">
          <h3>Add Message</h3>
          <input type="text" placeholder="Message" value={this.state.newMessage}
            onChange={this.handleMessageChange} />
          <button onClick={this.addMessage}>Add message</button>
        </div>
      </div>
    );
  }
}

export default App;
