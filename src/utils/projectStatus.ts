/**
 * Calculate the actual status of a project based on dates and soft cap
 */
export const calculateProjectStatus = (
  databaseStatus: string,
  startDate: string,
  endDate: string,
  raisedAmount: number,
  softCap: number | null
): string => {
  // If project is pending or rejected, keep that status
  if (databaseStatus === 'pending' || databaseStatus === 'rejected' || databaseStatus === 'paused') {
    return databaseStatus;
  }

  const now = new Date();
  const start = new Date(startDate);
  const end = new Date(endDate);

  // Check if ICO hasn't started yet
  if (now < start) {
    return 'upcoming';
  }

  // Check if ICO is currently active
  if (now >= start && now <= end) {
    return 'live';
  }

  // ICO has ended - check if it was successful
  if (now > end) {
    const soft = softCap || 0;
    return raisedAmount >= soft ? 'success' : 'failed';
  }

  // Fallback to database status
  return databaseStatus;
};

/**
 * Get display label for status
 */
export const getStatusLabel = (status: string): string => {
  const labels: Record<string, string> = {
    'upcoming': 'Coming Soon',
    'live': 'Live',
    'success': 'Success',
    'failed': 'Failed',
    'pending': 'Pending',
    'rejected': 'Rejected',
    'paused': 'Paused',
    'ended': 'Ended'
  };
  
  return labels[status] || status;
};
