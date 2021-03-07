const Reducer = (state, action) => {
    switch (action.type) {
        case 'LOAD_PROFILE':
            const {user, folders} = action;
            return { ...state, user, folders };
        case 'LOAD_EMAILS':
            const {users} = action;
            return {...state, users};
        default:
            return state;
    }
}

export default Reducer;
