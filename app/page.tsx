'use client';
import { randomUUID } from 'crypto';
import Image from 'next/image'
import { useEffect, useState, useRef } from 'react';
import { Activity, ActivityTask} from './component/activity';
const uuid = require('uuid');

export default function Home() {
  const startDate           = useRef(new Date())
  const workTimeInMs        = useRef(0);
  
  const lastActiveDate  = useRef<Date>();
  const currentActivity = useRef<Activity>();
  const isActive        = useRef(false);
  const [inactiveTimeInSec, setInActiveTimeInSec] = useState(0);
  
  const [currentTime, setCurrentTime]             = useState(new Date());
  const [activityList, setActivityList]           = useState<Activity[]>();
  const [newActivityName, setNewActivityName]     = useState('');
  const [isClient, setIsClient] = useState(false)

  const startTracking = (activity: Activity | undefined) => {
    currentActivity.current = activity;
  }

  const stopTracking = () => {
    currentActivity.current = undefined;
    workTimeInMs.current = 0;
  }

  const updateTimer = () => {
    let date = new Date();
    // set tracking time in the case we are tracking
    if(currentActivity.current !== undefined){
      let currentLastActiveDate = lastActiveDate.current ?? date;
      let activeDiff = date.getTime() - currentLastActiveDate.getTime(); 
      setInActiveTimeInSec(activeDiff/1000)
      if(activeDiff > 5000){
        isActive.current = false;
      }

      if(activeDiff > 10000){
        stopTracking();
      }
    }
  }

  const onActive = () => {
    isActive.current = true;
    lastActiveDate.current = new Date()
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
      timeTrackedInMs: 0,
      subActivities: [],
      isDone: false
    };
    if(activityList){
      setActivityList([...activityList, newActivity]);
      return;
    }
    setActivityList([newActivity]);
  }

  const completeActivity = () => {
    currentActivity.current = undefined;
    lastActiveDate.current = new Date();
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
    if(isActive){
      const updateTime = setTimeout(updateTimer, 200);
      return () => {
        clearTimeout(updateTime);
      };
    }
  })

  const renderActivity = (activity: Activity) => {
    return ActivityTask({
      activity,
      startActivity: startTracking,
      stopActivity: stopTracking,
      completeActivity: completeActivity,
      isCurrentActivity: currentActivity.current?.id === activity.id,
      isActive,
      startDate,
      workTimeInMs
    })
  }

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
        {activityList && activityList.filter(x => !x.isDone).map((element: Activity, index) => {
            return renderActivity(element);
          })
        }
        <div className='completed-container mt-1'>
          <div className='activity-label'>Complated tasks</div>
          {activityList && activityList.filter(x => x.isDone).map((element: Activity, index) => {
              return renderActivity(element);
            })
          } 
        </div>

        <div className='activeTimer'>
          Inactive time: {inactiveTimeInSec}
        </div>
        <div>Last active date {lastActiveDate.current ? lastActiveDate.current .toISOString() : (new Date()).toISOString()}</div>
        {!isActive && <div>No activity found</div>}
      </div>
    </main>
  )
}
