import addGlobalEventListener from '../utils/addGlobalEventListener';


export default function dragAndDrop(){ 
    
    addGlobalEventListener('mousedown', '[data-task-element]', e => {
        const selectedTask = e.target.closest('[data-task]')
        const taskClone = selectedTask.cloneNode(true);
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

        const mouseMoveFunction = (e) => {
            positionClone(taskClone, e, offset)
        }

       

        document.addEventListener('mousemove', mouseMoveFunction)
        document.addEventListener('mouseup', e => {
            selectedTask.classList.remove('hide')
            taskClone.remove()
            document.removeEventListener('mousemove', mouseMoveFunction)
        }, { once: true })
    })    
}

function positionClone(taskClone, mousePosition, offset){
    taskClone.style.top = `${mousePosition.clientY - offset.y}px`;
    taskClone.style.left = `${mousePosition.clientX - offset.x}px`;
}