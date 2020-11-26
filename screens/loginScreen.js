import * as React from 'react'
import {Text,View,TextInput,StyleSheet,TouchableOpacity,KeyboardAvoidingView,Image, Alert} from 'react-native';

export default class LoginScreen extends React.Component{
    constructor(){
        super()
        this.state = {
            email: ' ',
            password: ' '
        }
    }
    login = async(email,password) => {
        if(email && password){
            try{
                const response = await firebase.auth().signInWithEmailAndPassword(email,password)
                if(response){
                    this.props.navigation.navigate('Transaction')
                }
            }
            catch(error){
switch(error.code){
case 'user not found':
    Alert.alert('User not found')
    break;
    case 'invalid email':
        Alert.alert('invalid email')
    
}
}           
}
else{
    Alert.alert('please enter email ID and Password again')
}
    }

    render(){
        return(
            <KeyboardAvoidingView style = {{alignItems:'center',marginTop:20}}>
<View>
    <Image
    source = {require('../assets/booklogo.jpg')}
    style = {{width:200,height:200}}
    />
    <Text>Wily</Text>
</View>
<View>
    <TextInput
    style = {StyleSheet.inputBox}
    placeholder = 'enter your mail ID'
    keyboardType = 'email-address'
    onChangeText = {(text) => {
this.setState({
    email:text
})
    }}
    />
    <TextInput
    style = {StyleSheet.inputBox}
    placeholder = 'enter your password ID'
    secureTextEntry = {true}
    onChangeText = {(text) => {
this.setState({
    password:text
})
    }}
    />
</View>
<TouchableOpacity style = {{height:30,width:90,borderWidth:1,marginTop:20,paddingTop:10,borderRadius:20}}
onPress = {() => {
  this.login(this.state.email,this.state.password)
}}
>
<Text>login</Text>
</TouchableOpacity>
            </KeyboardAvoidingView>
        )
    }
}