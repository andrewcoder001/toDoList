import setupToDoList from './dragAndDrop';
import { v4 as uuidV4  } from 'uuid';


const STORAGE_PREFIX = 'TODO_LIST'
const STORAGE_KEY = `${STORAGE_PREFIX}_column`
const form = document.querySelector('.form')
const clearButton = document.querySelector('.clear-button')

let DEFAULT_COLUMNS = {
    tasksColumn: [],
    completedTasksColumn: []
}

// will invoke loadColumns() once called in a function
const columns = loadColumns()

// Event Listeners

form.addEventListener('submit', e=>{

        e.preventDefault()
        const taskHeader = document.querySelector('.task-subject').value
        const taskContent = document.querySelector('.task-content').value
        const inputFieldHeader = document.querySelector('.task-subject');
        const inputFieldContent = document.querySelector('.task-content');
    
        if(taskHeader === '' || taskContent === '') return
    
        const task = { id: uuidV4(), taskHeader: taskHeader, taskContent: taskContent}
        const columnName = 'tasksColumn'
    
        columns[columnName].push(task)
    
        saveColumns()
        renderTasks()   
    
        inputFieldHeader.value ='';
        inputFieldContent.value = '';  

    
})

clearButton.addEventListener('click', ()=>{
    clearColumns();
})

function clearColumns(){
    const bothColumns = document.querySelectorAll('[data-task-column]')

    bothColumns.forEach( col =>
        col.innerHTML = ''
        )
    
    // loop through object keys and turn pair into array
    Object.entries(columns).forEach( obj => {
        // each loop, will grab each array element's first element.
        const columnName = obj[0]
        columns[columnName] = []
    })

    saveColumns()
}


// Local Storage Utility Functions

function saveColumns(){
    localStorage.setItem(STORAGE_KEY, JSON.stringify(columns))
}

function loadColumns(){
    //Retrieves local storage key item
    const columnsJSON = localStorage.getItem(STORAGE_KEY)

    //parse the JSON item if there are any (Truthy), if not, use default values.
    return JSON.parse(columnsJSON) || DEFAULT_COLUMNS;
}

//General Functions

function renderTasks(){
    //columns is either DEFAULT_COLUMNS or the json object
    Object.entries(columns).forEach( obj => {
        //Loop through each object, obj[0] = taskColumn, completedTasksColumn
        //obj[1] are the tasks, themselves
        const columnName = obj[0]
        const tasks = obj[1]
        const column = document.querySelector(`[data-column-name="${columnName}"]`)

        // clear column first
        column.innerHTML = ''

        tasks.forEach( task => {
            const taskElement = createTaskElement(task)
            column.append(taskElement)
        })
    })    
}

function createTaskElement(task){
    // Task template div
    const element = document.createElement('div');

    // Data attributes
    element.dataset.id = task.id
    element.dataset.task = ''

    // Template child elements
    element.classList.add('task')
    element.innerHTML =  
        `
            <div class="task-header" data-task-element>${task.taskHeader}</div>
            <p data-task-element>${task.taskContent}</p>
        `
    return element
}


// Prop Transfer

function transferTask(e){
    // Retrieving the name of column
    const startColumnName = e.startColumn.dataset.columnName;
    const endColumnName = e.endColumn.dataset.columnName;
    // Has to be bracket to use variable name; dot notation is used to access straight to the key.
    const startColumnTasks = columns[startColumnName];
    const endColumnTasks = columns[endColumnName];

    const task = startColumnTasks.find(t => t.id == e.draggingTask.dataset.id)

    //Find index of 'task' inside startColumnTasks, remove it
    startColumnTasks.splice(startColumnTasks.indexOf(task), 1);
    //Put in task at the 'shadow's index position
    endColumnTasks.splice(e.index, 0, task) 

    saveColumns()
}


// Invoke

setupToDoList(transferTask);

renderTasks();

