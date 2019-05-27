import React from 'react'
import {Route, Redirect} from 'react-router-dom'
import PropTypes from 'prop-types'
import {connect} from 'react-redux'

const PrivateRoute = ({component: Component, auth:{isAuthenticated,loading}, ...rest}) => (
    <Route 
    {...rest} // Send everything else sent to the function as props to the Route
    render={
        props => !isAuthenticated && !loading ?  // If the user is not authenticated and page is not loading, redirect to login
        (<Redirect to='/login'/>) : 
        (<Component {...props}/>) // Else create component with the props
    } />
)

PrivateRoute.propTypes = {
    auth: PropTypes.object.isRequired,
}

const mapStateToProps = state => ({
    auth: state.auth
})

export default connect(mapStateToProps)(PrivateRoute)
