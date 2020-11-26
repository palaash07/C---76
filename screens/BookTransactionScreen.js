import React from 'react';
import { Text, View, TouchableOpacity, TextInput, Image, StyleSheet, Alert,KeyboardAvoidingView, ToastAndroid} from 'react-native';
import * as Permissions from 'expo-permissions';
import { BarCodeScanner } from 'expo-barcode-scanner';
import * as firebase from 'firebase';
import db from '../Config';
import { AccessibilityInfo } from 'react-native';
 

export default class TransactionScreen extends React.Component {
    constructor(){
      super();
      this.state = {
        hasCameraPermissions: null,
        scanned: false,
        scannedBookId: '',
        scannedStudentId:'',
        buttonState: 'normal'
      }
    }

    getCameraPermissions = async (id) =>{
      const {status} = await Permissions.askAsync(Permissions.CAMERA);
      
      this.setState({
        /*status === "granted" is true when user has granted permission
          status === "granted" is false when user has not granted the permission
        */
        hasCameraPermissions: status === "granted",
        buttonState: id,
        scanned: false
      });
    }

    handleBarCodeScanned = async({type, data})=>{
      const {buttonState} = this.state

      if(buttonState==="BookId"){
        this.setState({
          scanned: true,
          scannedBookId: data,
          buttonState: 'normal'
        });
      }
      else if(buttonState==="StudentId"){
        this.setState({
          scanned: true,
          scannedStudentId: data,
          buttonState: 'normal'
        });
      }
      
    }
handleTransaction = async () => {
  var transactionType = await this.checkBookEligibility()
 if(!transactionType){
   Alert.alert('The Book does not exist');
   this.setState({
     scannedStudentId:" ",
     scannedBookId:" ",
   })
 }
 else if(transactionType === "Issue"){
   var isStudentEligible = await this.checkisStudentEligibilityForBookIssue()
   if(isStudentEligible){
     this.initiateBookIssue();
     Alert.alert('Book Issued to the Student');
   }
   else{
     var isStudentEligible = await this.checkisStudentEligibilityForBookReturn()
     if(isStudentEligible){
       this.initiateBookReturn();
       Alert.alert('Book returned');
     }
   }
 }


}
initiateBookIssue = async() => {
  db.collection("transactions").add({
    "studentID":this.state.scannedStudentId,
    "bookID":this.state.scannedBookId,
    "date":firebase.firestore.Timestamp.now().toDate(),
    "transactionType":"Issued"
  })
  db.collection("Books").doc(this.state.scannedBookId).update({
    "bookAvailabilty":false
  })
  db.collection("Students").doc(this.state.scannedStudentId).update({
    "No.ofbookIssued":firebase.firestore.FieldValue.increment(1)
  })
  Alert.alert("Book Issued")
  this.setState({
    scannedBookId:"",
    scannedStudentId:""
  })
}
initiateBookReturn = async() => {
  db.collection("transactions").add({
    "studentID":this.state.scannedStudentId,
    "bookID":this.state.scannedBookId,
    "date":firebase.firestore.Timestamp.now().toDate(),
    "transactionType":"Returned"
  })
  db.collection("Books").doc(this.state.scannedBookId).update({
    "bookAvailabilty":true
  })
  db.collection("Students").doc(this.state.scannedStudentId).update({
    "No.ofbookIssued":firebase.firestore.FieldValue.increment(1)
  })
  Alert.alert("Book Returned")
  this.setState({
    scannedBookId:"",
    scannedStudentId:""
  })
}
checkisStudentEligibilityForBookIssue = async () => {
  const studentRef = await db.collection('Students').where('studentID','==',this.state.scannedStudentId).get()
  var isStudentEligible = " "
  if(studentRef.docs.length === 0){
    this.setState({
      scannedBookId: " ",
      scannedStudentId: " "
    })
    isStudentEligible = false;
    Alert.alert('The StudentID does not exist')
  }
  else{
    studentRef.docs.map(doc => {
      var Student = doc.data();
      if(student.No.ofbookIssued < 2){
        isStudentEligible = true
      }
      else{
        isStudentEligible = false
        Alert.alert('The Student already has one book')
        this.setState({
          scannedStudentId:" ",
          scannedBookId:" ",
        })
      }
    })
  }
  return isStudentEligible 
}

checkisStudentEligibilityForBookReturn = async () => {
    const transcationRef = await db.collection("transactions").where('bookID','==',this.state.scannedBookId).limit(1).get()
    var isStudentEligible = " "
    transcationRef.docs.maps(doc => {
      var lastBookTransaction = doc.data();
      if(lastBookTransaction.studentID === this.state.scannedBookId){
        isStudentEligible = true;
      }
      else{
        isStudentEligible = false
        Alert.alert("The Book was not issued by the student")
        this.setState({
scannedStudentId: " ",
scannedBookId: " "
        })
      }
    })
    return isStudentEligible
}
checkBookEligibility = async () => {
  const bookRef = await db.collection("Books").where('bookID','==',this.state.scannedBookId).get()
  var transactionType = " "
  if(bookRef.docs.length === 0){
    transactionType = false
  }
  else{
    bookRef.docs.map(doc => {
      var book = doc.data();
      if(book.bookAvailabilty){
        transactionType = 'Issue'
      }
      else{
        transactionType = 'Return'
      }
    })
  }
  return transactionType
}
    render() {
      const hasCameraPermissions = this.state.hasCameraPermissions;
      const scanned = this.state.scanned;
      const buttonState = this.state.buttonState;

      if (buttonState !== "normal" && hasCameraPermissions){
        return(
          <BarCodeScanner
            onBarCodeScanned={scanned ? undefined : this.handleBarCodeScanned}
            style={StyleSheet.absoluteFillObject}
          />
        );
      }

      else if (buttonState === "normal"){
        return(
          <KeyboardAvoidingView style = {styles.container} behavior = "padding" enabled>
          <View>
            <View>
              <Image
                source={require("../assets/booklogo.jpg")}
                style={{width:200, height: 200}}/>
              <Text style={{textAlign: 'center', fontSize: 30}}>Wily</Text>
            </View>
            <View style={styles.inputView}>
            <TextInput 
              style={styles.inputBox}
              placeholder="Book Id"
              onChangeText = {(text) => {
this.setState({
  scannedBookId:text
})
              }}
              value={this.state.scannedBookId}/>
            <TouchableOpacity 
              style={styles.scanButton}
              onPress={()=>{
                this.getCameraPermissions("BookId")
              }}>
              <Text style={styles.buttonText}>Scan</Text>
            </TouchableOpacity>
            </View>
            <View style={styles.inputView}>
            <TextInput 
              style={styles.inputBox}
              placeholder="Student Id"
              onChangeText = {(text) => {
this.setState({
  scannedStudentId:text
})
              }}

              value={this.state.scannedStudentId}/>
            <TouchableOpacity 
              style={styles.scanButton}
              onPress={()=>{
                this.getCameraPermissions("StudentId")
              }}>
              <Text style={styles.buttonText}>Scan</Text>
            </TouchableOpacity>
            </View>
            <TouchableOpacity>
              <Text>Submit</Text>
            </TouchableOpacity>
          </View>
          </KeyboardAvoidingView>
        );
      }
    }
  }

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center'
    },
    displayText:{
      fontSize: 15
    },
    scanButton:{
      backgroundColor: '#2196F3',
      padding: 10,
      margin: 10
    },
    buttonText:{
      fontSize: 15,
      textAlign: 'center',
      marginTop: 10
    },
    inputView:{
      flexDirection: 'row',
      margin: 20
    },
    inputBox:{
      width: 200,
      height: 40,
      borderWidth: 1.5,
      borderRightWidth: 0,
      fontSize: 20
    },
    scanButton:{
      backgroundColor: '#66BB6A',
      width: 50,
      borderWidth: 1.5,
      borderLeftWidth: 0
    }
  });