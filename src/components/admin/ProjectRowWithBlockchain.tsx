import { useProjectBlockchainData } from '@/hooks/useProjectBlockchainData';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Edit, Trash2, Eye, Play, Pause, CheckCircle2, XCircle, Loader2 } from 'lucide-react';
import { calculateProjectStatus, getStatusLabel } from '@/utils/projectStatus';

interface ProjectRowProps {
  project: any;
  onView: (id: string) => void;
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
  onApprove: (id: string) => void;
  onReject: (id: string) => void;
  onPause: (id: string) => void;
  onActivate: (id: string) => void;
}

export const ProjectRowWithBlockchain = ({
  project,
  onView,
  onEdit,
  onDelete,
  onApprove,
  onReject,
  onPause,
  onActivate,
}: ProjectRowProps) => {
  const { saleInfo, isLoading: blockchainLoading } = useProjectBlockchainData(
    project.contract_address,
    60000 // Refresh every 60 seconds for admin
  );

  // Use blockchain data if available, otherwise fall back to database
  const raised = saleInfo?.fundsRaised ?? (Number(project.raised_amount || 0) / 1e18);
  const goal = saleInfo?.hardCap ?? (Number(project.goal_amount || 1) / 1e18);
  const progress = saleInfo?.progressPercentage ?? project.progress_percentage ?? 0;
  const participants = saleInfo?.contributorCount ?? project.participants_count ?? 0;

  // Calculate actual status based on dates
  const actualStatus = calculateProjectStatus(
    project.status,
    project.start_date,
    project.end_date,
    raised,
    project.soft_cap
  );
  const statusLabel = getStatusLabel(actualStatus);

  return (
    <tr className="border-b border-border/30 hover:bg-muted/20 transition-colors">
      <td className="p-4">
        <div>
          <p className="font-semibold">{project.name}</p>
          <p className="text-sm text-muted-foreground">{project.symbol}</p>
        </div>
      </td>
      <td className="p-4">
        <Badge className={
          actualStatus === 'live' ? 'bg-success' :
          actualStatus === 'pending' ? 'bg-secondary' :
          actualStatus === 'upcoming' ? 'bg-primary' :
          actualStatus === 'success' ? 'bg-success' :
          actualStatus === 'failed' ? 'bg-destructive' :
          actualStatus === 'paused' ? 'bg-secondary' :
          actualStatus === 'ended' ? 'bg-muted' :
          'bg-destructive'
        }>
          {statusLabel}
        </Badge>
      </td>
      <td className="p-4">
        <div className="space-y-1">
          <div className="flex items-center justify-between text-sm">
            <span>
              {blockchainLoading ? (
                <Loader2 className="h-3 w-3 animate-spin inline mr-1" />
              ) : (
                `${progress}%`
              )}
            </span>
          </div>
          <div className="h-2 bg-muted rounded-full overflow-hidden w-24">
            <div 
              className="h-full bg-gradient-primary transition-all duration-500"
              style={{ width: `${Math.min(progress, 100)}%` }}
            />
          </div>
        </div>
      </td>
      <td className="p-4">
        <div>
          <p className="font-semibold">
            {blockchainLoading ? (
              <Loader2 className="h-3 w-3 animate-spin inline" />
            ) : (
              `${raised.toFixed(4)} ETH`
            )}
          </p>
          <p className="text-xs text-muted-foreground">of {goal.toFixed(2)} ETH</p>
        </div>
      </td>
      <td className="p-4">
        <p className="font-semibold">
          {blockchainLoading ? (
            <Loader2 className="h-3 w-3 animate-spin inline" />
          ) : (
            participants.toLocaleString()
          )}
        </p>
      </td>
      <td className="p-4">
        <div className="text-sm">
          <p className="text-muted-foreground">{new Date(project.start_date).toLocaleDateString()}</p>
          <p className="text-muted-foreground">{new Date(project.end_date).toLocaleDateString()}</p>
        </div>
      </td>
      <td className="p-4">
        <div className="flex items-center justify-end gap-2">
          {actualStatus === 'pending' && (
            <>
              <Button 
                size="sm" 
                variant="default" 
                className="bg-success hover:bg-success/90"
                onClick={() => onApprove(project.id)}
              >
                <CheckCircle2 className="h-4 w-4 mr-1" />
                Approve
              </Button>
              <Button 
                size="sm" 
                variant="destructive"
                onClick={() => onReject(project.id)}
              >
                <XCircle className="h-4 w-4 mr-1" />
                Reject
              </Button>
            </>
          )}
          {actualStatus === 'live' && (
            <Button 
              size="sm" 
              variant="outline"
              onClick={() => onPause(project.id)}
            >
              <Pause className="h-4 w-4 mr-1" />
              Pause
            </Button>
          )}
          {actualStatus === 'paused' && (
            <Button 
              size="sm" 
              variant="default"
              className="bg-success hover:bg-success/90"
              onClick={() => onActivate(project.id)}
            >
              <Play className="h-4 w-4 mr-1" />
              Activate
            </Button>
          )}
          <Button 
            size="icon" 
            variant="ghost" 
            title="View"
            onClick={() => onView(project.id)}
          >
            <Eye className="h-4 w-4" />
          </Button>
          <Button 
            size="icon" 
            variant="ghost" 
            title="Edit"
            onClick={() => onEdit(project.id)}
          >
            <Edit className="h-4 w-4" />
          </Button>
          <Button 
            size="icon" 
            variant="ghost" 
            title="Delete" 
            className="text-destructive hover:text-destructive"
            onClick={() => onDelete(project.id)}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </td>
    </tr>
  );
};
