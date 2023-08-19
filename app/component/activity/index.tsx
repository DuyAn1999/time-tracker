import { type } from "os";
import { useEffect, useRef, useState } from "react";


export type Activity = {
    name: string;
    id: string;
    timeTrackedInMs: number;
    subActivities: Activity[];
    isDone: boolean;
}
  
export type ActivityProps = {
    activity: Activity;
    startActivity: (activity: Activity | undefined) => void;
    stopActivity: () => void; 
    completeActivity: () => void; 
    isCurrentActivity: boolean;
    isActive: any;
    startDate: any;
    workTimeInMs: any;
}

export function ActivityTask(props: ActivityProps){
    const updateTimer = () => {
        let date = new Date();
        // set tracking time in the case we are tracking
        if(props.isActive.current && props.isCurrentActivity){
            let currentStartDate = props.startDate.current ?? date;
            let diff = date.getTime() - currentStartDate.getTime(); 
            props.activity.timeTrackedInMs += (diff - props.workTimeInMs.current);
            props.workTimeInMs.current = diff;
        }
    }

    setTimeout(updateTimer, 1000);

    const startTracking = () => {
        props.startDate.current = new Date();
        props.startActivity(props.activity);
    }

    const stopTracking = () => {
        props.stopActivity();
    }

    const completeActivity = () => {
        if(props.activity){
            props.activity.isDone = true;
        }
        props.completeActivity();
    }

    return (<div className='activity-container flex' key={props.activity?.id}>
      <div className='activity-name flex basis-1/2'>{props.activity?.name}</div>
      <div className='activity-tacktime flex basis-1/4'>Tracked time: {((props.activity.timeTrackedInMs / 1000).toFixed(2))}s</div>
      {!props.activity.isDone && <div className='activity-actions flex basis-1/4'> 
        {!props.isCurrentActivity && <button className='activity-action-btn' onClick={() => startTracking()}>Start</button>}
        {props.isCurrentActivity && <button className='activity-action-btn' onClick={() => stopTracking()}>Stop</button>}
        <button className='activity-action-btn' onClick={() => completeActivity()}>Mark as done</button>
      </div>}
    </div>);
}