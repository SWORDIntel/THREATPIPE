
import React, { useEffect } from 'react';
import { toast } from 'sonner';
import { WS_BASE_URL } from '../constants';
import { AlertToast, RealTimeAlert } from '../components/common/AlertToast';

export const useAlerts = () => {
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const wsUrl = `${WS_BASE_URL}/alerts`;
    let ws: WebSocket | null = null;
    let reconnectTimeoutId: ReturnType<typeof setTimeout> | null = null;
    let explicitClose = false;

    const connect = () => {
      if (explicitClose || (ws && ws.readyState === WebSocket.OPEN)) return;

      ws = new WebSocket(wsUrl);
      console.log(`Attempting to connect to WebSocket: ${wsUrl}`);

      ws.onopen = (event: Event) => {
        console.log('WebSocket connected for real-time alerts.');
        toast.success('Real-time alert channel connected.', { duration: 3000 });
        if (reconnectTimeoutId) {
          clearTimeout(reconnectTimeoutId);
          reconnectTimeoutId = null;
        }
      };

      ws.onmessage = (event: MessageEvent) => {
        let messageDataStringForCatch: string | null = null; // Moved declaration to this scope
        let alertPayload: RealTimeAlert | null = null;

        try {
          const messageData = event.data;
          if (typeof messageData !== 'string') {
            console.error('Received WebSocket message data is not a string:', messageData);
            toast.error('Received unparseable alert from server (data not string).');
            return;
          }
          messageDataStringForCatch = messageData; // Assigned here

          const parsedData = JSON.parse(messageData);
          console.log('Received WebSocket message:', parsedData);


          if (parsedData.type === 'chain' && Array.isArray(parsedData.cve_chain) && typeof parsedData.risk === 'number') {
            const chainAlertData = parsedData as { type: string; cve_chain: string[]; risk: number; summary?: string; depth?: number };

            const riskScore = chainAlertData.risk;
            let severity: RealTimeAlert['severity'] = 'info';
            if (riskScore >= 3) severity = 'critical';
            else if (riskScore >= 2) severity = 'high';
            else if (riskScore >= 1) severity = 'medium';
            else severity = 'low';

            let message = `Chain: ${chainAlertData.cve_chain.join(' → ')}.`;
            if (chainAlertData.summary) {
                 message += ` Summary: ${chainAlertData.summary}`;
            }

            alertPayload = {
              id: `chain-${chainAlertData.cve_chain.join('-')}-${Date.now()}`,
              title: `New Exploit Chain (Risk: ${riskScore.toFixed(2)})`,
              message: message.trim(),
              severity: severity,
              source: 'Chain Analysis',
              timestamp: new Date().toISOString(),
            };
          }
          else if (parsedData.id && parsedData.title && parsedData.message && parsedData.severity) {
            alertPayload = parsedData as RealTimeAlert;
          }
          else {
            console.warn('Received WebSocket message of unknown structure:', parsedData);
             if (parsedData.message || parsedData.title) {
                alertPayload = {
                    id: `unknown-${Date.now()}`,
                    title: parsedData.title || 'New Notification',
                    message: parsedData.message || 'Details not fully available.',
                    severity: parsedData.severity || 'info',
                    source: parsedData.source || 'System',
                    timestamp: new Date().toISOString(),
                };
            } else {
                toast.error('Received alert with unrecognized structure from server.');
                return;
            }
          }

          if (alertPayload) {
            const currentAlertData = alertPayload; 

            const toastOptions: { duration?: number; id?: string | number } = {
              duration: currentAlertData.severity === 'critical' || currentAlertData.severity === 'high' ? Infinity : 10000,
              id: currentAlertData.id,
            };

            toast.custom(
              (tId: string | number) => ( 
                <AlertToast
                  alert={currentAlertData}
                  onDismiss={() => toast.dismiss(tId)}
                />
              ),
              toastOptions
            );
          }

        } catch (err: unknown) {
          let detailedMessage = 'Failed to parse WebSocket message.';
          const rawDataForDisplay = messageDataStringForCatch !== null ? messageDataStringForCatch : 'N-A (data not captured or not string before parse attempt)';

          if (err instanceof Error) {
            detailedMessage += ` Details: ${err.message}`;
          } else if (typeof err === 'string') {
            detailedMessage += ` Details: ${err}`;
          } else {
            detailedMessage += ` An unexpected error type was caught.`;
          }

          console.error(detailedMessage, 'Raw data during parse attempt:', rawDataForDisplay, 'Error object:', err);
          toast.error('Received unparseable or malformed alert from server.');
        }
      };

      ws.onerror = (errorEvent: Event) => {
        console.error('WebSocket error:', errorEvent);
      };

      ws.onclose = (closeEvent: CloseEvent) => {
        console.log(`WebSocket disconnected. Was clean: ${closeEvent.wasClean}, Code: ${closeEvent.code}, Reason: ${closeEvent.reason}`);
        if (!explicitClose && !reconnectTimeoutId) {
          toast.warning('Real-time alert channel disconnected. Attempting to reconnect...', { duration: 5000 });
          reconnectTimeoutId = setTimeout(() => {
            reconnectTimeoutId = null;
            connect();
          }, 5000 + Math.random() * 2000);
        }
      };
    };

    connect();

    return () => {
      explicitClose = true;
      if (reconnectTimeoutId) {
        clearTimeout(reconnectTimeoutId);
        reconnectTimeoutId = null;
      }
      if (ws) {
        console.log('Closing WebSocket connection due to component unmount or cleanup.');
        ws.close(1000, "Client disconnecting");
        ws = null;
      }
    };
  }, []);
};
