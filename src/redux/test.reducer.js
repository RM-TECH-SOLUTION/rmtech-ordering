const initialState = {
    message: "Redux is working"
};

const TEST_ACTION = 'test/TEST_ACTION';

export const testAction = () => (dispatch) => {
    dispatch({
        type: TEST_ACTION,
        payload: "Redux connected successfully 🎉"
    });
};

const testReducer = (state = initialState, action) => {
    switch (action.type) {
        case TEST_ACTION:
            return {
                ...state,
                message: action.payload
            };
        default:
            return state;
    }
};

export default testReducer;
