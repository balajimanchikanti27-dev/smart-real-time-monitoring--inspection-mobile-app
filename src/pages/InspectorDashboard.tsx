import React from 'react';
import { useAuth } from '../context/AuthContext';
import { useFirestoreCollection } from '../hooks/useFirestore';
import type { Inspection } from '../types';
import { ClipboardList, CheckCircle, Clock } from 'lucide-react';

export const InspectorDashboard: React.FC = () => {
  const { userData } = useAuth();
  
  // In a real scenario we might need complex queries, but for now we fetch and filter
  const { data: allInspections, loading } = useFirestoreCollection<Inspection>('inspections');
  
  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  // Filter inspections assigned to this inspector
  const myAssignments = allInspections.filter(i => i.inspectorId === userData?.id);
  const pending = myAssignments.filter(i => ['ASSIGNED', 'ACCEPTED', 'IN_PROGRESS'].includes(i.status)).length;
  const completed = myAssignments.filter(i => ['SUBMITTED', 'REVIEWED', 'CLOSED'].includes(i.status)).length;

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-slate-900">Inspector Dashboard</h1>
      <p className="text-slate-600">Welcome, {userData?.name}. Here is your inspection workload.</p>

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
        <div className="bg-white overflow-hidden shadow rounded-lg border border-slate-200 p-5">
          <div className="flex items-center">
            <div className="p-3 rounded-md bg-blue-500">
              <ClipboardList className="h-6 w-6 text-white" />
            </div>
            <div className="ml-5">
              <p className="text-sm font-medium text-slate-500">Total Assigned</p>
              <p className="text-2xl font-bold text-slate-900">{myAssignments.length}</p>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow rounded-lg border border-slate-200 p-5">
          <div className="flex items-center">
            <div className="p-3 rounded-md bg-amber-500">
              <Clock className="h-6 w-6 text-white" />
            </div>
            <div className="ml-5">
              <p className="text-sm font-medium text-slate-500">Pending</p>
              <p className="text-2xl font-bold text-slate-900">{pending}</p>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow rounded-lg border border-slate-200 p-5">
          <div className="flex items-center">
            <div className="p-3 rounded-md bg-emerald-500">
              <CheckCircle className="h-6 w-6 text-white" />
            </div>
            <div className="ml-5">
              <p className="text-sm font-medium text-slate-500">Completed</p>
              <p className="text-2xl font-bold text-slate-900">{completed}</p>
            </div>
          </div>
        </div>
      </div>
      
      {/* List upcoming assignments */}
      <div className="bg-white shadow rounded-lg border border-slate-200">
        <div className="px-4 py-5 border-b border-slate-200">
          <h3 className="text-lg leading-6 font-medium text-slate-900">Upcoming Assignments</h3>
        </div>
        <div className="p-4">
          {myAssignments.length === 0 ? (
            <div className="text-center py-8">
              <ClipboardList className="mx-auto h-12 w-12 text-slate-300" />
              <p className="mt-2 text-sm text-slate-500">You have no active assignments right now.</p>
            </div>
          ) : (
            <ul className="divide-y divide-slate-200">
               {myAssignments.filter(i => ['ASSIGNED', 'ACCEPTED', 'IN_PROGRESS'].includes(i.status)).map(assignment => (
                 <li key={assignment.inspectionId} className="py-4 flex justify-between">
                   <div>
                     <p className="text-sm font-medium text-slate-900">{assignment.type} Inspection</p>
                     <p className="text-sm text-slate-500">Org ID: {assignment.organizationId}</p>
                   </div>
                   <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                     {assignment.status}
                   </span>
                 </li>
               ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
};
