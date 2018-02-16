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

function appReducer(state, action) {
    switch(action.type) {
        case 'SET_NEW_TODO_TITLE_VALUE':
            return Object.assign({}, state, {
                newTodoTitle: action.payload
            });

        case 'ADD_TODO':
            return Object.assign({}, state, {
               todos: state.todos.concat([ 
                   Object.assign({
                       id: todoId++
                   },
                   action.payload
                    )
                ]) 
            });
        
        case 'COMPLETE_TODO': 
            return Object.assign({}, state, {
                todos: state.todos.map(todo => {
                    if (action.payload == todo.id) {
                        todo.done = true;
                    }

                    return todo;
                })
            });
    }
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