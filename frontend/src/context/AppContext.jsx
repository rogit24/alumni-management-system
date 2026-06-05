import React, { createContext, useState, useEffect } from 'react';

export const AppContext = createContext();

export function AppProvider({ children }) {
  // Initial Dummy Data exactly matching your wireframes
  const [jobs, setJobs] = useState([
    { id: 1, title: 'SDE-1 @ Google', location: 'Bangalore, India', type: 'Full-time' },
    { id: 2, title: 'Dev @ Netflix', location: 'Mumbai, India', type: 'Full-time' }
  ]);

  const [applications, setApplications] = useState([
    { id: 1, studentName: 'Student A', role: 'SDE Role', status: 'Pending' },
    { id: 2, studentName: 'Student B', role: 'Dev Role', status: 'Pending' }
  ]);

  const [activities, setActivities] = useState([
    { id: 1, text: 'New User Registered', time: '2 mins ago' },
    { id: 2, text: 'Job Posted by Alumni', time: '15 mins ago' }
  ]);

  // Functions to update data (Teammates will call these)
  const addJob = (newJob) => {
    setJobs([newJob, ...jobs]);
  };

  const updateApplicationStatus = (id, newStatus) => {
    setApplications(applications.map(app => 
      app.id === id ? { ...app, status: newStatus } : app
    ));
  };

  return (
    <AppContext.Provider value={{ jobs, applications, activities, addJob, updateApplicationStatus }}>
      {children}
    </AppContext.Provider>
  );
}