import addGlobalEventListener from '../utils/addGlobalEventListener';

// Function Invocation (on App start)
export default function setupToDoList(transferTask){ 

    addGlobalEventListener('mousedown', '[data-task-element]', e => {
        const selectedTask = e.target.closest('[data-task]') //on click, will get selected element based on data attribute, [data-task] 
        const taskClone = selectedTask.cloneNode(true); //cloneNode(true) clones 'selectedTask' and its child elements
        const shadow = selectedTask.cloneNode(); 

        // Runs setupDragItems and stores return value in variable to be used as an argument for 'setupDragEvents'
        const offset = setupDragItems(selectedTask, taskClone, shadow,e);
      
        setupDragEvents(selectedTask, taskClone, offset, shadow, transferTask)
    })    
}


// Functions

function setupDragItems(selectedTask, taskClone, shadow, e){
    const taskRect = selectedTask.getBoundingClientRect();
  //stopped on offset
  const offset = {
    x: e.clientX - taskRect.left,
    y: e.clientY - taskRect.top
  }

    // Adding Class
    selectedTask.classList.add('hide');
    taskClone.classList.add('dragging');

    // Positioning of Clone     
    positionClone(taskClone, e, offset)

    // Append to Document
    document.body.append(taskClone)

    // Shadow Setup
    shadow.style.height = `${taskRect.height}px`
    shadow.classList.add('shadow');
    shadow.innerHTML = '';
    selectedTask.parentElement.insertBefore(shadow, selectedTask)

    return offset;
}

function setupDragEvents(selectedTask, taskClone, offset,shadow, transferTask){
    const mouseMoveFunction = (e) => {
        // Create an area for shadow based on e.target (mouse location)
        const dropArea = getDropArea(e.target)
        positionClone(taskClone, e, offset)
        if(dropArea == null) return

               // Form an 'array from' dropArea's children, then find...
        const closestChild = Array.from(dropArea.children).find(child => {
            const rect = child.getBoundingClientRect()
            // closestChild element is the element that is halfway up after clientY
            return e.clientY < rect.top  + rect.height / 2
        })

        //closeChild represents the closest task after mouse hovers half way above a task
        if(closestChild != null){
            // insert the shadow, before the closestChild
            dropArea.insertBefore(shadow, closestChild)
        } else {
            dropArea.append(shadow)
        }
        
    }
    
    document.addEventListener('mousemove', mouseMoveFunction)
    document.addEventListener('mouseup', e => {
        document.removeEventListener('mousemove', mouseMoveFunction)
        const dropArea = getDropArea(shadow);
        if(dropArea){
            transferTask({
                startColumn: getDropArea(selectedTask),
                endColumn: dropArea,
                draggingTask: selectedTask,
                index: Array.from(dropArea.children).indexOf(shadow)
            })

            // insert must go after transferTask() for startColumn to use original state.
            // this method will allow the shadow to be placed
            dropArea.insertBefore(selectedTask, shadow)
        }
        removeDragElements(selectedTask, taskClone, shadow)
      
    }, { once: true })
}

// Utility Functions
function removeDragElements(selectedTask, taskClone, shadow){
    selectedTask.classList.remove('hide')
    taskClone.remove()
    shadow.remove()
}

function getDropArea(element){
    // This function stops it from placing shadow anywhere, only in parent div of [data-task-column]
    // Detect and return shadow area of mouse target, where it hovers.
    if(element.matches('[data-task-column]')){
        return element
    } else {
       return element.closest('[data-task-column]')
    }
}


function positionClone(taskClone, mousePosition, offset){
    taskClone.style.top = `${mousePosition.clientY - offset.y}px`;
    taskClone.style.left = `${mousePosition.clientX - offset.x}px`;
}