import { useState, useEffect, FormEvent } from 'react';
import { motion, AnimatePresence, useMotionValue } from 'framer-motion';
import confetti from 'canvas-confetti';
import { format } from 'date-fns';

interface Todo {
  id: number;
  text: string;
  completed: boolean;
  category: 'work' | 'personal' | 'shopping' | 'health' | 'other';
  priority: 'low' | 'medium' | 'high';
  dueDate?: Date;
}

type Filter = 'all' | 'active' | 'completed';

function App() {
  const progress = useMotionValue(0);

  // Core state
  const [todos, setTodos] = useState<Todo[]>([]);
  const [inputValue, setInputValue] = useState('');
  
  // New state for features
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<Filter>('all');
  const [isDarkMode, setIsDarkMode] = useState(false);
  
  // New state for adding todos
  const [selectedCategory, setSelectedCategory] = useState<Todo['category']>('other');
  const [selectedPriority, setSelectedPriority] = useState<Todo['priority']>('medium');
  const [selectedDate, setSelectedDate] = useState<string>('');

  // Local Storage
  useEffect(() => {
    const saved = localStorage.getItem('todos');
    if (saved) {
      setTodos(JSON.parse(saved));
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('todos', JSON.stringify(todos));
  }, [todos]);

  // Dark Mode
  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);

  // Progress Update
  useEffect(() => {
    const completedCount = todos.filter(todo => todo.completed).length;
    const percentage = todos.length ? (completedCount / todos.length) * 100 : 0;
    progress.set(percentage);
  }, [todos, progress]);

  // Filtered Todos
  const filteredTodos = todos
    .filter(todo => todo.text.toLowerCase().includes(searchTerm.toLowerCase()))
    .filter(todo => {
      if (statusFilter === 'active') return !todo.completed;
      if (statusFilter === 'completed') return todo.completed;
      return true;
    })
    .sort((a, b) => {
      // Sort by priority first
      const priorityOrder = { high: 0, medium: 1, low: 2 };
      const priorityDiff = priorityOrder[a.priority] - priorityOrder[b.priority];
      if (priorityDiff !== 0) return priorityDiff;
      
      // Then by due date if both have one
      if (a.dueDate && b.dueDate) {
        return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
      }
      return 0;
    });

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (inputValue.trim() !== '') {
      const newTodo: Todo = {
        id: Date.now(),
        text: inputValue,
        completed: false,
        category: selectedCategory,
        priority: selectedPriority,
        dueDate: selectedDate ? new Date(selectedDate) : undefined
      };
      setTodos([...todos, newTodo]);
      setInputValue('');
      setSelectedDate('');
    }
  };

  const toggleTodo = (id: number) => {
    const todo = todos.find(t => t.id === id);
    if (todo && !todo.completed) {
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 }
      });
    }
    setTodos(todos.map(todo => 
      todo.id === id ? { ...todo, completed: !todo.completed } : todo
    ));
  };

  const deleteTodo = (id: number) => {
    setTodos(todos.filter(todo => todo.id !== id));
  };


  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className={`min-h-screen py-8 px-4 transition-all duration-500
                ${isDarkMode 
                  ? 'bg-gray-900 text-white' 
                  : 'bg-gradient-to-br from-purple-100 via-indigo-100 to-teal-100'}`}
    >
      <motion.div 
        initial={{ y: 20 }}
        animate={{ y: 0 }}
        className="max-w-4xl mx-auto"
      >
        <motion.div 
          initial={{ scale: 0.95 }}
          animate={{ scale: 1 }}
          className={`${isDarkMode ? 'bg-gray-800' : 'bg-white/80'} 
                    backdrop-blur-lg rounded-2xl shadow-xl p-8`}
        >
          {/* Header with Dark Mode Toggle */}
          <div className="flex justify-between items-center mb-8">
            <motion.h1 
              whileHover={{ scale: 1.05 }}
              whileTap={{ rotate: [0, -10, 10, 0] }}
              className={`text-4xl font-bold ${isDarkMode 
                ? 'text-purple-400' 
                : 'bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent'}`}
            >
              My Tasks
            </motion.h1>

            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => setIsDarkMode(prev => !prev)}
              className="p-2 rounded-full"
            >
              {isDarkMode ? '🌞' : '🌙'}
            </motion.button>
          </div>

          {/* Add Todo Form - Now first */}
          <form onSubmit={handleSubmit} className="mb-8">
            <motion.div 
              initial={{ x: -20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              className="space-y-4"
            >
              <div className="flex gap-2">
                <input
                  type="text"
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  placeholder="Add a new task..."
                  className={`flex-1 px-4 py-3 rounded-xl border ${
                    isDarkMode 
                      ? 'bg-gray-700 border-gray-600' 
                      : 'bg-white border-gray-200'
                  } focus:ring-2 focus:ring-purple-500 transition-all duration-300`}
                />
                
                <motion.button 
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  type="submit"
                  className="px-6 py-3 bg-gradient-to-r from-purple-600 to-indigo-600 
                       text-white rounded-xl hover:from-purple-700 hover:to-indigo-700 
                          transition-all duration-300"
                >
                  Add Task
                </motion.button>
              </div>

              <div className="flex gap-4">
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value as Todo['category'])}
                  aria-label="Task category"
                  className={`px-3 py-2 rounded-lg ${isDarkMode ? 'bg-gray-700' : 'bg-white'}`}
                >
                  {['work', 'personal', 'shopping', 'health', 'other'].map(cat => (
                    <option key={cat} value={cat}>
                      {cat.charAt(0).toUpperCase() + cat.slice(1)}
                    </option>
                  ))}
                </select>

                <select
                  value={selectedPriority}
                  onChange={(e) => setSelectedPriority(e.target.value as Todo['priority'])}
                  aria-label="Task priority"
                  className={`px-3 py-2 rounded-lg ${isDarkMode ? 'bg-gray-700' : 'bg-white'}`}
                >
                  {['low', 'medium', 'high'].map(priority => (
                    <option key={priority} value={priority}>
                      {priority.charAt(0).toUpperCase() + priority.slice(1)} Priority
                    </option>
                  ))}
                </select>

                <input
                  type="date"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  aria-label="Due date"
                  className={`px-3 py-2 rounded-lg ${isDarkMode ? 'bg-gray-700' : 'bg-white'}`}
                />
              </div>
            </motion.div>
          </form>

          {/* Search and Filters - Now second */}
          <motion.div 
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="mb-6 space-y-4"
          >
            <input
              type="text"
              placeholder="Search tasks..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className={`w-full px-4 py-2 rounded-lg ${
                isDarkMode 
                  ? 'bg-gray-700 border-gray-600' 
                  : 'bg-white border-gray-200'
              } border focus:ring-2 focus:ring-purple-500 transition-all duration-300`}
            />
            
            <div className="flex gap-2">
              {['all', 'active', 'completed'].map((filter) => (
                <motion.button
                  key={filter}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setStatusFilter(filter as Filter)}
                  className={`px-3 py-1 rounded-full text-sm ${
                    statusFilter === filter
                      ? 'bg-purple-500 text-white'
                      : isDarkMode 
                        ? 'bg-gray-700 text-gray-300' 
                        : 'bg-gray-200 text-gray-700'
                  } transition-all duration-300`}
                >
                  {filter.charAt(0).toUpperCase() + filter.slice(1)}
                </motion.button>
              ))}
            </div>
          </motion.div>

          {/* Todo List */}
          <AnimatePresence mode='popLayout'>
            <ul className="space-y-3">
              {filteredTodos.map(todo => (
                <li key={todo.id}>
                  <motion.div 
                    initial={{ x: -20, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    exit={{ x: 20, opacity: 0 }}
                    whileHover={{ x: 5 }}
                    drag="x"
                    dragConstraints={{ left: 0, right: 100 }}
                    dragElastic={0.2}
                    onDragEnd={(_, info) => {
                      if (info.offset.x > 100) {
                        deleteTodo(todo.id);
                      }
                    }}
                    className={`group flex items-center p-4 rounded-xl transition-all duration-300 
                              ${todo.completed 
                                ? 'bg-green-50 border-green-100' 
                                : isDarkMode
                                  ? 'bg-gray-700'
                                  : 'bg-white'} 
                              border hover:shadow-md cursor-grab active:cursor-grabbing`}
                  >
                    <motion.input
                      whileHover={{ scale: 1.2 }}
                      type="checkbox"
                      checked={todo.completed}
                      onChange={() => toggleTodo(todo.id)}
                      className="w-5 h-5 rounded-lg border-2 border-purple-500 text-purple-600 
                               focus:ring-purple-400 transition-all duration-300 cursor-pointer"
                    />
                    <div className="flex-1 ml-3">
                      <motion.span 
                        animate={{ opacity: todo.completed ? 0.5 : 1 }}
                        className={`block text-lg ${todo.completed ? 'line-through text-gray-400' : ''}`}
                      >
                        {todo.text}
                      </motion.span>
                      <div className="flex gap-2 mt-1 text-sm">
                        <span className={`px-2 py-0.5 rounded-full ${
                          isDarkMode ? 'bg-gray-600' : 'bg-gray-100'
                        }`}>
                          {todo.category}
                        </span>
                        <span className={`px-2 py-0.5 rounded-full ${
                          todo.priority === 'high' ? 'bg-red-100 text-red-700' :
                          todo.priority === 'medium' ? 'bg-yellow-100 text-yellow-700' :
                          'bg-green-100 text-green-700'
                        }`}>
                          {todo.priority}
                        </span>
                        {todo.dueDate && (
                          <span className="text-gray-500">
                            Due: {format(new Date(todo.dueDate), 'MMM d')}
                          </span>
                        )}
                      </div>
                    </div>
                    <motion.button
                      whileHover={{ scale: 1.2, rotate: 10 }}
                      onClick={() => deleteTodo(todo.id)}
                      className="opacity-0 group-hover:opacity-100 text-gray-400 hover:text-red-500 
                               transition-all duration-300"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" 
                              d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </motion.button>
                  </motion.div>
                </li>
              ))}
            </ul>
          </AnimatePresence>

          {filteredTodos.length === 0 && (
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ 
                opacity: 1, 
                y: [0, -10, 0],
                transition: {
                  y: {
                    repeat: Infinity,
                    duration: 2,
                    ease: "easeInOut"
                  }
                }
              }}
              className="text-center py-12 text-gray-500"
            >
              <p>No tasks yet! Add some to get started ✨</p>
            </motion.div>
          )}
        </motion.div>
      </motion.div>
    </motion.div>
  );
}

export default App;
