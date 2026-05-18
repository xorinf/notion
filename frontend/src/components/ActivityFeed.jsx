import { useEffect } from "react";
import { useActivity } from "../../store/activityStore";
import { Loader2, Clock, CheckCircle2, FileText, LayoutTemplate, MessageSquare, Trash2, Edit } from "lucide-react";

const getActionIcon = (action) => {
  switch (action) {
    case 'CREATED': return <CheckCircle2 className="w-4 h-4 text-green-500" />;
    case 'UPDATED': return <Edit className="w-4 h-4 text-blue-500" />;
    case 'DELETED': return <Trash2 className="w-4 h-4 text-red-500" />;
    default: return <Clock className="w-4 h-4 text-gray-500" />;
  }
};

const getEntityIcon = (entityType) => {
  switch (entityType) {
    case 'Page': return <FileText className="w-3 h-3" />;
    case 'Board': return <LayoutTemplate className="w-3 h-3" />;
    case 'Card': return <MessageSquare className="w-3 h-3" />;
    default: return null;
  }
};

export default function ActivityFeed({ workspaceId, entityType, entityId }) {
  const { activities, loading, fetchWorkspaceActivity, fetchEntityActivity } = useActivity();

  useEffect(() => {
    if (workspaceId && !entityType && !entityId) {
      fetchWorkspaceActivity(workspaceId);
    } else if (workspaceId && entityType && entityId) {
      fetchEntityActivity(workspaceId, entityType, entityId);
    }
  }, [workspaceId, entityType, entityId]);

  if (loading) {
    return (
      <div className="flex justify-center p-4">
        <Loader2 className="w-5 h-5 animate-spin text-gray-400" />
      </div>
    );
  }

  if (activities.length === 0) {
    return (
      <div className="text-center p-8 text-gray-400 text-sm">
        No recent activity.
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {activities.map((activity) => (
        <div key={activity._id} className="flex gap-3 text-sm">
          <div className="mt-1 flex-shrink-0">
            {getActionIcon(activity.action)}
          </div>
          <div>
            <p className="text-gray-800">
              <span className="font-semibold text-gray-900">
                {activity.performedBy?.firstName} {activity.performedBy?.lastName}
              </span>{" "}
              {activity.action.toLowerCase()}{" "}
              <span className="inline-flex items-center gap-1 bg-gray-100 text-xs px-1.5 py-0.5 rounded text-gray-600">
                {getEntityIcon(activity.entityType)} {activity.entityType}
              </span>
            </p>
            <p className="text-gray-600 mt-0.5">{activity.details}</p>
            <p className="text-xs text-gray-400 mt-1">
              {new Date(activity.createdAt).toLocaleString()}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
}
