import { useState, useEffect } from "react";
import { useAccount } from "wagmi";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Clock, Users, Zap } from "lucide-react";
import { toast } from "sonner";

export function QueueStatus({ projectId }: { projectId: string }) {
  const { address, isConnected } = useAccount();
  const [queueData, setQueueData] = useState<any>(null);
  const [joining, setJoining] = useState(false);
  const [ticketId, setTicketId] = useState<string | null>(null);

  useEffect(() => {
    let interval: any;
    
    if (ticketId) {
      // Poll for queue status updates
      interval = setInterval(async () => {
        await checkQueueStatus();
      }, 5000); // Check every 5 seconds
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [ticketId]);

  const joinQueue = async () => {
    if (!address || !isConnected) {
      toast.error('Please connect your wallet');
      return;
    }

    setJoining(true);
    try {
      const { data, error } = await supabase.functions.invoke('priority-queue', {
        body: {
          walletAddress: address,
          projectId,
        },
      });

      if (error) throw error;

      setTicketId(data.ticket_id);
      setQueueData(data);
      
      if (data.priority) {
        toast.success('Priority access granted! You can invest now.');
      } else {
        toast.success(`Joined queue at position ${data.position}`);
      }
    } catch (error: any) {
      console.error('Error joining queue:', error);
      toast.error(error.message || 'Failed to join queue');
    } finally {
      setJoining(false);
    }
  };

  const checkQueueStatus = async () => {
    if (!ticketId) return;

    try {
      const { data, error } = await supabase.functions.invoke('priority-queue', {
        body: {},
      });

      if (error) throw error;
      setQueueData(data);

      // If user reached front of queue
      if (data.position === 1) {
        toast.success('Your turn! You can now invest.');
      }
    } catch (error) {
      console.error('Error checking queue status:', error);
    }
  };

  const leaveQueue = async () => {
    if (!ticketId) return;

    try {
      await supabase.functions.invoke('priority-queue', {
        body: { ticketId },
      });

      setTicketId(null);
      setQueueData(null);
      toast.info('Left the queue');
    } catch (error: any) {
      toast.error(error.message || 'Failed to leave queue');
    }
  };

  if (!isConnected) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Queue System
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Connect your wallet to join the priority queue
          </p>
        </CardContent>
      </Card>
    );
  }

  if (queueData) {
    const etaMinutes = Math.ceil(queueData.eta_seconds / 60);
    
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Queue Status
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {queueData.priority && (
            <Badge variant="default" className="flex items-center gap-1 w-fit">
              <Zap className="h-3 w-3" />
              Priority Access
            </Badge>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-muted-foreground">Position</p>
              <p className="text-3xl font-bold">{queueData.position}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Est. Wait</p>
              <p className="text-3xl font-bold">{etaMinutes}m</p>
            </div>
          </div>

          {queueData.position === 1 ? (
            <div className="p-4 bg-green-500/10 border border-green-500/20 rounded-lg">
              <p className="text-sm font-semibold text-green-600">
                ✓ Your turn! You can invest now.
              </p>
            </div>
          ) : (
            <div className="p-4 bg-muted rounded-lg">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Clock className="h-4 w-4" />
                <span>Waiting in queue...</span>
              </div>
            </div>
          )}

          <Button 
            variant="outline" 
            onClick={leaveQueue}
            className="w-full"
          >
            Leave Queue
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Users className="h-5 w-5" />
          Priority Queue
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-sm text-muted-foreground">
          Join the queue for fair, first-come-first-served access to this token sale.
          Priority access is available for whitelisted addresses.
        </p>

        <Button 
          onClick={joinQueue} 
          disabled={joining}
          className="w-full"
        >
          {joining ? 'Joining...' : 'Join Queue'}
        </Button>
      </CardContent>
    </Card>
  );
}