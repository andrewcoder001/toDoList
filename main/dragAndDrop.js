import addGlobalEventListener from '../utils/addGlobalEventListener';


export default function setupToDoList(transferTask){ 

    addGlobalEventListener('mousedown', '[data-task-element]', e => {
        const selectedTask = e.target.closest('[data-task]')
        const taskClone = selectedTask.cloneNode(true);
        const shadow = selectedTask.cloneNode();
        const offset = setupDragItems(selectedTask, taskClone, shadow,e);
      
        setupDragEvents(selectedTask, taskClone, offset, shadow, transferTask)
     

    })    
}

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

    
        if(closestChild != null){
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
            dropArea.insertBefore(selectedTask, shadow)

            transferTask({
                startColumn: getDropArea(selectedTask),
                endColumn: dropArea,
                draggingTask: selectedTask,
                index: Array.from(dropArea.children).indexOf(shadow)
            })
        }
        removeDragElements(selectedTask, taskClone, shadow)
      
    }, { once: true })
}

function removeDragElements(selectedTask, taskClone, shadow){
    selectedTask.classList.remove('hide')
    taskClone.remove()
    shadow.remove()
}

function getDropArea(element){
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