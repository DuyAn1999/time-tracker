'use client';
import { randomUUID } from 'crypto';
import Image from 'next/image'
import { useEffect, useState, useRef } from 'react';
const uuid = require('uuid');

type Activity = {
  name: string;
  id: string;
  timeTrackedInSec: number;
  subActivities: Activity[];
  isDone: boolean;
}

export default function Home() {
  const [startDate, setStartDate]                 = useState(new Date())
  const [workTimeInSec, setWorkTimeInSec]         = useState(0);
  const [isTracking, setIsTracking] = useState(false);
  const currentActivity = useRef<Activity>();

  const [isActive, setIsActive]                   = useState(false);
  const [lastActiveDate, setLastActiveDate]       = useState(new Date());
  const [inactiveTimeInSec, setInActiveTimeInSec] = useState(0);
  
  const [currentTime, setCurrentTime]             = useState(new Date());
  const [activityList, setActivityList]           = useState<Activity[]>();
  const [newActivityName, setNewActivityName]     = useState('');
  const [isClient, setIsClient] = useState(false)

  const startTracking = (activity: Activity) => {
    currentActivity.current = activity;
    setIsTracking(true);
  }

  const stopTracking = () => {
    currentActivity.current = undefined;
    setIsTracking(false);
  }

  const updateTimer  = () => {
    let date = new Date();
    // set tracking time in the case we are tracking
    if(currentActivity.current !== undefined){
      let diff = date.getTime() - startDate.getTime(); 
      let newWorkTimeInSec = Math.floor(diff / 1000)
      setWorkTimeInSec(newWorkTimeInSec);
      console.log(newWorkTimeInSec - workTimeInSec);
      currentActivity.current.timeTrackedInSec += (newWorkTimeInSec - workTimeInSec);

      let activeDiff = date.getTime() - lastActiveDate.getTime(); 
      let inActiveInSec = Math.floor(activeDiff / 1000)
      setInActiveTimeInSec(inactiveTimeInSec)
      if(inActiveInSec > 5){
        setIsActive(false);
      }

      if(inActiveInSec > 10){
        currentActivity.current = undefined;
      }
    }
  }

  const onActive = () => {
    setIsActive(true)
    setLastActiveDate(new Date())
  }

  const createActivityForm = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if(newActivityName !== ''){
      createActivity(newActivityName);
      setNewActivityName('');
    }
  }

  const createActivity = (activityName: string) => {
    let newActivity: Activity = {
      name: activityName,
      id: uuid.v4(),
      timeTrackedInSec: 0,
      subActivities: [],
      isDone: false
    };
    if(activityList){
      setActivityList([...activityList, newActivity]);
      return;
    }
    setActivityList([newActivity]);
  }

  const completeActivity = (activity: Activity) => {
    activity.isDone = true;
  }

  const updateStorage = () => {
    console.log('update local storage')
    localStorage.setItem('activities', JSON.stringify(activityList));
  }

  if (typeof window !== "undefined") {
    window.onbeforeunload = () => {
      updateStorage();
    }
  }

  useEffect(() => {
    setIsClient(true);
    window.addEventListener('mousemove', onActive);
    window.addEventListener('keyup', onActive);
    window.addEventListener('onscroll', onActive);
    const clockInterval = setInterval(() => {setCurrentTime(new Date())}, 1000);
    if(localStorage.getItem('activities') !== 'undefined'){
      console.log(localStorage.getItem('activities'))
      const activityListInStorage = JSON.parse(localStorage.getItem('activities') || '[]')
      if(activityListInStorage){
        setActivityList(activityListInStorage);
      }
    }
    return () => {
      clearInterval(clockInterval);
    };
  }, [])

  useEffect(() => {
    const updateTime = setTimeout(updateTimer, 1000);
    return () => {
      clearTimeout(updateTime);
    };
  })

  useEffect(() => {
    if(currentActivity){
      setStartDate(new Date());
    }
  }, [currentActivity])

  const renderClock = () => {
    let hour = currentTime.getHours();
    let minute = currentTime.getMinutes();
    let seconds = currentTime.getSeconds();
    let timeSuffix = 'AM'
    if(hour > 12){
      hour = hour - 12;
      timeSuffix = 'PM';
    }
    return (
      <div className='clock-container flex'>
        <div>{hour}</div>:
        <div>{minute}</div>:
        <div>{seconds}</div> 
        <div>{' ' + timeSuffix}</div>
      </div>
    )
  }

  const renderActivity = (activity: Activity) => {
    let isCurrentActivity = currentActivity.current && currentActivity.current.id === activity.id;
    return (<div className='activity-container flex' key={activity.id}>
      <div className='activity-name flex basis-1/2'>{activity.name}</div>
      <div className='activity-tacktime flex basis-1/4'>Tracked time: {activity.timeTrackedInSec}</div>
      <div className='activity-actions flex basis-1/4'> 
        {!isCurrentActivity && <button className='activity-action-btn' onClick={() => startTracking(activity)}>Start</button>}
        {isCurrentActivity && <button className='activity-action-btn' onClick={() => stopTracking}>Stop</button>}
        <button className='activity-action-btn' onClick={() => completeActivity(activity)}>Mark as done</button>
      </div>
    </div>);
  }

  return (isClient &&
    <main className="flex min-h-screen flex-col items-center justify-between p-24">
      <div className='container'>
        {renderClock()}
        <div className='activity-label'>Activity list</div>
        <form onSubmit={(e) => createActivityForm(e)} className='create-activity-form flex'>
          <input 
            className='activity-create-name-input flex basis-3/4'
            placeholder='Enter the task you want to do' 
            value={newActivityName} 
            onChange={(e) => setNewActivityName(e.target.value)}>
          </input>
          <button type='submit' className='activity-create-btn flex basis-1/4'>Create new activity</button>
        </form>
        {activityList && activityList.map((element: Activity, index) => {
            return renderActivity(element);
          })
        }
        <div className='timer'>
          Current time: {workTimeInSec}
        </div>
        <div className='activeTimer'>
          Inactive time: {inactiveTimeInSec}
        </div>
        <div>Last active date {lastActiveDate.toISOString()}</div>
        {!isActive && <div>No activity found</div>}
        <div className='action-container'>
          
        </div>
      </div>
    </main>
  )
}
