const state = {};

state.todos = [];
state.newTodoTitle;

class StateStore {
    constructor(initialState = {}, reducer) {
        this.state = initialState;
        this.listeners = [];
        this.reducer = reducer;
    }

    subscribe(listener) {
        this.listeners.push(listener);
    }

    dispatch(action) {
        this.state = this.reducer(this.state, action); 
        this.listeners.forEach(listener => listener(this.state));
    }
}

let todoId = 0;

function combineReducers(reducers) {
    return function (state, action) {
        let newState = state;

        for (let key in reducers) {
            const stateChunk = state[key];
            const reducer = reducers[key];

            const newStateChunk = reducer(stateChunk, action);
        
            if (newStateChunk !== stateChunk) {
                newState = Object.assign({}, state);
                newState[key] = newStateChunk;
            }
        
        }

        return newState;
    }
}

const appReducer = combineReducers({
    todos: todosReducer,
    newTodoTitle: todoTitleReducer,
});



function todoTitleReducer(state, action) {
    switch (action.type) {
        case 'SET_NEW_TODO_TITLE_VALUE':
            return action.payload;
    
         default: return state;
    
        }   
}

function todosReducer(state, action) {
    switch (action.type) {
        case 'ADD_TODO':
            return state.concat([
                createNewTodo(todoId++, action.payload)
            ]);
        case 'COMPLETE_TODO': 
            return state.todos.map(todo => {
                if (action.payload == todo.id) {
                    todo.done = true;
                }

                return todo;
            });

        default: return state;

    }

}

function createNewTodo(id, todoData) {
    return Object.assign({ id }, todoData);

}


const stateStore = new StateStore({
    todos: [],
    newTodoTitle: '',   
}, appReducer);

stateStore.subscribe(render);

function renderToString(state) {
    return `
        <input type='text' value="${state.newTodoTitle || ''}"></input>

        <ul>
            ${renderTodos(state.todos)}
        </ul>
    `;
}

function render(state) {
    document.body.innerHTML = renderToString(state);
}

function renderTodos(todos) {
    return todos.map(todo => {
        return `<li
                    class="${todo.done ? '-completed' : ''} todo-item"
                    data-id="${todo.id}">
                    ${todo.title}
                 </li>`
    }).join('\n');
}

render(state);

document.body.addEventListener('keypress', e => {
    const input = document.querySelector('input');
    
    if  (e.keyCode === 13) {
        stateStore.dispatch({
            type: 'ADD_TODO',
            payload: {
                title: input.value,
                done: false
            }
        });

        stateStore.dispatch({
            type: 'SET_NEW_TODO_TITLE_VALUE',
            payload: ''
        })

        return;
    }

    stateStore.dispatch({
        type: 'SET_NEW_TODO_TITLE_VALUE',
        payload: input.value + e.key
    });

    setTimeout(() => {
        document.querySelector('input').focus(); 
    }, 0);
});

document.body.addEventListener('click', e => {
    console.log(e.target);
    if (e.target.classList.contains('todo-item')) {
        stateStore.dispatch({
            type: 'COMPLETE_TODO',
            payload: e.target.dataset.id
        });
    }
});