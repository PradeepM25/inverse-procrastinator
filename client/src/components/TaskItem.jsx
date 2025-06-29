import React, { useEffect, useState } from 'react';
import { getPriorityBadgeColor, getPriorityColor, MENU_OPTIONS, TI_CLASSES } from '../assets/dummy';
import { Calendar, CheckCircle2, Clock, MoreVertical } from 'lucide-react';
import axios from 'axios';
import { format, isToday } from 'date-fns'
import { TaskModal } from './TaskModal';

const API_BASE = 'http://localhost:4000/api/tasks';

export const TaskItem = ({ task, onRefresh, onLogout, showCompleteCheckBox = true }) => {
  if (!task) return null;

  const taskId = task.id || task._id;
  if (!taskId) return null;

  const normalizeCompleted = (value) => {
    if (value == null) return false;
    const v = typeof value === 'string' ? value.toLowerCase() : value;
    return [true, 1, 'yes'].includes(v);
  };

  const [isCompleted, setIsCompleted] = useState(normalizeCompleted(task.completed));
  const [subtasks, setSubtasks] = useState(task.subtasks || []);
  const [showMenu, setShowMenu] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);

  useEffect(() => {
    setIsCompleted(normalizeCompleted(task.completed));
  }, [task.completed]);

  const getAuthHeader = () => {
    const token = localStorage.getItem('token');
    if (!token) throw new Error("No Auth Token found");
    return { Authorization: `Bearer ${token}` };
  };

  const borderColor = isCompleted
    ? "border-green-500"
    : getPriorityColor(task.priority || 'Low').split(" ")[0];

  const handleComplete = async () => {
    const newStatus = isCompleted ? 'No' : 'Yes';
    try {
      await axios.put(`${API_BASE}/${taskId}/gp`,
        { completed: newStatus },
        { headers: getAuthHeader() }
      );
      setIsCompleted(!isCompleted);
      onRefresh?.();
    } catch (err) {
      console.error(err);
      if (err.response?.status === 401) onLogout?.();
    }
  };

  const progress = subtasks.length ? (subtasks.filter(st => st.completed).length / subtasks.length) * 100 : 0;
  const handleAction = (action) => {
    setShowMenu(false);
    if(action === 'edit') setShowEditModal(true);
    if(action === 'delete') handleDelete();
  }

  const handleDelete = async () => {
    try {
      await axios.delete(`${API_BASE}/${task._id}/gp`, {headers: getAuthHeader()});
      onRefresh();
    } catch (err) {
      if(err.response?.status === 401) onLogout?.();
    }
  }

  const handleSave = async (updatedTask) => {
    try {
      const payload = (({ title, description, priority, dueDate, completed }) =>
          ({ title, description, priority, dueDate, completed }))(updatedTask);
      await axios.put(`${API_BASE}/${task._id}/gp`, payload, {headers: getAuthHeader()});
      setShowEditModal(false);
      onRefresh()
    } catch (err) {
      if(err.response?.status === 401) onLogout?.();
    }
  }

  return (
    <>
       <div className={`${TI_CLASSES.wrapper} ${borderColor}`}>
        <div className={TI_CLASSES.leftContainer}>
          {showCompleteCheckBox && (
            <button
              onClick={handleComplete}
              className={`${TI_CLASSES.completeBtn} ${isCompleted ? 'text-green-500' : 'text-gray-300'}`}
            >
              <CheckCircle2
                size={18}
                className={`${TI_CLASSES.checkboxIconBase} ${isCompleted ? 'fill-green-500' : ''}`}
              />
            </button>
          )}

          <div className='flex-1 min-w-0'>
            <div className='flex items-baseline gap-2 mb-1 flex-wrap'>
              <h3 className={`${TI_CLASSES.titleBase} 
              ${isCompleted ? 'text-green-500 line-through' : 'text-gray-800'}`}> {task.title} </h3>

              <span className={`${TI_CLASSES.priorityBadge} ${getPriorityBadgeColor(task.priority)}`}>{task.priority}</span>
            </div>
            {task.description && <p className={`${TI_CLASSES.description}`}>{task.description}</p>}
          </div>
        </div>

        <div className={`${TI_CLASSES.rightContainer}`}>
          <div className='relative'>
            <button onClick={() => setShowMenu(!showMenu)}>
              <MoreVertical className='w-4 h-4 sm:w-5 sm:h-5' size={18} />
            </button>
            {showMenu && (
              <div className={TI_CLASSES.menuDropdown}>
                {MENU_OPTIONS.map(opt => (
                  <button key={opt.action} onClick={() => handleAction(opt.action)} 
                  className='w-full px-3 sm:px-4 py-2 text-left text-xs sm:text-sm hover:text-purple-800
                  flex items-center gap-2 transition-colors duration-200'> 
                    {opt.icon}{opt.label}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className='flex items-baseline gap-8'>
          <div className={TI_CLASSES.createdRow}>
            <Clock className='w-3 h-3 sm:w-3.5 sm:h-3.5' />
            {task.createdAt ? `Created ${format(new Date(task.createdAt), 'dd/MMM/yyyy')}` : '-'}
          </div>
          <div className={`${TI_CLASSES.dateRow} ${task.dueDate && isToday(new Date(task.dueDate)) ? 
            'text-fuchsia-600' : 'text-gray-500'}`}>
              <Calendar className='w-3.5 h-3.5' />
              Duedate:{' '}
              {task.dueDate ? (isToday(new Date(task.dueDate)) ? 'Today' : format(new Date(task.dueDate), 'dd/MMM/yyyy')) : 'No Due'}
          </div>
        </div>
      </div>

      <TaskModal isOpen={showEditModal} onClose={() => setShowEditModal(false)} 
        taskToEdit={task} onSave={handleSave}/>
    </>
  );
};