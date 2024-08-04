import React from'react';

function Sidebarcomp({title,setActive,icon}){
    return(
    <div className="flex justify-between items-center p-[1.7vw] "onClick={()=>setActive(title)}>
        <div className="w-[15%]">{icon}</div>
        <div className="hidden custom-950:flex custom-950:w-[85%] justify-start">{title}</div>
    </div>
    )
}

export default Sidebarcomp;