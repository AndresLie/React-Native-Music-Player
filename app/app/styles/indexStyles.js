
import { StyleSheet } from 'react-native';

export default StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'flex-start',
    alignItems: 'center',
  },
  header: {
    paddingTop: '7%',
    backgroundColor: '#4e6af5',
    width: '100%',
    padding: 15,
    alignItems: 'center',
    borderRadius: 8,
  },
  headerText: {
    color: 'white',
    fontSize: 25,
  },
  selectorWrapper: {
    marginTop: '3%',
    width: '80%',
  },
  inputWrapper: {
    flexDirection: 'row',
    width: '100%',
    marginTop: '12%',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 5,
    paddingBottom: '3%',
  },
  FormControl: {
    flex: 0.93,
    position: 'relative',
  },
  input: {
    height: 40,
    marginRight: 10,
  },
  errorMessage: {
    position: 'absolute',
    bottom: -20,
  },
  button: {
    width: '22%',
    borderRadius: 30,
  },
  flatListContent: {
    paddingBottom: 100,
    width:'95%'
  },
  controlWrapper: { 
    display: 'flex', 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    position:'absolute',
    top:'88%',
    height:'12%',
    zIndex:9
  },
  micButton: {
    borderRadius: 10,
    backgroundColor: 'white',
    padding: 20,
    zIndex: 9,

    

  },musicNav:{
    opacity:1,
    width:'50%',
    left:'0%'
  },
  musicNavDisabled:{
    opacity:1,
    width:'100%',
    backgroundColor:'green'
  },
  resultItem: {
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
  },
  disabled: {
    opacity: 0.5,
    pointerEvents: 'none',
  },
});
