import axios from 'axios';
import {setAlert} from './alert'
import {GET_PROFILE, PROFILE_ERROR} from './types';

// Action to Get current users profile
export const getCurrentProfile = () => async dispatch => {
    try {
        const res = await axios.get('/api/profile/me')

        dispatch({
            type: GET_PROFILE,
            payload: res.data
        });
    } catch (err) {
        dispatch({
            type: PROFILE_ERROR,
            payload: {msg: err.response.statusText,
                      status: err.response.status}
        });
    }
}

// Action to create or update profile
export const createProfile = (formData, history, edit=false) => async dispatch => {
    try {
        const config = {
            headers:{
                'Content-type':'application/json'
            }
        }
        const res = await axios.post('/api/profile',formData, config);

        dispatch({
            type: GET_PROFILE,
            payload: res.data
        });
        dispatch(setAlert(edit?'Profile Update':'Profile Created', 'success'));

        if(!edit){ // If we are not editing the current profile
            history.push('/dashboard') // Redirect to the dashboard -> Same as <Redirect to='/dashboard'/> but for an action
        }
    } catch (err) {
        const errors = err.response.data.errors; // get all the errors
        if (errors)
            errors.forEach(error => dispatch(setAlert(error.msg,'danger')));
            
        dispatch({
            type: PROFILE_ERROR,
            payload: {msg: err.response.statusText,
                      status: err.response.status}
        });
    }
}