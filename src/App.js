import {useEffect, useState} from 'react';
import './App.css';
import supabase from './supabase_client';

function App() {

  const [todoList, setTodoList] = useState([]);
  const [newTodo, setNewTodo] = useState('');

  useEffect(() => {
    fetchTodos();
  }, [])
  

  const fetchTodos = async () => {
    const { data, error } = await supabase.from('TodoList').select('*');
    if (error) {
      console.error("Error fetching todos:", error);
      setTodoList([]);
    } else {
      setTodoList(data || []);
    }
  };

  const addTodo = async () => {
    if (!newTodo.trim()) {
      console.log('Todo cannot be empty');
      return; 
    }
  
    const newTodoData = {
      name: newTodo.trim(),
      isCompleted: false,
    };
  
    const { data, error } = await supabase.from('TodoList').insert([newTodoData]).select().single();
  
    if (error) {
      console.error('Error adding TODO', error);
    } else {
      setTodoList((prev) => [...prev, data]); 
      setNewTodo(''); 
    }
  };

  const completeTask = async (id, isCompleted) => {
    const { error } = await supabase.from('TodoList').update({ isCompleted: !isCompleted }).eq('id', id);
    if (error) {
      console.error('Error toggling task', error);
    } else {
      const updatedTodoList = todoList.map((todo) =>
        todo.id === id ? { ...todo, isCompleted: !isCompleted } : todo
      );
      setTodoList(updatedTodoList);
    }
  };

  const deleteTodo = async (id) => {
    const confirmDelete = window.confirm('Are you sure you want to delete this todo?');
  
    if (confirmDelete) {
      const { error } = await supabase.from('TodoList').delete().eq('id', id);
  
      if (error) {
        console.error('Error deleting TODO', error);
      } else {
        setTodoList((prev) => prev.filter((todo) => todo.id !== id));
      }
    }
  };
  
  

  return (
    <div className='App'>
      <h1>Todolist</h1>
      <div>
        <input
          type="text"
          placeholder="New Todo..."
          value={newTodo}
          onChange={(e) => setNewTodo(e.target.value)}
        />
        <button onClick={addTodo}>Add Todo</button>
      </div>

      <ul>
        {todoList.map((todo) =>
          todo ? (
            <li key={todo.id}>
              <p>{todo.name}</p>
              <button onClick={() => completeTask(todo.id, todo.isCompleted)}>
                {todo.isCompleted ? 'Undo' : 'Complete task'}
              </button>
              <button onClick={() => deleteTodo(todo.id)}>
                  Delete Task</button>
            </li>
          ) : null
        )}
      </ul>
    </div>
  );
}
export default App;
