// If JWT token is present in local storage, add it to header. If not, delete it
import axios from 'axios'

function setAuthToken(token){
    if(token){
        axios.defaults.headers.common['x-auth-token'] = token
    }else{
        delete axios.defaults.headers.common['x-auth-token']
    } 
}

export default setAuthToken