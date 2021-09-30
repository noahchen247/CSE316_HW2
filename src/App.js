import React from 'react';
import './App.css';

// IMPORT DATA MANAGEMENT AND TRANSACTION STUFF
import DBManager from './db/DBManager';

// THESE ARE OUR REACT COMPONENTS
import DeleteModal from './components/DeleteModal';
import Banner from './components/Banner.js'
import Sidebar from './components/Sidebar.js'
import Workspace from './components/Workspace.js';
import Statusbar from './components/Statusbar.js'
import jsTPS from './common/jsTPS';
import ChangeItem_Transaction from "./transactions/ChangeItem_Transaction.js"
import MoveItem_Transaction from "./transactions/MoveItem_Transaction.js"

class App extends React.Component {
    constructor(props) {
        super(props);

        // THIS WILL TALK TO LOCAL STORAGE
        this.db = new DBManager();

        // GET THE SESSION DATA FROM OUR DATA MANAGER
        let loadedSessionData = this.db.queryGetSessionData();

        this.tps = new jsTPS();
        this.tps.clearAllTransactions();

        this.closeTest = "top5-button-disabled";
        this.undoTest = "top5-button-disabled";
        this.redoTest = "top5-button-disabled";

        // SETUP THE INITIAL STATE
        this.state = {
            currentList : null,
            listKeyPairMarkedForDeletion: null,
            sessionData : loadedSessionData
        }
    }
    sortKeyNamePairsByName = (keyNamePairs) => {
        keyNamePairs.sort((keyPair1, keyPair2) => {
            // GET THE LISTS
            return keyPair1.name.localeCompare(keyPair2.name);
        });
    }
    // THIS FUNCTION BEGINS THE PROCESS OF CREATING A NEW LIST
    createNewList = () => {
        // FIRST FIGURE OUT WHAT THE NEW LIST'S KEY AND NAME WILL BE
        let newKey = this.state.sessionData.nextKey;
        let newName = "Untitled" + newKey;

        // MAKE THE NEW LIST
        let newList = {
            key: newKey,
            name: newName,
            items: ["?", "?", "?", "?", "?"]
        };

        // MAKE THE KEY,NAME OBJECT SO WE CAN KEEP IT IN OUR
        // SESSION DATA SO IT WILL BE IN OUR LIST OF LISTS
        let newKeyNamePair = { "key": newKey, "name": newName };
        let updatedPairs = [...this.state.sessionData.keyNamePairs, newKeyNamePair];
        this.sortKeyNamePairsByName(updatedPairs);

        // CHANGE THE APP STATE SO THAT IT THE CURRENT LIST IS
        // THIS NEW LIST AND UPDATE THE SESSION DATA SO THAT THE
        // NEXT LIST CAN BE MADE AS WELL. NOTE, THIS setState WILL
        // FORCE A CALL TO render, BUT THIS UPDATE IS ASYNCHRONOUS,
        // SO ANY AFTER EFFECTS THAT NEED TO USE THIS UPDATED STATE
        // SHOULD BE DONE VIA ITS CALLBACK
        this.setState(prevState => ({
            currentList: newList,
            sessionData: {
                nextKey: prevState.sessionData.nextKey + 1,
                counter: prevState.sessionData.counter + 1,
                keyNamePairs: updatedPairs
            }
        }), () => {
            // PUTTING THIS NEW LIST IN PERMANENT STORAGE
            // IS AN AFTER EFFECT
            this.db.mutationCreateList(newList);
        });
    }
    renameList = (key, newName) => {
        let newKeyNamePairs = [...this.state.sessionData.keyNamePairs];
        // NOW GO THROUGH THE ARRAY AND FIND THE ONE TO RENAME
        for (let i = 0; i < newKeyNamePairs.length; i++) {
            let pair = newKeyNamePairs[i];
            if (pair.key === key) {
                pair.name = newName;
            }
        }
        this.sortKeyNamePairsByName(newKeyNamePairs);

        // WE MAY HAVE TO RENAME THE currentList
        let currentList = this.state.currentList;
        if (currentList.key === key) {
            currentList.name = newName;
        }

        this.setState(prevState => ({
            currentList: prevState.currentList,
            sessionData: {
                nextKey: prevState.sessionData.nextKey,
                counter: prevState.sessionData.counter,
                keyNamePairs: newKeyNamePairs
            }
        }), () => {
            // AN AFTER EFFECT IS THAT WE NEED TO MAKE SURE
            // THE TRANSACTION STACK IS CLEARED
            let list = this.db.queryGetList(key);
            list.name = newName;
            this.db.mutationUpdateList(list);
            this.db.mutationUpdateSessionData(this.state.sessionData);
        });
    }
    renameItem = (index, newName) => {
        let newList = this.state.currentList;
        newList.items[index] = newName;
        this.setState(prevState => ({
            currentList: newList,
            sessionData: prevState.sessionData
        }), () => {
            this.db.mutationUpdateList(this.state.currentList);
        });
    }
    // THIS FUNCTION BEGINS THE PROCESS OF LOADING A LIST FOR EDITING
    loadList = (key) => {
        let newCurrentList = this.db.queryGetList(key);
        this.closeTest = "top5-button";
        this.tps.clearAllTransactions();
        this.setState(prevState => ({
            currentList: newCurrentList,
            sessionData: prevState.sessionData
        }), () => {
            // ANY AFTER EFFECTS?
        });
    }
    // THIS FUNCTION BEGINS THE PROCESS OF CLOSING THE CURRENT LIST
    closeCurrentList = () => {
        this.closeTest = "top5-button-disabled";
        this.undoTest = "top5-button-disabled";
        this.redoTest = "top5-button-disabled";
        this.tps.clearAllTransactions();
        this.setState(prevState => ({
            currentList: null,
            listKeyPairMarkedForDeletion : prevState.listKeyPairMarkedForDeletion,
            sessionData: this.state.sessionData
        }), () => {
            // ANY AFTER EFFECTS?
        });
    }
    deleteList = (pair) => {
        // SOMEHOW YOU ARE GOING TO HAVE TO FIGURE OUT
        // WHICH LIST IT IS THAT THE USER WANTS TO
        // DELETE AND MAKE THAT CONNECTION SO THAT THE
        // NAME PROPERLY DISPLAYS INSIDE THE MODAL
        this.showDeleteListModal(pair);
    }
    // THIS FUNCTION SHOWS THE MODAL FOR PROMPTING THE USER
    // TO SEE IF THEY REALLY WANT TO DELETE THE LIST
    showDeleteListModal(pair) {
        let modal = document.getElementById("delete-modal");
        modal.classList.add("is-visible");
        this.setState(prevState => ({
            currentList: this.state.currentList,
            listKeyPairMarkedForDeletion: pair,
            sessionData: prevState.sessionData
        }), () => {
            //???
        });
    }
    // THIS FUNCTION IS FOR HIDING THE MODAL
    hideDeleteListModal() {
        let modal = document.getElementById("delete-modal");
        modal.classList.remove("is-visible");
    }
    moveItem = (oldIndex, newIndex) => {
        let newList = this.state.currentList;
        newList.items.splice(newIndex, 0, newList.items.splice(oldIndex, 1)[0]);
        this.setState(prevState => ({
            currentList: newList,
            sessionData: prevState.sessionData
        }), () => {
            this.db.mutationUpdateList(this.state.currentList);
        });
        //console.log(this.state.currentList.items);
    }
    actuallyDeleteList = () => {
        let indexToDelete = this.state.sessionData.keyNamePairs.indexOf(this.state.listKeyPairMarkedForDeletion);
        this.hideDeleteListModal();
        this.tps.clearAllTransactions();
        if (this.state.currentList !== null && this.state.listKeyPairMarkedForDeletion.key === this.state.currentList.key) {
            let newSessionData = this.state.sessionData;
            newSessionData.keyNamePairs.splice(indexToDelete, 1);
            this.setState(prevState => ({
                currentList: null,
                listKeyPairMarkedForDeletion : null,
                sessionData: newSessionData
            }), () => {
                // ANY AFTER EFFECTS?
            });
        }
        else {
            let newSessionData = this.state.sessionData;
            newSessionData.keyNamePairs.splice(indexToDelete, 1);
            this.setState(prevState => ({
                currentList: prevState.currentList,
                listKeyPairMarkedForDeletion : null,
                sessionData: newSessionData
            }), () => {
                // ANY AFTER EFFECTS?
            });
        }
    }
    undo = () => {
        console.log("undo");
        if (this.tps.hasTransactionToUndo()) {
            this.tps.undoTransaction();
            this.updateUndoRedo();
        }
    }
    redo = () => {
        console.log("redo");
        if (this.tps.hasTransactionToRedo()) {
            this.tps.doTransaction();
            this.updateUndoRedo();
        }
    }
    updateUndoRedo = () => {
        let checkTPS = this.tps;
        if(!checkTPS.hasTransactionToUndo()) {
            this.undoTest="top5-button-disabled";
        }
        else {
            this.undoTest="top5-button";
        }
        if(!checkTPS.hasTransactionToRedo()) {
            this.redoTest="top5-button-disabled";
        }
        else {
            this.redoTest="top5-button";
        }
    }
    addChangeItemTransaction = (id, newText) => {
        // GET THE CURRENT TEXT
        let oldText = this.state.currentList.items[id];
        let transaction = new ChangeItem_Transaction(this, id, oldText, newText);
        this.tps.addTransaction(transaction);
        this.updateUndoRedo();
    }
    addMoveItemTransaction = (oldIndex, newIndex) => {
        let transaction = new MoveItem_Transaction(this, oldIndex, newIndex);
        this.tps.addTransaction(transaction);
        this.updateUndoRedo();
    }
    render() {
        return (
            <div id="app-root">
                <Banner 
                    title='Top 5 Lister'
                    closeCallback={this.closeCurrentList}
                    undoCallback={this.undo}
                    redoCallback={this.redo} 
                    close={this.closeTest}
                    undo={this.undoTest}
                    redo={this.redoTest}
                />
                <Sidebar
                    heading='Your Lists'
                    currentList={this.state.currentList}
                    keyNamePairs={this.state.sessionData.keyNamePairs}
                    createNewListCallback={this.createNewList}
                    deleteListCallback={this.deleteList}
                    loadListCallback={this.loadList}
                    renameListCallback={this.renameList}
                />
                <Workspace
                    currentList={this.state.currentList} 
                    renameItemCallback={this.renameItem}
                    moveItemCallback={this.moveItem}
                    addChangeItemTransactionCallback={this.addChangeItemTransaction}
                    addMoveItemTransactionCallback={this.addMoveItemTransaction}
                />
                <Statusbar 
                    currentList={this.state.currentList} />
                <DeleteModal
                    listKeyPair={this.state.listKeyPairMarkedForDeletion}
                    hideDeleteListModalCallback={this.hideDeleteListModal}
                    actuallyDeleteListCallback={this.actuallyDeleteList}
                />
            </div>
        );
    }
}

export default App;
