import React from 'react';
import { Text, View,StyleSheet,FlatList,TouchableOpacity,TextInput} from 'react-native';
import db from '../Config';
import TransactionScreen from './BookTransactionScreen';
export default class Searchscreen extends React.Component {
  constructor(props){
    super(props);
    this.state = {
      allTransactions :[],
      lastVisibleTransaction:null,
      search:" "

    }
  }
  componentDidMount(){
const query = db.collection('transactions').get()
query.docs.map(doc => {
  this.setState({
allTransactions:[...this.state.allTransactions,doc.data()]
  })
})
  }
  searchTransaction = async(text)=> {
var enteredText = text.split('')
if(enteredText[0].toUpperCase()==='B'){
  const transaction = db.collection('transactions').where('bookID','==',text).get()
 TransactionScreen.docs.map(doc => {
   this.setState({
    allTransactions:[...this.state.allTransactions,doc.data()],
    lastVisibleTransaction:doc
   })
 })
}
else if(enteredText[0].toUpperCase()==='S'){
  const transaction = db.collections('transactions').where('studentID','==',text).get()
  TransactionScreen.docs.map(doc => {
    this.setState({
     allTransactions:[...this.state.allTransactions,doc.data()],
     lastVisibleTransaction:doc
    })
  })
 
}
  }
  fetchMoreTransactions = async()=> {
    var text = this.state.search.toUpperCase()
    var enteredText = text.split()
    if(enteredText[0].toUpperCase()==='B'){
      const transaction = db.collection('transactions').where('bookID','==',text).startAfter(this.state.lastVisibleTransaction).limit(10).get()
     TransactionScreen.docs.map(doc => {
       this.setState({
        allTransactions:[...this.state.allTransactions,doc.data()],
        lastVisibleTransaction:doc
       })
     })
    }
    else if(enteredText[0].toUpperCase()==='S'){
      const transaction = db.collections('transactions').where('studentID','==',text).startAfter(this.state.lastVisibleTransaction).limit(10).get()
      TransactionScreen.docs.map(doc => {
        this.setState({
         allTransactions:[...this.state.allTransactions,doc.data()],
         lastVisibleTransaction:doc
        })
      })
     
    }
  }
    render() {
      return (
        <View>
     <TextInput 
     placeholder =  'studentID'
     onChangeText = {(text)=> {
       this.setState({
         search:text
       })
     }}
     />
     <TouchableOpacity>
<Text>search</Text>

     </TouchableOpacity>
     <FlatList
     data = {this.state.transactions}
     renderItem = {({item})=> (
       <View>
<Text>{item.bookID}</Text>
<Text>{item.studentID}</Text>
<Text>{item.transactionType}</Text>
<Text>{item.date.toDate()}</Text>
       </View>
     )}
      keyExtractor = {(item,index)=> index.toString()}
      
     />
        </View>
      );
    }
  }