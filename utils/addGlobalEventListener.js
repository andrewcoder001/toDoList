export default function addGlobalEventListener(listener, property, callback){
    document.addEventListener(listener, (e)=>{
        if(e.target.matches(property)){
            callback(e);
        }
    })
}